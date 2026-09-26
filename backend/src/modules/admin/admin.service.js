const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../users/user.model");
const AccountSetupToken = require("../auth/account-setup-token.model");
const OtpVerification = require("../auth/otp-verification.model");
const { sendUserInvitationEmail } = require("../../shared/services/email.service");
const { sendAndStoreOtp, verifyOtpCode } = require("../auth/auth.service");
const studentLifecycleService = require("../students/student-lifecycle.service");

// Models for stats aggregations
const getExternalModels = () => ({
  Event: require("../events/event.model"),
  Exam: require("../exams/exam.model"),
  Payment: require("../payments/payment.model"),
});

const createUserInvitation = async ({ name, email, username, role, department, mobile, status }) => {
  if (!email || !name) {
    const error = new Error("Name and email are required");
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

  const allowedRoles = ["ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "PARENT"];
  const targetRole = role ? role.toUpperCase() : "FACULTY";

  if (targetRole === "STUDENT") {
    const error = new Error("Students cannot be created through generic user creation. Please use the Student Registration workflow (Admin -> Students -> Register Student).");
    error.statusCode = 400;
    throw error;
  }

  if (!allowedRoles.includes(targetRole)) {
    const error = new Error(`Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  const targetUsername = username && username.trim()
    ? username.toLowerCase().trim()
    : normalizedEmail;

  const existingUserByEmail = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (
    existingUserByEmail &&
    !existingUserByEmail.isDeleted &&
    existingUserByEmail.status === "ACTIVE" &&
    existingUserByEmail.passwordHash
  ) {
    const error = new Error("A user with this email address already exists.");
    error.statusCode = 409;
    throw error;
  }

  let user;
  let isReinvitation = false;

  if (existingUserByEmail) {
    isReinvitation = true;

    const userWithUsername = await User.findOne({
      username: targetUsername,
      _id: { $ne: existingUserByEmail._id },
      isDeleted: { $ne: true },
    });
    if (userWithUsername) {
      const error = new Error("User with this username already exists");
      error.statusCode = 409;
      throw error;
    }

    existingUserByEmail.name = name.trim();
    existingUserByEmail.username = targetUsername;
    existingUserByEmail.role = targetRole;
    if (department !== undefined) existingUserByEmail.department = department ? department.trim() : undefined;
    if (mobile !== undefined) existingUserByEmail.mobile = mobile ? mobile.trim() : undefined;
    existingUserByEmail.status = status || "PENDING_SETUP";
    existingUserByEmail.isDeleted = false;
    existingUserByEmail.emailVerified = false;

    await existingUserByEmail.save();
    user = existingUserByEmail;

    await AccountSetupToken.deleteMany({ userId: user._id });
  } else {
    const userWithUsername = await User.findOne({
      username: targetUsername,
      isDeleted: { $ne: true },
    });
    if (userWithUsername) {
      const error = new Error("User with this username already exists");
      error.statusCode = 409;
      throw error;
    }

    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      username: targetUsername,
      role: targetRole,
      department: department ? department.trim() : undefined,
      mobile: mobile ? mobile.trim() : undefined,
      status: status || "PENDING_SETUP",
      emailVerified: false,
      isDeleted: false,
    });

    await user.save();
  }

  const otpResult = await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION", { userId: user._id });

  if (otpResult.success === false) {
    if (!isReinvitation) {
      await User.findByIdAndDelete(user._id);
    }
    await OtpVerification.deleteMany({ identifier: normalizedEmail, purpose: "EMAIL_VERIFICATION" });

    const errObj = otpResult.error || {
      code: "SMTP_SEND_FAILED",
      message: "Unable to send the verification email. Please try again later.",
    };
    const error = new Error(errObj.message);
    error.statusCode = 502;
    error.code = errObj.code;
    throw error;
  }

  return {
    isReinvitation,
    verificationId: otpResult.verificationId,
    email: normalizedEmail,
    maskedEmail: otpResult.maskedEmail,
    expiresAt: otpResult.expiresAt,
  };
};

const verifyAdminUserOtp = async ({ verificationId, email, otp }) => {
  if (!verificationId || !otp || !email) {
    const error = new Error("Email, verification ID, and OTP code are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  await verifyOtpCode(normalizedEmail, otp, "EMAIL_VERIFICATION");

  await OtpVerification.deleteMany({
    $or: [
      { verificationId },
      { identifier: normalizedEmail, purpose: "EMAIL_VERIFICATION" },
    ],
  });

  const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error("Pending user record not found");
    error.statusCode = 404;
    throw error;
  }

  user.emailVerified = true;
  if (user.status === "INVITED") {
    user.status = "PENDING_SETUP";
  }
  await user.save();

  await AccountSetupToken.deleteMany({ userId: user._id });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const invitationTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await AccountSetupToken.create({
    userId: user._id,
    tokenHash,
    purpose: "ADMIN_INVITATION",
    expiresAt: invitationTokenExpiresAt,
  });

  const emailResult = await sendUserInvitationEmail(normalizedEmail, user.name, rawToken);
  if (!emailResult || emailResult.success === false) {
    throw new Error(emailResult?.error?.message || emailResult?.message || "Failed to deliver account setup email");
  }

  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
};

const resendAdminUserOtp = async ({ verificationId, email }) => {
  if (!email) {
    const error = new Error("Email address is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });

  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  const otpResult = await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION", {
    userId: user._id,
    verificationId: verificationId || undefined,
  });

  if (otpResult.success === false) {
    const errObj = otpResult.error || {
      code: "SMTP_SEND_FAILED",
      message: "Unable to send the verification email. Please try again later.",
    };
    const error = new Error(errObj.message);
    error.statusCode = 502;
    error.code = errObj.code;
    throw error;
  }

  return {
    verificationId: otpResult.verificationId,
    email: normalizedEmail,
    maskedEmail: otpResult.maskedEmail,
    expiresAt: otpResult.expiresAt,
  };
};

const getUsers = async ({ role, status, search, page, limit }) => {
  const filter = { isDeleted: { $ne: true } };

  if (role) filter.role = role.toUpperCase();
  if (status) filter.status = status.toUpperCase();

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { username: searchRegex },
    ];
  }

  if (page || limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      count: users.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      isPaginated: true,
    };
  }

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return {
    users,
    count: users.length,
    isPaginated: false,
  };
};

const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: id, isDeleted: { $ne: true } })
    .select("-passwordHash")
    .lean();

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUser = async (id, updateData, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { name, email, mobile, username, role, status, department } = updateData;

  if (currentAdminId && currentAdminId === id && role && role.toUpperCase() !== "ADMIN") {
    const error = new Error("You cannot revoke your own Administrator role");
    error.statusCode = 400;
    throw error;
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
      isDeleted: { $ne: true },
    });
    if (existingEmail) {
      const error = new Error("Another user is already registered with this email");
      error.statusCode = 409;
      throw error;
    }
    user.email = normalizedEmail;
  }

  if (username && username.toLowerCase().trim() !== user.username) {
    const normalizedUsername = username.toLowerCase().trim();
    const existingUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: id },
      isDeleted: { $ne: true },
    });
    if (existingUsername) {
      const error = new Error("Another user is already registered with this username");
      error.statusCode = 409;
      throw error;
    }
    user.username = normalizedUsername;
  }

  if (name) user.name = name.trim();
  if (mobile !== undefined) user.mobile = mobile ? mobile.trim() : undefined;
  if (department !== undefined) user.department = department ? department.trim() : undefined;

  if (role) {
    const allowedRoles = ["ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "STUDENT", "PARENT", "INSTITUTION"];
    const targetRole = role.toUpperCase();
    if (!allowedRoles.includes(targetRole)) {
      const error = new Error(`Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }
    user.role = targetRole;
  }

  if (status) {
    const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_SETUP", "INVITED"];
    const targetStatus = status.toUpperCase();
    if (!allowedStatuses.includes(targetStatus)) {
      const error = new Error(`Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }
    if (currentAdminId && currentAdminId === id && ["INACTIVE", "SUSPENDED"].includes(targetStatus)) {
      const error = new Error("You cannot deactivate or suspend your own account");
      error.statusCode = 400;
      throw error;
    }
    user.status = targetStatus;
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.passwordHash;
  return updatedUser;
};

const updateUserStatus = async (id, status, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  if (!status) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    throw error;
  }

  const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_SETUP", "INVITED"];
  const targetStatus = status.toUpperCase();

  if (!allowedStatuses.includes(targetStatus)) {
    const error = new Error(`Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  if (currentAdminId && currentAdminId === id && ["INACTIVE", "SUSPENDED"].includes(targetStatus)) {
    const error = new Error("You cannot deactivate or suspend your own account");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "STUDENT") {
    await studentLifecycleService.updateStudentStatus(user._id, targetStatus);
    const updatedUser = await User.findById(id).lean();
    delete updatedUser.passwordHash;
    return { updatedUser, targetStatus };
  }

  user.status = targetStatus;
  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.passwordHash;
  return { updatedUser, targetStatus };
};

const deleteUser = async (id, currentAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  if (currentAdminId && currentAdminId === id) {
    const error = new Error("You cannot delete your own admin account");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.email === "admin@misc.markaz.in" || user.email === "admin@markaz.in") {
    const error = new Error("System administrator account cannot be deleted");
    error.statusCode = 400;
    throw error;
  }

  if (user.role === "STUDENT") {
    await studentLifecycleService.deleteStudentLifecycle(user._id, {
      hardDelete: false,
      adminId: currentAdminId,
    });
    return true;
  }

  user.isDeleted = true;
  user.status = "INACTIVE";
  await user.save();

  await Promise.all([
    AccountSetupToken.deleteMany({ userId: id }),
    OtpVerification.deleteMany({ userId: id }),
  ]);

  return true;
};

const getDashboardStats = async () => {
  const { Event, Exam, Payment } = getExternalModels();

  const [userStatsFacet, events, exams, payments] = await Promise.all([
    User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          activeUsers: [{ $match: { status: "ACTIVE" } }, { $count: "count" }],
          pendingUsers: [{ $match: { status: { $in: ["INVITED", "PENDING_SETUP"] } } }, { $count: "count" }],
          institutions: [{ $match: { role: "INSTITUTION" } }, { $count: "count" }],
          students: [{ $match: { role: "STUDENT" } }, { $count: "count" }],
          faculty: [{ $match: { role: "FACULTY" } }, { $count: "count" }],
        },
      },
    ]),
    Event.countDocuments().catch(() => 0),
    Exam.countDocuments().catch(() => 0),
    Payment.countDocuments().catch(() => 0),
  ]);

  const facet = (userStatsFacet && userStatsFacet[0]) || {};
  const extractCount = (arr) => (arr && arr[0] ? arr[0].count : 0);

  return {
    totalUsers: extractCount(facet.totalUsers),
    activeUsers: extractCount(facet.activeUsers),
    pendingUsers: extractCount(facet.pendingUsers),
    institutions: extractCount(facet.institutions),
    students: extractCount(facet.students),
    faculty: extractCount(facet.faculty),
    events,
    exams,
    payments,
  };
};

module.exports = {
  createUserInvitation,
  verifyAdminUserOtp,
  resendAdminUserOtp,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
};
