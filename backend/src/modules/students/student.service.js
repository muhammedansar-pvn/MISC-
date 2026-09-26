const mongoose = require("mongoose");
const User = require("../users/user.model");
const StudentProfile = require("./student.model");
const InstitutionProfile = require("../institutions/institution.model");
const Class = require("../academics/class.model");
const { generateAccountSetupToken, sendAndStoreOtp, maskEmail } = require("../auth/auth.service");
const OtpVerification = require("../auth/otp-verification.model");
const studentLifecycleService = require("./student-lifecycle.service");

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
    biometricId: studentData.biometricId || undefined,
    house: studentData.house || undefined,
    mentorId: studentData.mentorId || undefined,
    disciplineScore: studentData.disciplineScore !== undefined ? studentData.disciplineScore : 100,
    skills: studentData.skills || undefined,
    parentUserId: studentData.parentUserId || undefined,
  });

  return StudentProfile.findById(studentProfile._id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("classId", "name code")
    .lean();
};

const getStudents = async (filter = {}, search = "") => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { registrationNumber: searchRegex },
      { nameEnglish: searchRegex },
      { nameArabic: searchRegex },
      { contactNumber: searchRegex },
      { fatherName: searchRegex },
    ];
  }

  const profiles = await StudentProfile.find(query)
    .populate("userId", "name email username role status mobile isDeleted")
    .populate("institutionId", "name code")
    .populate("classId", "name code")
    .sort({ createdAt: -1 })
    .lean();

  // Exclude orphan profiles where user is missing or marked deleted
  return profiles.filter((p) => p.userId && p.userId.isDeleted !== true);
};

const getStudentById = async (id) => {
  const profile = await StudentProfile.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("userId", "name email username role status mobile isDeleted")
    .populate("institutionId", "name code")
    .populate("classId", "name code")
    .lean();

  if (!profile || !profile.userId || profile.userId.isDeleted === true) {
    return null;
  }
  return profile;
};

const updateStudent = async (id, updateData) => {
  const profile = await StudentProfile.findById(id);
  if (!profile) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }

  const { email, name, mobile, ...profileFields } = updateData;

  if (profileFields.classId === "") profileFields.classId = null;
  if (profileFields.institutionId === "") profileFields.institutionId = null;

  Object.assign(profile, profileFields);
  await profile.save();

  let emailChangeData = null;

  if (profile.userId) {
    const user = await User.findById(profile.userId);
    if (user) {
      if (name && name.trim()) {
        user.name = name.trim();
      }
      if (mobile !== undefined) {
        user.mobile = mobile ? mobile.trim() : undefined;
      }

      if (email && email.trim()) {
        const normalizedEmail = email.toLowerCase().trim();

        if (normalizedEmail !== user.email) {
          // Check for collision with other users
          const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { pendingEmail: normalizedEmail }],
            _id: { $ne: user._id },
            isDeleted: { $ne: true },
          });

          if (existingUser) {
            const error = new Error("Another user is already registered with this email address");
            error.statusCode = 409;
            throw error;
          }

          // If there was a previous pending email different from this one, invalidate old pending OTP
          if (user.pendingEmail && user.pendingEmail !== normalizedEmail) {
            await OtpVerification.deleteMany({
              identifier: user.pendingEmail,
              purpose: "EMAIL_VERIFICATION",
            });
          }

          // Save new email as pending (unverified)
          user.pendingEmail = normalizedEmail;

          // Generate and send new 6-digit OTP to the new email address
          const otpResult = await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION", {
            userId: user._id,
          });

          emailChangeData = {
            requiresEmailVerification: true,
            email: normalizedEmail,
            maskedEmail: otpResult.maskedEmail || maskEmail(normalizedEmail),
            verificationId: otpResult.verificationId,
            expiresAt: otpResult.expiresAt,
          };
        } else if (normalizedEmail === user.email && user.pendingEmail) {
          // If reverted back to current email, cancel pending change
          await OtpVerification.deleteMany({
            identifier: user.pendingEmail,
            purpose: "EMAIL_VERIFICATION",
          });
          user.pendingEmail = undefined;
        }
      }

      await user.save();
    }
  }

  const populated = await StudentProfile.findById(id)
    .populate("userId", "name email username role status mobile emailVerified pendingEmail")
    .populate("institutionId", "name code")
    .populate("classId", "name code")
    .lean();

  if (emailChangeData) {
    return {
      ...populated,
      ...emailChangeData,
    };
  }

  return populated;
};

const deleteStudent = async (id, hardDelete = false, adminId = null) => {
  return studentLifecycleService.deleteStudentLifecycle(id, { hardDelete, adminId });
};

const updateStudentStatus = async (id, status, adminId = null) => {
  return studentLifecycleService.updateStudentStatus(id, status, { adminId });
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

  // In single-institute architecture, institutionId is optional
  let targetInstitutionId = payload.institutionId || undefined;
  if (caller && caller.role === "INSTITUTION" && caller.institutionId) {
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
          biometricId: payload.biometricId ? payload.biometricId.trim() : undefined,
          house: payload.house || undefined,
          mentorId: payload.mentorId || undefined,
          disciplineScore: payload.disciplineScore !== undefined ? payload.disciplineScore : 100,
          skills: payload.skills || undefined,
          parentUserId: payload.parentUserId || undefined,
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
    email: normalizedEmail,
    verificationId: otpData?.verificationId || null,
    maskedEmail: otpData?.maskedEmail || maskEmail(normalizedEmail),
    expiresAt: otpData?.expiresAt || null,
  };
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  generateRegistrationNumber,
  registerStudentWithAccount,
};

