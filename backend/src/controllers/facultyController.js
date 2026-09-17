const {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  updateFaculty,
} = require("../services/facultyService");

const handleCreateFaculty = async (req, res) => {
  try {
    const faculty = await createFaculty(req.body);
    return res.status(201).json({ success: true, message: "Faculty profile created successfully", data: faculty });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create faculty profile" });
  }
};

const handleGetFacultyMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "INSTITUTION") {
      filter.institutionId = req.user.institutionId;
    }
    const members = await getFacultyMembers(filter);
    return res.status(200).json({ success: true, data: members });
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

module.exports = {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
};
