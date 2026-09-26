const {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("./faculty.service");

const handleCreateFaculty = async (req, res) => {
  try {
    const faculty = await createFaculty(req.body);
    return res.status(201).json({ success: true, message: "Faculty profile created successfully", data: faculty });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create faculty profile" });
  }
};

const handleGetFacultyMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status.toUpperCase();
    const search = req.query.search || "";

    const members = await getFacultyMembers(filter, search);
    return res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty members" });
  }
};

const handleGetFacultyById = async (req, res) => {
  try {
    const member = await getFacultyById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({ success: true, data: member });
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
    return res.status(400).json({ success: false, message: error.message || "Failed to update faculty profile" });
  }
};

const handleDeleteFaculty = async (req, res) => {
  try {
    const hardDelete = req.query.permanent === "true";
    const result = await deleteFaculty(req.params.id, hardDelete);
    if (!result) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({
      success: true,
      message: hardDelete ? "Faculty profile permanently deleted" : "Faculty profile deactivated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete faculty member" });
  }
};

module.exports = {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
  handleDeleteFaculty,
};
