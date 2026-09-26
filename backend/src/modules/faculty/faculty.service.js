const FacultyProfile = require("./faculty.model");
const User = require("../users/user.model");

const createFaculty = async (facultyData) => {
  const user = await User.findById(facultyData.userId);
  if (!user || user.isDeleted) {
    const err = new Error("User account not found");
    err.statusCode = 404;
    throw err;
  }

  const allowedRoles = ["ASATITHA", "FACULTY", "HOD", "PRINCIPAL"];
  if (!allowedRoles.includes(user.role)) {
    const err = new Error(`Selected user must have one of the following roles: ${allowedRoles.join(", ")}`);
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
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const getFacultyMembers = async (filter = {}, search = "") => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { facultyId: searchRegex },
      { nameEnglish: searchRegex },
      { nameArabic: searchRegex },
      { contactNumber: searchRegex },
      { department: searchRegex },
    ];
  }

  return FacultyProfile.find(query)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .sort({ createdAt: -1 })
    .lean();
};

const getFacultyById = async (id) => {
  return FacultyProfile.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const updateFaculty = async (id, updateData) => {
  return FacultyProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const deleteFaculty = async (id, hardDelete = false) => {
  if (hardDelete) {
    return FacultyProfile.findByIdAndDelete(id);
  }
  return FacultyProfile.findByIdAndUpdate(
    id,
    { status: "INACTIVE", isDeleted: true },
    { new: true }
  );
};

module.exports = {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};
