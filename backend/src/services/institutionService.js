const InstitutionProfile = require("../models/InstitutionProfile");
const User = require("../models/User");

const createInstitution = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) {
    throw new Error("Target user account not found");
  }

  const existingCode = await InstitutionProfile.findOne({
    institutionCode: data.institutionCode.toUpperCase(),
  });
  if (existingCode) {
    throw new Error("Institution code already exists");
  }

  const institution = await InstitutionProfile.create({
    ...data,
    institutionCode: data.institutionCode.toUpperCase(),
  });

  return institution;
};

const getInstitutions = async (filter = {}) => {
  return InstitutionProfile.find(filter).populate("userId", "name email username role status");
};

const getInstitutionById = async (id) => {
  return InstitutionProfile.findById(id).populate("userId", "name email username role status");
};

const updateInstitution = async (id, updateData) => {
  if (updateData.institutionCode) {
    updateData.institutionCode = updateData.institutionCode.toUpperCase();
  }
  return InstitutionProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

module.exports = {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
};
