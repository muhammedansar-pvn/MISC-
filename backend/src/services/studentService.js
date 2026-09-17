const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const InstitutionProfile = require("../models/InstitutionProfile");
const Class = require("../models/Class");
const { generateAccountSetupToken } = require("./accountSetupService");

const createStudent = async (studentData) => {
  const {
    nameEnglish,
    nameArabic,
    placeEnglish,
    placeArabic,
    dateOfBirth,
    admissionYear,
    classId,
    institutionId,
    contactNumber,
    fatherName,
    motherName,
    photo,
  } = studentData;

  if (institutionId) {
    const institution = await InstitutionProfile.findById(institutionId);
    if (!institution) throw new Error("Institution not found");
  }

  if (classId) {
    const studentClass = await Class.findById(classId);
    if (!studentClass) throw new Error("Class not found");
  }

  const registrationNumber = await generateRegistrationNumber();

  const user = await User.create({
    role: "STUDENT",
    status: "PENDING_SETUP",
    mobile: contactNumber,
  });

  try {
    const studentProfile = await StudentProfile.create({
      userId: user._id,
      registrationNumber,
      nameEnglish,
      nameArabic,
      placeEnglish,
      placeArabic,
      dateOfBirth,
      admissionYear,
      classId,
      institutionId,
      contactNumber,
      fatherName,
      motherName,
      photo,
    });

    const setup = await generateAccountSetupToken(user._id, "ACCOUNT_SETUP");

    return {
      user,
      studentProfile,
      setupLink: setup.setupLink,
      setupExpiresAt: setup.expiresAt,
    };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

const getStudents = async (filter = {}) => {
  return StudentProfile.find(filter)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId")
    .populate("classId");
};

const getStudentById = async (id) => {
  return StudentProfile.findById(id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId")
    .populate("classId");
};

const updateStudent = async (id, updateData) => {
  return StudentProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const generateRegistrationNumber = async () => {
  const year = new Date().getFullYear();

  const lastStudent = await StudentProfile.findOne({
    registrationNumber: new RegExp(`^MISC${year}`),
  })
    .sort({ registrationNumber: -1 })
    .lean();

  let nextNumber = 1;

  if (lastStudent) {
    const lastNumber = parseInt(
      lastStudent.registrationNumber.replace(`MISC${year}`, ""),
      10
    );
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `MISC${year}${String(nextNumber).padStart(4, "0")}`;
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
};