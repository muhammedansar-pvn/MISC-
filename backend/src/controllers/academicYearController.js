const academicService = require("../services/academicService");

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

module.exports = {
  handleCreateAcademicYear,
  handleGetAcademicYears,
  handleGetAcademicYearById,
  handleUpdateAcademicYear,
};
