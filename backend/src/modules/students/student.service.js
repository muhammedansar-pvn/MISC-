const mongoose = require("mongoose");
const User = require("../users/user.model");
const StudentProfile = require("./student.model");
const InstitutionProfile = require("../institutions/institution.model");
const Class = require("../academics/class.model");
const { generateAccountSetupToken, sendAndStoreOtp } = require("../auth/auth.service");

const generateRegistrationNumber = async (session = null) => {
  const year = new Date().getFullYear();

  let query = StudentProfile.findOne({
    registrationNumber: new RegExp(`^MISC${year}`),
  })
    .select("registrationNumber")
    .sort({ registrationNumber: -1 });

  if (session) {
    query = query.session(session);
  }

  const lastStudent = await query.lean();

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

const createStudent = async (studentData) => {
  const {
    userId,
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

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    const err = new Error("User account not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.role !== "STUDENT") {
    const err = new Error("Selected user does not have role STUDENT");
    err.statusCode = 400;
    throw err;
  }

  const existingProfile = await StudentProfile.findOne({ userId });
  if (existingProfile) {
    const err = new Error("This user already has a student profile.");
    err.statusCode = 409;
    throw err;
  }

  if (institutionId) {
    const institutionExists = await InstitutionProfile.exists({ _id: institutionId });
    if (!institutionExists) {
      const err = new Error("Institution not found");
      err.statusCode = 404;
      throw err;
    }
  }

  if (classId) {
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) {
      const err = new Error("Class not found");
      err.statusCode = 404;
      throw err;
    }
  }

  const registrationNumber = await generateRegistrationNumber();

  const studentProfile = await StudentProfile.create({
    userId: user._id,
    registrationNumber,
    nameEnglish,
    nameArabic,
    placeEnglish,
    placeArabic,
    dateOfBirth,
    admissionYear,
    classId: classId || undefined,
    institutionId: institutionId || undefined,
    contactNumber: contactNumber || user.mobile || "",
    fatherName,
    motherName,
    photo,
  });

  return StudentProfile.findById(studentProfile._id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("classId", "className section")
    .lean();
};

const getStudents = async (filter = {}) => {
  return StudentProfile.find(filter)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("classId", "className section")
    .lean();
};

const getStudentById = async (id) => {
  return StudentProfile.findById(id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("classId", "className section")
    .lean();
};

const updateStudent = async (id, updateData) => {
  return StudentProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const registerStudentWithAccount = async (payload, caller = null) => {
  const {
    email,
    name,
    username,
    mobile,
    nameEnglish,
    nameArabic,
    placeEnglish,
    placeArabic,
    dateOfBirth,
    admissionYear,
    classId,
    contactNumber,
    fatherName,
    motherName,
    photo,
  } = payload;

  if (!email) {
    const error = new Error("Email address is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  const targetUsername = username && username.trim()
    ? username.toLowerCase().trim()
    : normalizedEmail;

  // Enforce institution scoping if caller is an INSTITUTION
  let targetInstitutionId = payload.institutionId;
  if (caller && caller.role === "INSTITUTION") {
    if (!caller.institutionId) {
      const error = new Error("Caller institution profile not found");
      error.statusCode = 403;
      throw error;
    }
    targetInstitutionId = caller.institutionId;
  }

  if (targetInstitutionId) {
    const institutionExists = await InstitutionProfile.exists({ _id: targetInstitutionId });
    if (!institutionExists) {
      const error = new Error("Institution not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (classId) {
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) {
      const error = new Error("Class not found");
      error.statusCode = 404;
      throw error;
    }
  }

  // Pre-check for duplicate email or username
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: targetUsername }],
    isDeleted: { $ne: true },
  });

  if (existingUser) {
    const error = new Error(
      existingUser.email === normalizedEmail
        ? "A user with this email address already exists."
        : "A user with this username already exists."
    );
    error.statusCode = 409;
    error.code = 11000;
    throw error;
  }

  const session = await mongoose.startSession();
  let createdUser = null;
  let createdStudentProfile = null;

  const runOperation = async (sess) => {
    const sessOpt = sess ? { session: sess } : {};

    // 1. Create User
    const user = new User({
      name: (name && name.trim()) || nameEnglish.trim(),
      email: normalizedEmail,
      username: targetUsername,
      role: "STUDENT",
      status: "PENDING_SETUP",
      mobile: mobile ? mobile.trim() : (contactNumber ? contactNumber.trim() : undefined),
      emailVerified: false,
      isDeleted: false,
    });
    await user.save(sessOpt);
    createdUser = user;

    // 2. Generate Registration Number
    const registrationNumber = await generateRegistrationNumber(sess);

    // 3. Create StudentProfile
    const profileDocs = await StudentProfile.create(
      [
        {
          userId: user._id,
          registrationNumber,
          nameEnglish: nameEnglish.trim(),
          nameArabic: nameArabic ? nameArabic.trim() : undefined,
          placeEnglish: placeEnglish ? placeEnglish.trim() : undefined,
          placeArabic: placeArabic ? placeArabic.trim() : undefined,
          dateOfBirth: new Date(dateOfBirth),
          admissionYear: parseInt(admissionYear, 10),
          classId: classId || undefined,
          institutionId: targetInstitutionId || undefined,
          contactNumber: contactNumber ? contactNumber.trim() : (mobile ? mobile.trim() : ""),
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          photo: photo ? photo.trim() : undefined,
        },
      ],
      sessOpt
    );
    createdStudentProfile = profileDocs[0];
  };

  try {
    try {
      await session.withTransaction(async () => {
        await runOperation(session);
      });
    } catch (txErr) {
      if (
        txErr.message &&
        txErr.message.includes("Transaction numbers are only allowed on a replica set member or mongos")
      ) {
        console.warn("MongoDB standalone detected: executing with manual compensating rollback");
        createdUser = null;
        createdStudentProfile = null;
        try {
          await runOperation(null);
        } catch (fallbackErr) {
          if (createdUser && createdUser._id) {
            await User.findByIdAndDelete(createdUser._id);
          }
          if (createdStudentProfile && createdStudentProfile._id) {
            await StudentProfile.findByIdAndDelete(createdStudentProfile._id);
          }
          throw fallbackErr;
        }
      } else {
        throw txErr;
      }
    }
  } catch (error) {
    if (error.code === 11000 || (error.message && error.message.includes("E11000"))) {
      const conflictError = new Error("A user or student with these unique credentials already exists.");
      conflictError.statusCode = 409;
      conflictError.code = 11000;
      throw conflictError;
    }
    throw error;
  } finally {
    await session.endSession();
  }

  // Post-commit: trigger OTP / email verification flow
  let otpData = null;
  try {
    const otpResult = await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION", {
      userId: createdUser._id,
    });
    if (otpResult && otpResult.success) {
      otpData = {
        verificationId: otpResult.verificationId,
        maskedEmail: otpResult.maskedEmail,
        expiresAt: otpResult.expiresAt,
      };
    }
  } catch (mailError) {
    console.error("Post-commit OTP email error:", mailError.message);
  }

  const populated = await StudentProfile.findById(createdStudentProfile._id)
    .populate("userId", "name email username role status mobile emailVerified")
    .populate("institutionId", "institutionName institutionCode type")
    .populate("classId", "name code")
    .lean();

  return {
    student: populated,
    ...otpData,
  };
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  generateRegistrationNumber,
  registerStudentWithAccount,
};

