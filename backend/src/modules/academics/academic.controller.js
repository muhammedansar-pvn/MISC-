const academicService = require("./academic.service");

// Academic Year Controllers
const handleCreateAcademicYear = async (req, res) => {
  try {
    const record = await academicService.createAcademicYear(req.body);
    return res.status(201).json({ success: true, message: "Academic year created successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create academic year" });
  }
};

const handleGetAcademicYears = async (req, res) => {
  try {
    const records = await academicService.getAcademicYears();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve academic years" });
  }
};

const handleGetAcademicYearById = async (req, res) => {
  try {
    const record = await academicService.getAcademicYearById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Academic year not found" });
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve academic year" });
  }
};

const handleUpdateAcademicYear = async (req, res) => {
  try {
    const record = await academicService.updateAcademicYear(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: "Academic year not found" });
    return res.status(200).json({ success: true, message: "Academic year updated successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update academic year" });
  }
};

// Class Controllers
const handleCreateClass = async (req, res) => {
  try {
    const record = await academicService.createClass(req.body);
    return res.status(201).json({ success: true, message: "Class created successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create class" });
  }
};

const handleGetClasses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.academicYearId) {
      filter.academicYearId = req.query.academicYearId;
    }
    const records = await academicService.getClasses(filter);
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve classes" });
  }
};

const handleGetClassById = async (req, res) => {
  try {
    const record = await academicService.getClassById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Class not found" });
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve class" });
  }
};

const handleUpdateClass = async (req, res) => {
  try {
    const record = await academicService.updateClass(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: "Class not found" });
    return res.status(200).json({ success: true, message: "Class updated successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update class" });
  }
};

// Subject Controllers
const handleCreateSubject = async (req, res) => {
  try {
    const record = await academicService.createSubject(req.body);
    return res.status(201).json({ success: true, message: "Subject created successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create subject" });
  }
};

const handleGetSubjects = async (req, res) => {
  try {
    const records = await academicService.getSubjects();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve subjects" });
  }
};

const handleGetSubjectById = async (req, res) => {
  try {
    const record = await academicService.getSubjectById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve subject" });
  }
};

const handleUpdateSubject = async (req, res) => {
  try {
    const record = await academicService.updateSubject(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, message: "Subject updated successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update subject" });
  }
};

// Syllabus Controllers
const handleCreateSyllabus = async (req, res) => {
  try {
    const record = await academicService.createSyllabus(req.body);
    return res.status(201).json({ success: true, message: "Syllabus created successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create syllabus" });
  }
};

const handleGetSyllabuses = async (req, res) => {
  try {
    const filter = {};

    // Strict Class Scoping for Students
    if (req.user?.role === "STUDENT") {
      let classId = req.user.classId;
      if (!classId) {
        const StudentProfile = require("../students/student.model");
        const profile = await StudentProfile.findOne({ userId: req.user.userId || req.user.id }).lean();
        classId = profile?.classId;
      }
      if (!classId) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      filter.classId = classId;
      filter.status = "ACTIVE";
    } else {
      if (req.query.classId) filter.classId = req.query.classId;
      if (req.query.status) filter.status = req.query.status.toUpperCase();
    }

    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;

    const search = req.query.search || "";

    const records = await academicService.getSyllabuses(filter, search);
    return res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve syllabuses" });
  }
};

const handleGetSyllabusById = async (req, res) => {
  try {
    const record = await academicService.getSyllabusById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Syllabus not found" });

    // Enforce class isolation for students
    if (req.user?.role === "STUDENT") {
      let classId = req.user.classId;
      if (!classId) {
        const StudentProfile = require("../students/student.model");
        const profile = await StudentProfile.findOne({ userId: req.user.userId || req.user.id }).lean();
        classId = profile?.classId;
      }
      const recordClassId = record.classId?._id?.toString() || record.classId?.toString();
      if (!classId || recordClassId !== classId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Syllabus does not belong to your enrolled class",
        });
      }
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve syllabus" });
  }
};

const handleUpdateSyllabus = async (req, res) => {
  try {
    const record = await academicService.updateSyllabus(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: "Syllabus not found" });
    return res.status(200).json({ success: true, message: "Syllabus updated successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update syllabus" });
  }
};

const handleDeleteSyllabus = async (req, res) => {
  try {
    const hardDelete = req.query.permanent === "true";
    const result = await academicService.deleteSyllabus(req.params.id, hardDelete);
    if (!result) return res.status(404).json({ success: false, message: "Syllabus not found" });
    return res.status(200).json({
      success: true,
      message: hardDelete ? "Syllabus permanently deleted" : "Syllabus deactivated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete syllabus" });
  }
};

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const handleUploadSyllabusFile = async (req, res) => {
  try {
    const { fileName, fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ success: false, message: "No file data provided" });
    }

    let base64Content = fileData;
    if (fileData.includes(";base64,")) {
      base64Content = fileData.split(";base64,")[1];
    }

    const buffer = Buffer.from(base64Content, "base64");

    // Validate file size (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ success: false, message: "File exceeds 15MB size limit" });
    }

    // Validate extension
    const originalExt = path.extname(fileName || "").toLowerCase() || ".pdf";
    const allowedExts = [".pdf", ".doc", ".docx"];
    if (!allowedExts.includes(originalExt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only PDF, DOC, and DOCX files are allowed.",
      });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../../../uploads/syllabuses");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const safeName = path.basename(fileName || "syllabus", originalExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const uniqueFileName = `${safeName}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${originalExt}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/syllabuses/${uniqueFileName}`;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileUrl,
        fileName: fileName || uniqueFileName,
        fileSize: buffer.length,
      },
    });
  } catch (error) {
    console.error("Upload syllabus file error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload syllabus file: " + error.message });
  }
};

module.exports = {
  handleCreateAcademicYear,
  handleGetAcademicYears,
  handleGetAcademicYearById,
  handleUpdateAcademicYear,
  handleCreateClass,
  handleGetClasses,
  handleGetClassById,
  handleUpdateClass,
  handleCreateSubject,
  handleGetSubjects,
  handleGetSubjectById,
  handleUpdateSubject,
  handleCreateSyllabus,
  handleGetSyllabuses,
  handleGetSyllabusById,
  handleUpdateSyllabus,
  handleDeleteSyllabus,
  handleUploadSyllabusFile,
};
