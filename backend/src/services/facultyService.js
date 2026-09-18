const FacultyProfile = require("../models/FacultyProfile");
const User = require("../models/User");

const createFaculty = async (facultyData) => {
  const userExists = await User.exists({ _id: facultyData.userId });
  if (!userExists) throw new Error("User account not found");

  const existingFaculty = await FacultyProfile.exists({ facultyId: facultyData.facultyId });
  if (existingFaculty) throw new Error("Faculty ID already exists");

  return FacultyProfile.create(facultyData);
};

const getFacultyMembers = async (filter = {}) => {
  return FacultyProfile.find(filter)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .lean();
};

const getFacultyById = async (id) => {
  return FacultyProfile.findById(id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .lean();
};

const updateFaculty = async (id, updateData) => {
  return FacultyProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

module.exports = {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  updateFaculty,
};
