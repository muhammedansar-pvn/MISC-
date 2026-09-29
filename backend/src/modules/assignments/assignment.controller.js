const assignmentService = require("./assignment.service");
const FacultyProfile = require("../faculty/faculty.model");

exports.handleCreateAssignment = async (req, res) => {
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

    if (!req.body.title || !req.body.classId || !req.body.subjectId || !req.body.dueDate) {
      return res.status(400).json({
        success: false,
        message: "title, classId, subjectId, and dueDate are required",
      });
    }

    const payload = {
      title: req.body.title,
      description: req.body.description,
      classId: req.body.classId,
      subjectId: req.body.subjectId,
      facultyId,
      dueDate: req.body.dueDate,
    };

    const files = req.files || (req.file ? [req.file] : []);
    const assignment = await assignmentService.createAssignment(payload, files);

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create assignment",
    });
  }
};

exports.handleGetAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;

    const result = await assignmentService.getAssignments(filter, req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Assignments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assignments",
    });
  }
};

exports.handleGetAssignmentById = async (req, res) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get Assignment By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assignment",
    });
  }
};

exports.handleDeleteAssignment = async (req, res) => {
  try {
    const result = await assignmentService.deleteAssignment(req.params.id, req.user);
    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
    });
  }
};

exports.handleSubmitAssignment = async (req, res) => {
  try {
    const result = await assignmentService.submitAssignment(
      req.params.id,
      req.user,
      req.body,
      req.file
    );

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Submit Assignment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit assignment",
    });
  }
};

exports.handleGetSubmissions = async (req, res) => {
  try {
    const result = await assignmentService.getAssignmentSubmissions(req.params.id, req.user);
    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Submissions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve submissions",
    });
  }
};

exports.handleGetMySubmission = async (req, res) => {
  try {
    const result = await assignmentService.getStudentSubmission(req.params.id, req.user);
    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get My Submission Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve submission",
    });
  }
};
