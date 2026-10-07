const mongoose = require("mongoose");
const User = require("../users/user.model");
const StudentProfile = require("./student.model");
const InstitutionProfile = require("../institutions/institution.model");
const Class = require("../academics/class.model");
const Timetable = require("../academics/timetable.model");
const FacultyAssignment = require("../academics/faculty-assignment.model");
const FacultyProfile = require("../faculty/faculty.model");
const ParentProfile = require("../parents/parent.model");
const { generateAccountSetupToken, sendAndStoreOtp, maskEmail } = require("../auth/auth.service");
const OtpVerification = require("../auth/otp-verification.model");
const studentLifecycleService = require("./student-lifecycle.service");
const { escapeRegex } = require("../../shared/utils/regex");

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

const ensureParentLinked = async (studentProfile, parentData) => {
  if (!parentData || !studentProfile) return;
  const {
    parentUserId,
    parentEmail,
    parentName,
    parentMobile,
    relationship,
    relationType,
    fatherName,
  } = parentData;

  let targetParentUserId = parentUserId || null;

  if (parentEmail && parentEmail.trim()) {
    const normParentEmail = parentEmail.toLowerCase().trim();
    let parentUser = await User.findOne({
      email: normParentEmail,
      isDeleted: { $ne: true },
    });

    if (parentUser) {
      if (parentUser.role !== "PARENT") {
        const error = new Error("The specified parent email is already registered as a different account role.");
        error.statusCode = 409;
        throw error;
      }
      targetParentUserId = parentUser._id;
    } else {
      // 1. New parent account created without password
      parentUser = await User.create({
        name: (parentName && parentName.trim()) || (fatherName && fatherName.trim()) || "Parent",
        email: normParentEmail,
        username: normParentEmail,
        role: "PARENT",
        status: "PENDING_EMAIL_VERIFICATION",
        mobile: parentMobile ? parentMobile.trim() : undefined,
        emailVerified: false,
        isDeleted: false,
      });
      targetParentUserId = parentUser._id;

      // 2. Verification OTP sent
      try {
        await sendAndStoreOtp(normParentEmail, "EMAIL_VERIFICATION", { userId: parentUser._id, role: "PARENT" });
      } catch (err) {
        console.error("Failed to send parent verification OTP:", err.message);
      }
    }
  }

  if (targetParentUserId) {
    studentProfile.parentUserId = targetParentUserId;
    await studentProfile.save();

    let parentProfile = await ParentProfile.findOne({
      userId: targetParentUserId,
      isDeleted: { $ne: true },
    });

    const studentIdStr = studentProfile._id.toString();

    if (!parentProfile) {
      await ParentProfile.create({
        userId: targetParentUserId,
        name: (parentName && parentName.trim()) || (fatherName && fatherName.trim()) || "Parent",
        relationType: relationship || relationType || "FATHER",
        contactNumber: parentMobile ? parentMobile.trim() : undefined,
        studentIds: [studentProfile._id],
        status: "ACTIVE",
        isDeleted: false,
      });
    } else {
      // 13. Same parent email registering second child reuses existing Parent account
      const existingIds = (parentProfile.studentIds || []).map((id) => id.toString());
      if (!existingIds.includes(studentIdStr)) {
        parentProfile.studentIds.push(studentProfile._id);
        await parentProfile.save();
      }
    }
  }
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

  let resolvedAcademicYearId = studentData.academicYearId || undefined;
  if (classId) {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      const err = new Error("Class not found");
      err.statusCode = 404;
      throw err;
    }
    if (!resolvedAcademicYearId && classDoc.academicYearId) {
      resolvedAcademicYearId = classDoc.academicYearId;
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
    academicYearId: resolvedAcademicYearId,
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

  await ensureParentLinked(studentProfile, studentData);

  return StudentProfile.findById(studentProfile._id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("classId", "name code")
    .lean();
};

const ensureStudentProfileForUser = async (userId) => {
  let profile = await StudentProfile.findOne({ userId, isDeleted: { $ne: true } });
  if (profile) return profile;

  const user = await User.findById(userId);
  if (!user || user.role !== "STUDENT" || user.isDeleted === true) {
    return null;
  }

  const regNum = await generateRegistrationNumber();
  const currentYear = new Date().getFullYear();

  profile = await StudentProfile.create({
    userId: user._id,
    registrationNumber: regNum,
    nameEnglish: user.name || "Student",
    fatherName: "Pending Update",
    motherName: "Pending Update",
    dateOfBirth: new Date("2000-01-01"),
    admissionYear: currentYear,
    contactNumber: user.mobile || "",
    status: "ACTIVE",
  });

  return profile;
};

const getStudents = async (filter = {}, search = "", pagination = null) => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { registrationNumber: searchRegex },
      { nameEnglish: searchRegex },
      { nameArabic: searchRegex },
      { contactNumber: searchRegex },
      { fatherName: searchRegex },
    ];
  }

  if (pagination) {
    const [profiles, total] = await Promise.all([
      StudentProfile.find(query)
        .populate("userId", "name email username role status mobile isDeleted")
        .populate("institutionId", "name code")
        .populate("classId", "name code")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      StudentProfile.countDocuments(query),
    ]);

    const activeProfiles = profiles.filter((p) => p.userId && p.userId.isDeleted !== true);
    return { data: activeProfiles, total };
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

  if (profileFields.classId) {
    const classDoc = await Class.findById(profileFields.classId);
    if (classDoc && classDoc.academicYearId) {
      profileFields.academicYearId = classDoc.academicYearId;
    }
  } else if (profileFields.classId === null) {
    profileFields.academicYearId = null;
  }

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

  let resolvedAcademicYearId = payload.academicYearId || undefined;
  if (classId) {
    const classDoc = await Class.findById(classId);
    if (classDoc && classDoc.academicYearId) {
      resolvedAcademicYearId = classDoc.academicYearId;
    }
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
          academicYearId: resolvedAcademicYearId,
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

  // Ensure parent account creation / linking if parent details provided
  await ensureParentLinked(createdStudentProfile, payload);

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

const getStudentTeachers = async (identifier) => {
  let classId = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // Check if identifier is directly a Class _id
    const classDoc = await Class.findById(identifier).select("_id");
    if (classDoc) {
      classId = classDoc._id;
    } else {
      // Check if it's a student userId or StudentProfile _id
      const student = await StudentProfile.findOne({
        $or: [{ userId: identifier }, { _id: identifier }],
      }).select("classId");
      if (student && student.classId) {
        classId = student.classId;
      }
    }
  }

  if (!classId) {
    return [];
  }

  const subjectMap = new Map();

  // 1. Primary Source of Truth: FacultyAssignment (Phase 1)
  const assignments = await FacultyAssignment.find({
    classId,
    status: "ACTIVE",
  })
    .populate("subjectId", "name subjectName code subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation photo contactNumber")
    .lean();

  for (const asgn of assignments) {
    if (!asgn.subjectId) continue;
    const subIdStr = asgn.subjectId._id.toString();
    const subName = asgn.subjectId.name || asgn.subjectId.subjectName || "Subject";
    const subCode = asgn.subjectId.code || asgn.subjectId.subjectCode || "SUB";
    const category = asgn.subjectId.category || "GENERAL";

    subjectMap.set(subIdStr, {
      subjectId: subIdStr,
      subjectName: subName,
      subjectCode: subCode,
      category,
      teacher: asgn.facultyId
        ? {
            nameEnglish: asgn.facultyId.nameEnglish || "Faculty Member",
            designation: asgn.facultyId.designation || "Usthad",
            photo: asgn.facultyId.photo || "",
            contactNumber: asgn.facultyId.contactNumber || "",
          }
        : null,
    });
  }

  // 2. Secondary / Fallback: Active Timetable entries for unmapped subjects
  const timetableEntries = await Timetable.find({
    classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("subjectId", "name subjectName code subjectCode category")
    .populate("facultyId", "nameEnglish designation photo")
    .lean();

  for (const entry of timetableEntries) {
    if (!entry.subjectId) continue;
    const subIdStr = entry.subjectId._id.toString();

    if (!subjectMap.has(subIdStr)) {
      subjectMap.set(subIdStr, {
        subjectId: subIdStr,
        subjectName: entry.subjectId.name || entry.subjectId.subjectName || "Subject",
        subjectCode: entry.subjectId.code || entry.subjectId.subjectCode || "SUB",
        category: entry.subjectId.category || "GENERAL",
        teacher: entry.facultyId
          ? {
              nameEnglish: entry.facultyId.nameEnglish || "Faculty Member",
              designation: entry.facultyId.designation || "Usthad",
              photo: entry.facultyId.photo || "",
            }
          : null,
      });
    } else if (entry.facultyId && !subjectMap.get(subIdStr).teacher) {
      subjectMap.get(subIdStr).teacher = {
        nameEnglish: entry.facultyId.nameEnglish || "Faculty Member",
        designation: entry.facultyId.designation || "Usthad",
        photo: entry.facultyId.photo || "",
      };
    }
  }

  // 3. Fallback: Legacy FacultyProfile.assignedClasses
  const assignedFaculty = await FacultyProfile.find({
    assignedClasses: classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("assignedSubjects", "name subjectName code subjectCode category")
    .select("nameEnglish designation assignedSubjects photo")
    .lean();

  for (const faculty of assignedFaculty) {
    const subjects = faculty.assignedSubjects || [];
    for (const sub of subjects) {
      const subIdStr = sub._id.toString();
      if (!subjectMap.has(subIdStr)) {
        subjectMap.set(subIdStr, {
          subjectId: subIdStr,
          subjectName: sub.name || sub.subjectName || "Subject",
          subjectCode: sub.code || sub.subjectCode || "SUB",
          category: sub.category || "GENERAL",
          teacher: {
            nameEnglish: faculty.nameEnglish || "Faculty Member",
            designation: faculty.designation || "Usthad",
            photo: faculty.photo || "",
          },
        });
      } else if (!subjectMap.get(subIdStr).teacher) {
        subjectMap.get(subIdStr).teacher = {
          nameEnglish: faculty.nameEnglish || "Faculty Member",
          designation: faculty.designation || "Usthad",
          photo: faculty.photo || "",
        };
      }
    }
  }

  return Array.from(subjectMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );
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
  getStudentTeachers,
  ensureStudentProfileForUser,
};

