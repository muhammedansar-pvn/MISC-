const timetableService = require("./timetable.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleCreateTimetableEntry = async (req, res) => {
  try {
    const entry = await timetableService.createTimetableEntry(req.body);
    return res.status(201).json({
      success: true,
      message: "Timetable period entry created successfully",
      data: entry,
    });
  } catch (error) {
    const status = error.statusCode || (error.message && error.message.includes("clash") ? 409 : 400);
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to create timetable entry",
    });
  }
};

const handleGetTimetableEntries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.institutionId) filter.institutionId = req.query.institutionId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await timetableService.getTimetableEntries(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve timetable entries",
    });
  }
};

const handleGetTimetableEntryById = async (req, res) => {
  try {
    const entry = await timetableService.getTimetableEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve timetable entry",
    });
  }
};

const handleUpdateTimetableEntry = async (req, res) => {
  try {
    const entry = await timetableService.updateTimetableEntry(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Timetable period entry updated successfully",
      data: entry,
    });
  } catch (error) {
    const status = error.statusCode || (error.message && error.message.includes("clash") ? 409 : 400);
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to update timetable entry",
    });
  }
};

const handleDeleteTimetableEntry = async (req, res) => {
  try {
    await timetableService.deleteTimetableEntry(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Timetable period entry deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete timetable entry",
    });
  }
};

const handleGetMyTimetable = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const timetableData = await timetableService.getStudentTimetable(userId);
    return res.status(200).json({
      success: true,
      data: timetableData,
    });
  } catch (error) {
    console.error("Get Student Timetable Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your timetable",
    });
  }
};

module.exports = {
  handleCreateTimetableEntry,
  handleGetTimetableEntries,
  handleGetTimetableEntryById,
  handleUpdateTimetableEntry,
  handleDeleteTimetableEntry,
  handleGetMyTimetable,
};
