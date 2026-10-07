const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  registerStudentWithAccount,
  getStudentTeachers,
  ensureStudentProfileForUser,
} = require("./student.service");
const StudentProfile = require("./student.model");
const User = require("../users/user.model");
const { removeUploadedFile } = require("../../middleware/upload.middleware");
const attendanceService = require("../attendance/attendance.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleRegisterStudentWithAccount = async (req, res) => {
  try {
    const result = await registerStudentWithAccount(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Student registered successfully. Verification email dispatched.",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.code === 11000 ? 409 : 400);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to register student",
    });
  }
};

const registerStudent = async (req, res) => {
  try {
    const studentProfile = await createStudent(req.body);
    return res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: studentProfile,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Student profile creation failed",
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    let studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
    })
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    // Fallback path: ensure profile if newly verified student without profile
    if (!studentProfile && req.user.role === "STUDENT") {
      await ensureStudentProfileForUser(req.user.userId);
      studentProfile = await StudentProfile.findOne({
        userId: req.user.userId,
      })
        .populate("userId", "name email pendingEmail username role status mobile emailVerified")
        .populate("institutionId")
        .populate("classId");
    }

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    // Attach today's attendance status to profile response (covers both initial and fallback paths)
    const todayAttendance = await attendanceService.getStudentDailyAttendance(studentProfile._id);

    const profileData = studentProfile.toObject ? studentProfile.toObject() : { ...studentProfile };
    profileData.todayAttendance = todayAttendance;

    // Attach linked parent details if present
    if (studentProfile.parentUserId) {
      const parentUser = await User.findById(studentProfile.parentUserId)
        .select("name email mobile status emailVerified")
        .lean();
      if (parentUser) {
        const ParentProfile = require("../parents/parent.model");
        const parentProfile = await ParentProfile.findOne({
          userId: studentProfile.parentUserId,
          isDeleted: { $ne: true },
        }).lean();
        profileData.parent = {
          id: parentUser._id,
          name: parentUser.name,
          email: parentUser.email,
          mobile: parentUser.mobile,
          status: parentUser.status,
          emailVerified: parentUser.emailVerified,
          relationType: parentProfile?.relationType || "FATHER",
        };
      }
    }

    return res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve student profile" });
  }
};

const handleGetStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }
    if (req.query.admissionYear) {
      filter.admissionYear = req.query.admissionYear;
    }
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const search = req.query.search || "";

    const { page, limit, skip } = parsePagination(req.query);

    const { data, total } = await getStudents(filter, search, { skip, limit });

    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve students" });
  }
};

const handleGetStudentById = async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Role-based authorization enforcement
    if (req.user.role === "FACULTY") {
      const { isFacultyAssigned } = require("../academics/academic-auth.service");
      const isAssigned = student.classId
        ? await isFacultyAssigned({
            facultyId: req.user.facultyId || req.user.userId,
            classId: student.classId._id || student.classId,
          })
        : false;
      const isMentor =
        student.mentorId &&
        req.user.facultyId &&
        student.mentorId.toString() === req.user.facultyId.toString();

      if (!isAssigned && !isMentor) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to view this student",
        });
      }
    } else if (req.user.role === "PARENT") {
      const parentStudentIds = (req.user.parentStudentIds || []).map((id) => id.toString());
      if (!parentStudentIds.includes(student._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to view this student",
        });
      }
    } else if (req.user.role === "STUDENT") {
      if (req.user.studentId && req.user.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Students cannot view other students' profiles",
        });
      }
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve student" });
  }
};

const handleUpdateStudent = async (req, res) => {
  try {
    const student = await updateStudent(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, message: "Student updated successfully", data: student });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update student" });
  }
};

const handleUpdateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const student = await updateStudentStatus(req.params.id, status);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Student status updated to ${status}`,
      data: student,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update student status",
    });
  }
};

const handleUpdateMyProfile = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const allowedUpdates = [
      "nameEnglish",
      "nameArabic",
      "placeEnglish",
      "placeArabic",
      "dateOfBirth",
      "contactNumber",
      "fatherName",
      "motherName",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (req.body.name && !updates.nameEnglish) {
      updates.nameEnglish = req.body.name;
    }
    if (req.body.mobile && !updates.contactNumber) {
      updates.contactNumber = req.body.mobile;
    }

    const updated = await StudentProfile.findByIdAndUpdate(
      student._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    // Synchronize User model
    const userUpdates = {};
    if (updates.nameEnglish) userUpdates.name = updates.nameEnglish;
    if (updates.contactNumber) userUpdates.mobile = updates.contactNumber;
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.userId, { $set: userUpdates });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

const handleUploadMyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image file to upload." });
    }

    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      removeUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (student.photo) {
      removeUploadedFile(student.photo);
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    student.photo = photoUrl;
    await student.save();

    const updated = await StudentProfile.findById(student._id)
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: updated,
      photoUrl,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile photo",
    });
  }
};

const handleDeleteMyPhoto = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (student.photo) {
      removeUploadedFile(student.photo);
    }

    student.photo = "";
    await student.save();

    const updated = await StudentProfile.findById(student._id)
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove profile photo",
    });
  }
};

const handleDeleteStudent = async (req, res) => {
  try {
    const student = await deleteStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete student" });
  }
};

const handleGetMyTeachers = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (!student.classId) {
      return res.status(200).json({
        success: true,
        message: "No class assigned yet",
        data: [],
      });
    }

    const teachers = await getStudentTeachers(student.classId);
    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assigned teachers",
    });
  }
};

const handleLinkParent = async (req, res) => {
  try {
    // 1. Verify student identity and email verification status
    const studentUser = await User.findById(req.user.userId);
    if (!studentUser || studentUser.isDeleted) {
      return res.status(401).json({ success: false, message: "Student account not found or inactive" });
    }

    if (studentUser.emailVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Student must verify their own email before initiating parent verification.",
      });
    }

    let studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
      isDeleted: { $ne: true },
    });

    if (!studentProfile) {
      await ensureStudentProfileForUser(req.user.userId);
      studentProfile = await StudentProfile.findOne({
        userId: req.user.userId,
        isDeleted: { $ne: true },
      });
    }

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    // 2. Validate input fields
    const { parentName, parentEmail, relationship, relationType, parentMobile } = req.body;
    if (!parentEmail || typeof parentEmail !== "string" || !parentEmail.trim()) {
      return res.status(400).json({ success: false, message: "Parent email is required" });
    }
    if (!parentName || typeof parentName !== "string" || !parentName.trim()) {
      return res.status(400).json({ success: false, message: "Parent name is required" });
    }

    const normParentEmail = parentEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normParentEmail)) {
      return res.status(400).json({ success: false, message: "Invalid parent email format" });
    }

    // Security check: cannot be the student's own email
    if (normParentEmail === studentUser.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: "Parent email cannot be the same as the student's email.",
      });
    }

    // 3. Check for existing user account with this email
    let parentUser = await User.findOne({
      email: normParentEmail,
      isDeleted: { $ne: true },
    });

    if (parentUser && parentUser.role !== "PARENT") {
      return res.status(409).json({
        success: false,
        message: "The specified email is registered under a different role and cannot be used as a parent account.",
      });
    }

    const ParentProfile = require("../parents/parent.model");
    const rel = relationship || relationType || "FATHER";

    if (parentUser) {
      // Existing parent account: reuse and link safely
      let parentProfile = await ParentProfile.findOne({
        userId: parentUser._id,
        isDeleted: { $ne: true },
      });

      if (!parentProfile) {
        parentProfile = await ParentProfile.create({
          userId: parentUser._id,
          name: parentName.trim(),
          relationType: rel,
          contactNumber: parentMobile ? parentMobile.trim() : undefined,
          studentIds: [studentProfile._id],
          status: parentUser.emailVerified ? "ACTIVE" : "INACTIVE",
          isDeleted: false,
        });
      } else {
        // Multi-child safety: append without overwriting existing linked students
        const existingIds = (parentProfile.studentIds || []).map((id) => id.toString());
        if (!existingIds.includes(studentProfile._id.toString())) {
          parentProfile.studentIds.push(studentProfile._id);
          await parentProfile.save();
        }
      }

      studentProfile.parentUserId = parentUser._id;
      await studentProfile.save();

      // If parent is already email verified and active
      if (parentUser.emailVerified === true && parentUser.status === "ACTIVE") {
        return res.status(200).json({
          success: true,
          alreadyVerified: true,
          message: "Parent is already verified and linked to your profile.",
          parent: {
            id: parentUser._id,
            name: parentUser.name,
            email: parentUser.email,
            relationType: parentProfile.relationType,
            emailVerified: true,
            status: parentUser.status,
          },
        });
      }

      // If parent is unverified, send email OTP
      const { sendAndStoreOtp } = require("../auth/auth.service");
      const otpResult = await sendAndStoreOtp(normParentEmail, "EMAIL_VERIFICATION", {
        userId: parentUser._id,
        role: "PARENT",
      });

      return res.status(200).json({
        success: true,
        alreadyVerified: false,
        message: "Parent details saved. Verification OTP sent to parent email.",
        maskedEmail: otpResult.maskedEmail,
        verificationId: otpResult.verificationId,
        expiresAt: otpResult.expiresAt,
        parent: {
          id: parentUser._id,
          name: parentUser.name,
          email: parentUser.email,
          relationType: parentProfile.relationType,
          emailVerified: false,
          status: parentUser.status,
        },
      });
    }

    // New parent user: create without password
    parentUser = await User.create({
      name: parentName.trim(),
      email: normParentEmail,
      username: normParentEmail,
      role: "PARENT",
      status: "PENDING_EMAIL_VERIFICATION",
      mobile: parentMobile ? parentMobile.trim() : undefined,
      emailVerified: false,
      isDeleted: false,
    });

    const parentProfile = await ParentProfile.create({
      userId: parentUser._id,
      name: parentName.trim(),
      relationType: rel,
      contactNumber: parentMobile ? parentMobile.trim() : undefined,
      studentIds: [studentProfile._id],
      status: "ACTIVE",
      isDeleted: false,
    });

    studentProfile.parentUserId = parentUser._id;
    await studentProfile.save();

    const { sendAndStoreOtp } = require("../auth/auth.service");
    const otpResult = await sendAndStoreOtp(normParentEmail, "EMAIL_VERIFICATION", {
      userId: parentUser._id,
      role: "PARENT",
    });

    return res.status(201).json({
      success: true,
      alreadyVerified: false,
      message: "Parent account created and linked. Verification OTP sent to parent email.",
      maskedEmail: otpResult.maskedEmail,
      verificationId: otpResult.verificationId,
      expiresAt: otpResult.expiresAt,
      parent: {
        id: parentUser._id,
        name: parentUser.name,
        email: parentUser.email,
        relationType: parentProfile.relationType,
        emailVerified: false,
        status: parentUser.status,
      },
    });
  } catch (error) {
    console.error("Link Parent Error:", error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to link parent",
    });
  }
};

const handleGetLinkedParent = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
      isDeleted: { $ne: true },
    });

    if (!studentProfile || !studentProfile.parentUserId) {
      return res.status(200).json({
        success: true,
        parent: null,
      });
    }

    const parentUser = await User.findById(studentProfile.parentUserId)
      .select("name email mobile status emailVerified")
      .lean();

    if (!parentUser) {
      return res.status(200).json({
        success: true,
        parent: null,
      });
    }

    const ParentProfile = require("../parents/parent.model");
    const parentProfile = await ParentProfile.findOne({
      userId: parentUser._id,
      isDeleted: { $ne: true },
    }).lean();

    return res.status(200).json({
      success: true,
      parent: {
        id: parentUser._id,
        name: parentUser.name,
        email: parentUser.email,
        mobile: parentUser.mobile,
        status: parentUser.status,
        emailVerified: parentUser.emailVerified,
        relationType: parentProfile?.relationType || "FATHER",
      },
    });
  } catch (error) {
    console.error("Get Linked Parent Error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve linked parent details" });
  }
};

const handleResendParentVerificationOtp = async (req, res) => {
  try {
    const studentUser = await User.findById(req.user.userId);
    if (!studentUser || studentUser.emailVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Student must verify their own email before resending parent verification OTP.",
      });
    }

    const studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
      isDeleted: { $ne: true },
    });

    if (!studentProfile || !studentProfile.parentUserId) {
      return res.status(400).json({ success: false, message: "No parent currently linked to this student profile" });
    }

    const parentUser = await User.findById(studentProfile.parentUserId);
    if (!parentUser || parentUser.isDeleted) {
      return res.status(404).json({ success: false, message: "Linked parent account not found" });
    }

    if (parentUser.emailVerified === true && parentUser.status === "ACTIVE") {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: "Parent email is already verified. No new OTP needed.",
      });
    }

    const { sendAndStoreOtp } = require("../auth/auth.service");
    const otpResult = await sendAndStoreOtp(parentUser.email, "EMAIL_VERIFICATION", {
      userId: parentUser._id,
      role: "PARENT",
    });

    return res.status(200).json({
      success: true,
      message: "Parent email verification OTP resent successfully.",
      maskedEmail: otpResult.maskedEmail,
      verificationId: otpResult.verificationId,
      expiresAt: otpResult.expiresAt,
    });
  } catch (error) {
    console.error("Resend Parent OTP Error:", error);
    const statusCode = error.message && error.message.includes("wait 30 seconds") ? 429 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to resend parent verification OTP",
    });
  }
};

module.exports = {
  registerStudent,
  handleRegisterStudentWithAccount,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
  handleUpdateStudentStatus,
  handleUpdateMyProfile,
  handleUploadMyPhoto,
  handleDeleteMyPhoto,
  handleDeleteStudent,
  handleGetMyTeachers,
  handleLinkParent,
  handleGetLinkedParent,
  handleResendParentVerificationOtp,
};
