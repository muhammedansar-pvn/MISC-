const academicService = require("../services/academicService");

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
    if (req.user.role === "INSTITUTION") {
      filter.institutionId = req.user.institutionId;
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

module.exports = {
  handleCreateClass,
  handleGetClasses,
  handleGetClassById,
  handleUpdateClass,
};
