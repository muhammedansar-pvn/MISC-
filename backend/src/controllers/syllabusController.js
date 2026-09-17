const academicService = require("../services/academicService");

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
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;

    const records = await academicService.getSyllabuses(filter);
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve syllabuses" });
  }
};

const handleGetSyllabusById = async (req, res) => {
  try {
    const record = await academicService.getSyllabusById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Syllabus not found" });
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

module.exports = {
  handleCreateSyllabus,
  handleGetSyllabuses,
  handleGetSyllabusById,
  handleUpdateSyllabus,
};
