const FacultyProfile = require("./faculty.model");
const User = require("../users/user.model");

const createFaculty = async (facultyData) => {
  const user = await User.findById(facultyData.userId);
  if (!user || user.isDeleted) {
    const err = new Error("User account not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.role !== "FACULTY") {
    const err = new Error("Selected user does not have role FACULTY");
    err.statusCode = 400;
    throw err;
  }

  const existingProfileByUser = await FacultyProfile.findOne({ userId: facultyData.userId });
  if (existingProfileByUser) {
    const err = new Error("This user already has a faculty profile.");
    err.statusCode = 409;
    throw err;
  }

  const existingFaculty = await FacultyProfile.exists({ facultyId: facultyData.facultyId });
  if (existingFaculty) {
    const err = new Error("Faculty ID already exists");
    err.statusCode = 409;
    throw err;
  }

  const createdFaculty = await FacultyProfile.create(facultyData);
  return FacultyProfile.findById(createdFaculty._id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .lean();
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
