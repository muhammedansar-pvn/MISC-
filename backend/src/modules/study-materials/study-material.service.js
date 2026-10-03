const mongoose = require("mongoose");
const StudyMaterial = require("./study-material.model");
const FacultyProfile = require("../faculty/faculty.model");
const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

exports.createStudyMaterial = async (data, file = null) => {
  await assertFacultyAvailableForAssignment(data.facultyId);

  let fileUrl = data.fileUrl;
  let fileName = data.fileName || "";
  let fileType = data.fileType || "";
  let fileSize = data.fileSize || 0;

  if (file) {
    fileUrl = `/uploads/${file.filename}`;
    fileName = file.originalname;
    fileType = file.mimetype;
    fileSize = file.size;
  }

  if (!fileUrl) {
    throw new Error("A file upload or valid fileUrl is required");
  }

  const material = await StudyMaterial.create({
    title: data.title,
    classId: data.classId,
    subjectId: data.subjectId,
    facultyId: data.facultyId,
    chapter: data.chapter || "",
    fileUrl,
    fileName,
    fileType,
    fileSize,
  });

  return await StudyMaterial.findById(material._id)
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId");
};

exports.getStudyMaterials = async (filter = {}, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const mongoFilter = { isDeleted: false };
  if (filter.classId) mongoFilter.classId = filter.classId;
  if (filter.subjectId) mongoFilter.subjectId = filter.subjectId;
  if (filter.facultyId) mongoFilter.facultyId = filter.facultyId;
  if (filter.chapter) mongoFilter.chapter = new RegExp(filter.chapter, "i");

  const [materials, total] = await Promise.all([
    StudyMaterial.find(mongoFilter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("classId", "name code")
      .populate("subjectId", "subjectName subjectCode")
      .populate("facultyId", "nameEnglish facultyId"),
    StudyMaterial.countDocuments(mongoFilter),
  ]);

  return formatPaginatedResponse({ data: materials, total, page, limit });
};

exports.getStudyMaterialById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await StudyMaterial.findOne({ _id: id, isDeleted: false })
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId");
};

exports.deleteStudyMaterial = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Invalid ID", status: 400 };

  const material = await StudyMaterial.findOne({ _id: id, isDeleted: false });
  if (!material) return { error: "Study material not found", status: 404 };

  if (user.role === "FACULTY") {
    let facultyProfileId = user.facultyId;
    if (!facultyProfileId) {
      const fp = await FacultyProfile.findOne({ userId: user.userId || user.id });
      facultyProfileId = fp?._id;
    }
    if (!facultyProfileId || material.facultyId.toString() !== facultyProfileId.toString()) {
      return { error: "Unauthorized: You can only delete your own study materials", status: 403 };
    }
  }

  material.isDeleted = true;
  await material.save();

  return { success: true, message: "Study material deleted successfully" };
};
