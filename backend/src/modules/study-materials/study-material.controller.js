const studyMaterialService = require("./study-material.service");
const FacultyProfile = require("../faculty/faculty.model");
const { isFacultyAssigned } = require("../academics/academic-auth.service");

exports.handleCreateStudyMaterial = async (req, res) => {
  try {
    let facultyId = req.body.facultyId;
    if (!facultyId && req.user.role === "FACULTY") {
      let facultyProfileId = req.user.facultyId;
      if (!facultyProfileId) {
        const fp = await FacultyProfile.findOne({ userId: req.user.userId || req.user.id });
        facultyProfileId = fp?._id;
      }
      facultyId = facultyProfileId;
    }

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "facultyId is required",
      });
    }

    if (!req.body.title || !req.body.classId || !req.body.subjectId) {
      return res.status(400).json({
        success: false,
        message: "title, classId, and subjectId are required",
      });
    }

    if (req.user.role === "FACULTY") {
      const isAssigned = await isFacultyAssigned({
        facultyId,
        classId: req.body.classId,
        subjectId: req.body.subjectId,
      });
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not assigned to teach this class and subject",
        });
      }
    }

    if (!req.file && !req.body.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File upload or fileUrl is required",
      });
    }

    const payload = {
      title: req.body.title,
      classId: req.body.classId,
      subjectId: req.body.subjectId,
      facultyId,
      chapter: req.body.chapter,
      fileUrl: req.body.fileUrl,
    };

    const material = await studyMaterialService.createStudyMaterial(payload, req.file);

    return res.status(201).json({
      success: true,
      message: "Study material created successfully",
      data: material,
    });
  } catch (error) {
    console.error("Create Study Material Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create study material",
    });
  }
};

exports.handleGetStudyMaterials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.chapter) filter.chapter = req.query.chapter;

    if (req.user?.role === "FACULTY" && !filter.facultyId) {
      const fp = await FacultyProfile.findOne({ userId: req.user.userId || req.user.id });
      if (fp) {
        filter.facultyId = fp._id;
      }
    }

    const result = await studyMaterialService.getStudyMaterials(filter, req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Study Materials Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve study materials",
    });
  }
};

exports.handleGetStudyMaterialById = async (req, res) => {
  try {
    const material = await studyMaterialService.getStudyMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error("Get Study Material By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve study material",
    });
  }
};

exports.handleDeleteStudyMaterial = async (req, res) => {
  try {
    const result = await studyMaterialService.deleteStudyMaterial(req.params.id, req.user);
    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Study Material Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete study material",
    });
  }
};
