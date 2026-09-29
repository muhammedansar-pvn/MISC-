const User = require("../users/user.model");
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
} = require("./institution.service");

const handleCreateInstitution = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.userId) {
      const email = (data.email || `inst_${Date.now()}@markaz.in`).toLowerCase().trim();
      let instUser = await User.findOne({ email });
      if (!instUser) {
        instUser = await User.create({
          name: data.institutionName,
          email,
          username: `inst_${Date.now()}`,
          role: "INSTITUTION",
          status: "ACTIVE",
        });
      }
      data.userId = instUser._id;
    }
    const institution = await createInstitution(data);
    return res.status(201).json({
      success: true,
      message: "Institution created successfully",
      data: institution,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create institution" });
  }
};

const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleGetInstitutions = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "INSTITUTION") {
      filter._id = req.user.institutionId;
    }
    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await getInstitutions(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve institutions" });
  }
};

const handleGetInstitutionById = async (req, res) => {
  try {
    const institution = await getInstitutionById(req.params.id);
    if (!institution) {
      return res.status(404).json({ success: false, message: "Institution not found" });
    }
    return res.status(200).json({ success: true, data: institution });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve institution" });
  }
};

const handleUpdateInstitution = async (req, res) => {
  try {
    const institution = await updateInstitution(req.params.id, req.body);
    if (!institution) {
      return res.status(404).json({ success: false, message: "Institution not found" });
    }
    return res.status(200).json({ success: true, message: "Institution updated successfully", data: institution });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update institution" });
  }
};

module.exports = {
  handleCreateInstitution,
  handleGetInstitutions,
  handleGetInstitutionById,
  handleUpdateInstitution,
};
