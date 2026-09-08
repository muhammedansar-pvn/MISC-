const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Campus = require("../models/Campus");
const Class = require("../models/Class");
const {
  generateAccountSetupToken,
} = require("./accountSetupService");

const createStudent = async (studentData) => {
  const {
    nameEnglish,
    nameArabic,
    placeEnglish,
    placeArabic,
    dateOfBirth,
    admissionYear,
    classId,
    campusId,
    contactNumber,
    fatherName,
    motherName,
    photo,
  } = studentData;

  // 1. Verify campus
  const campus = await Campus.findById(campusId);

  if (!campus) {
    throw new Error("Campus not found");
  }

  // 2. Verify class
  const studentClass = await Class.findById(classId);

  if (!studentClass) {
    throw new Error("Class not found");
  }

  // 3. Make sure class belongs to selected campus
  if (studentClass.campusId.toString() !== campusId.toString()) {
    throw new Error("Class does not belong to the selected campus");
  }

  // 4. Generate unique registration number
  const registrationNumber = await generateRegistrationNumber();

  // 5. Create User account
  const user = await User.create({
    role: "STUDENT",
    status: "PENDING_SETUP",
    mobile: contactNumber,
  });

  try {
    // 6. Create Student Profile
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
      campusId,
      contactNumber,
      fatherName,
      motherName,
      photo,
    });

    // 7. Generate Account Setup Token & Link
    const setup = await generateAccountSetupToken(user._id);

    // 8. Return complete registration result
    return {
      user,
      studentProfile,
      setupLink: setup.setupLink,
      setupExpiresAt: setup.expiresAt,
    };
  } catch (error) {
    // Remove User if StudentProfile or setup creation fails
    await User.findByIdAndDelete(user._id);

    throw error;
  }
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

    nextNumber = lastNumber + 1;
  }

  return `MISC${year}${String(nextNumber).padStart(4, "0")}`;
};

module.exports = {
  createStudent,
};