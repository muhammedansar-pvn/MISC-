const academicService = require("../services/academicService");

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

module.exports = {
  handleCreateSubject,
  handleGetSubjects,
  handleGetSubjectById,
  handleUpdateSubject,
};
