const {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  getFacultyDetails,
  updateFaculty,
  updateFacultyStatus,
  deleteFaculty,
  getFacultyDashboardStats,
  getFacultyMyTimetable,
  getFacultyMyStudents,
  getFacultyStudent360,
  createFacultyRemark,
  getFacultyRemarks,
} = require("./faculty.service");
const FacultyProfile = require("./faculty.model");
const User = require("../users/user.model");
const { removeUploadedFile } = require("../../middleware/upload.middleware");

const handleCreateFaculty = async (req, res) => {
  try {
    const faculty = await createFaculty(req.body);
    return res.status(201).json({ success: true, message: "Faculty profile created successfully", data: faculty });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create faculty profile" });
  }
};

const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleGetFacultyMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status.toUpperCase();
    const search = req.query.search || "";

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await getFacultyMembers(filter, search, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty members" });
  }
};

const handleGetFacultyById = async (req, res) => {
  try {
    let targetId = req.params.id;
    if (targetId === "profile" || targetId === "me" || !targetId) {
      targetId = req.user?.facultyId || req.user?.userId || req.user?.id;
    }

    const isDetailsRequest = Boolean(req.params.id);
    const member = isDetailsRequest
      ? await getFacultyDetails(targetId)
      : await getFacultyById(targetId);
    if (!member) {
      if (isDetailsRequest) {
        return res.status(404).json({ success: false, message: "Faculty member not found" });
      }
      return res.status(200).json({
        success: true,
        isSetupPending: true,
        data: null,
        message: "Faculty profile not yet set up",
      });
    }
    return res.status(200).json({ success: true, isSetupPending: false, data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty member" });
  }
};

const handleUpdateFaculty = async (req, res) => {
  try {
    const member = await updateFaculty(req.params.id, req.body);
    if (!member) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({ success: true, message: "Faculty updated successfully", data: member });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to update faculty profile" });
  }
};

const handleUpdateFacultyStatus = async (req, res) => {
  try {
    const member = await updateFacultyStatus(req.params.id, req.body.status);
    if (!member) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({
      success: true,
      message: `Faculty status updated to ${member.userId?.status || member.status}`,
      data: member,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update faculty status",
    });
  }
};

const handleDeleteFaculty = async (req, res) => {
  try {
    const result = await deleteFaculty(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({
      success: true,
      message: "Faculty profile deleted successfully; academic records were preserved",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to delete faculty member" });
  }
};

const handleGetFacultyDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const stats = await getFacultyDashboardStats(userId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Get Faculty Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty dashboard statistics" });
  }
};

const handleGetFacultyMyTimetable = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const timetable = await getFacultyMyTimetable(userId);
    return res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve timetable" });
  }
};

const handleGetFacultyMyStudents = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const classId = req.query.classId || null;
    const students = await getFacultyMyStudents(userId, classId);
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve students" });
  }
};

const handleGetFacultyStudent360 = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const result = await getFacultyStudent360(userId, studentId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve student profile" });
  }
};

const handleCreateFacultyRemark = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const remark = await createFacultyRemark(userId, studentId, req.body);
    return res.status(201).json({ success: true, message: "Remark added successfully", data: remark });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to add remark" });
  }
};

const handleGetFacultyRemarks = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const remarks = await getFacultyRemarks(userId, studentId);
    return res.status(200).json({ success: true, data: remarks });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve remarks" });
  }
};

const handleGetMyProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const member = await getFacultyById(userId);
    if (!member) {
      return res.status(200).json({
        success: true,
        isSetupPending: true,
        data: null,
        message: "Faculty profile not yet set up",
      });
    }
    return res.status(200).json({ success: true, isSetupPending: false, data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty profile" });
  }
};

const handleUpdateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const faculty = await FacultyProfile.findOne({ userId, isDeleted: { $ne: true } });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    const allowedUpdates = [
      "nameEnglish",
      "nameArabic",
      "placeEnglish",
      "placeArabic",
      "designation",
      "islamicQualification",
      "academicQualification",
      "previousExperience",
      "contactNumber",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (req.body.name && !updates.nameEnglish) {
      updates.nameEnglish = req.body.name;
    }
    if (req.body.mobile && !updates.contactNumber) {
      updates.contactNumber = req.body.mobile;
    }

    const updated = await FacultyProfile.findByIdAndUpdate(
      faculty._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email pendingEmail username role status mobile")
      .populate("institutionId", "name code")
      .populate("assignedClasses", "name code")
      .populate("assignedSubjects", "subjectName subjectCode category");

    // Sync to User model
    const userUpdates = {};
    if (updates.nameEnglish) userUpdates.name = updates.nameEnglish;
    if (updates.contactNumber) userUpdates.mobile = updates.contactNumber;
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdates });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update faculty profile",
    });
  }
};

const handleUploadMyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image file to upload." });
    }

    const userId = req.user?.userId || req.user?.id;
    const faculty = await FacultyProfile.findOne({ userId, isDeleted: { $ne: true } });
    if (!faculty) {
      removeUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    if (faculty.photo) {
      removeUploadedFile(faculty.photo);
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    faculty.photo = photoUrl;
    await faculty.save();

    const updated = await FacultyProfile.findById(faculty._id)
      .populate("userId", "name email pendingEmail username role status mobile")
      .populate("institutionId", "name code")
      .populate("assignedClasses", "name code")
      .populate("assignedSubjects", "subjectName subjectCode category");

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: updated,
      photoUrl,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile photo",
    });
  }
};

const handleDeleteMyPhoto = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const faculty = await FacultyProfile.findOne({ userId, isDeleted: { $ne: true } });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    if (faculty.photo) {
      removeUploadedFile(faculty.photo);
    }

    faculty.photo = "";
    await faculty.save();

    const updated = await FacultyProfile.findById(faculty._id)
      .populate("userId", "name email pendingEmail username role status mobile")
      .populate("institutionId", "name code")
      .populate("assignedClasses", "name code")
      .populate("assignedSubjects", "subjectName subjectCode category");

    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove profile photo",
    });
  }
};

module.exports = {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleGetMyProfile,
  handleUpdateMyProfile,
  handleUploadMyPhoto,
  handleDeleteMyPhoto,
  handleUpdateFaculty,
  handleUpdateFacultyStatus,
  handleDeleteFaculty,
  handleGetFacultyDashboard,
  handleGetFacultyMyTimetable,
  handleGetFacultyMyStudents,
  handleGetFacultyStudent360,
  handleCreateFacultyRemark,
  handleGetFacultyRemarks,
};
