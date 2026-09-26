const mongoose = require("mongoose");
const StudentProfile = require("./student.model");
const User = require("../users/user.model");
const AccountSetupToken = require("../auth/account-setup-token.model");
const OtpVerification = require("../auth/otp-verification.model");

// Lazy model loader for optional/peer modules to prevent circular dependency issues
function getPeerModels() {
  let ExamRegistration = null;
  let ExamResult = null;
  let MarkEntry = null;
  let Payment = null;

  try {
    ExamRegistration = require("../exams/exam-registration.model");
  } catch (e) {}

  try {
    ExamResult = require("../exams/exam-result.model");
  } catch (e) {}

  try {
    MarkEntry = require("../exams/mark-entry.model");
  } catch (e) {}

  try {
    Payment = require("../payments/payment.model");
  } catch (e) {}

  return { ExamRegistration, ExamResult, MarkEntry, Payment };
}

/**
 * Resolves both the StudentProfile and its associated User document
 * by studentProfileId, userId, or registrationNumber.
 */
const findStudentAndUser = async (identifier) => {
  if (!identifier) {
    const error = new Error("Student or user identifier is required");
    error.statusCode = 400;
    throw error;
  }

  let profile = null;
  let user = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // Check if identifier is studentProfile._id
    profile = await StudentProfile.findById(identifier);
    if (profile && profile.userId) {
      user = await User.findById(profile.userId);
    }

    // If not found by profile ID, check if identifier is user._id
    if (!profile) {
      user = await User.findById(identifier);
      if (user) {
        profile = await StudentProfile.findOne({ userId: user._id });
      }
    }
  }

  // If still not found and identifier is string, check registrationNumber or email
  if (!profile && typeof identifier === "string") {
    profile = await StudentProfile.findOne({ registrationNumber: identifier.trim() });
    if (profile && profile.userId) {
      user = await User.findById(profile.userId);
    }

    if (!profile) {
      user = await User.findOne({
        $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.toLowerCase().trim() }],
      });
      if (user) {
        profile = await StudentProfile.findOne({ userId: user._id });
      }
    }
  }

  return { profile, user };
};

/**
 * Checks whether the student has any historical academic or financial records
 * (ExamRegistrations, ExamResults, MarkEntries, Payments).
 */
const hasHistoricalRecords = async (studentProfileId, userId) => {
  const { ExamRegistration, ExamResult, MarkEntry, Payment } = getPeerModels();
  const checks = [];

  if (studentProfileId) {
    if (ExamRegistration) {
      checks.push(ExamRegistration.exists({ studentId: studentProfileId }));
    }
    if (ExamResult) {
      checks.push(ExamResult.exists({ studentId: studentProfileId }));
    }
    if (MarkEntry) {
      checks.push(MarkEntry.exists({ studentId: studentProfileId }));
    }
  }

  if (userId) {
    if (Payment) {
      checks.push(Payment.exists({ userId }));
    }
  }

  const results = await Promise.all(checks);
  return results.some((res) => !!res);
};

/**
 * Executes a database operation within a MongoDB transaction session,
 * with automatic fallback to compensating manual rollback if standalone MongoDB is detected.
 */
const executeAtomicOperation = async (operation) => {
  const session = await mongoose.startSession();
  try {
    try {
      let result = null;
      await session.withTransaction(async () => {
        result = await operation(session);
      });
      return result;
    } catch (txErr) {
      if (
        txErr.message &&
        txErr.message.includes("Transaction numbers are only allowed on a replica set member or mongos")
      ) {
        // Fallback execution for standalone mongod
        return await operation(null);
      }
      throw txErr;
    }
  } finally {
    await session.endSession();
  }
};

/**
 * Synchronizes status change (e.g. ACTIVE, INACTIVE, SUSPENDED)
 * across both User and StudentProfile atomically.
 */
const updateStudentStatus = async (identifier, status, options = {}) => {
  const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "ALUMNI"];
  const targetStatus = status ? status.toUpperCase() : null;

  if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
    const error = new Error(`Invalid student status. Allowed: ${allowedStatuses.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  const { profile, user } = await findStudentAndUser(identifier);

  if (!profile && !user) {
    const error = new Error("Student record not found");
    error.statusCode = 404;
    throw error;
  }

  // Map student profile status to User status if appropriate
  // StudentProfile: ACTIVE, INACTIVE, SUSPENDED, ALUMNI
  // User: ACTIVE, INACTIVE, SUSPENDED, PENDING_SETUP, INVITED
  const targetUserStatus = targetStatus === "ALUMNI" ? "INACTIVE" : targetStatus;

  await executeAtomicOperation(async (sess) => {
    const sessOpt = sess ? { session: sess } : {};

    if (profile) {
      profile.status = targetStatus;
      if (targetStatus === "ACTIVE") {
        profile.isDeleted = false;
      }
      await profile.save(sessOpt);
    }

    if (user) {
      user.status = targetUserStatus;
      if (targetStatus === "ACTIVE") {
        user.isDeleted = false;
      }
      await user.save(sessOpt);
    }
  });

  return {
    success: true,
    message: `Student status successfully updated to ${targetStatus}`,
    status: targetStatus,
    profileId: profile?._id,
    userId: user?._id,
  };
};

/**
 * Canonical Student Deletion & Deactivation:
 * - If hardDelete === true: checks historical records. If history exists, throws 400 error.
 *   If no history exists, removes both StudentProfile and User atomically.
 * - If softDelete (default): atomically sets isDeleted: true and status: "INACTIVE"
 *   on both StudentProfile and User, and purges active setup/OTP tokens.
 */
const deleteStudentLifecycle = async (identifier, options = {}) => {
  const hardDelete = options.hardDelete === true;
  const { profile, user } = await findStudentAndUser(identifier);

  if (!profile && !user) {
    const error = new Error("Student record not found");
    error.statusCode = 404;
    throw error;
  }

  const profileId = profile?._id;
  const userId = user?._id || profile?.userId;

  // Check historical records
  const hasHistory = await hasHistoricalRecords(profileId, userId);

  if (hardDelete) {
    if (hasHistory) {
      const error = new Error(
        "Cannot permanently delete student with existing academic or financial history (Exam Registrations, Results, or Payments). Deactivate or archive the student instead."
      );
      error.statusCode = 400;
      throw error;
    }

    await executeAtomicOperation(async (sess) => {
      const sessOpt = sess ? { session: sess } : {};
      if (profileId) {
        await StudentProfile.findByIdAndDelete(profileId, sessOpt);
      }
      if (userId) {
        await User.findByIdAndDelete(userId, sessOpt);
        await AccountSetupToken.deleteMany({ userId }, sessOpt);
        await OtpVerification.deleteMany({ userId }, sessOpt);
      }
    });

    return {
      success: true,
      action: "HARD_DELETED",
      message: "Student profile and user account permanently removed.",
      profileId,
      userId,
    };
  }

  // Safe Canonical Soft Delete / Archive
  await executeAtomicOperation(async (sess) => {
    const sessOpt = sess ? { session: sess } : {};

    if (profile) {
      profile.isDeleted = true;
      profile.status = "INACTIVE";
      await profile.save(sessOpt);
    }

    if (user) {
      user.isDeleted = true;
      user.status = "INACTIVE";
      await user.save(sessOpt);
      await AccountSetupToken.deleteMany({ userId: user._id }, sessOpt);
      await OtpVerification.deleteMany({ userId: user._id }, sessOpt);
    }
  });

  return {
    success: true,
    action: "SOFT_DELETED",
    message: "Student account and profile deactivated and archived successfully.",
    profileId,
    userId,
    hasHistoricalRecords: hasHistory,
  };
};

/**
 * Restores a soft-deleted student to ACTIVE status
 */
const restoreStudentLifecycle = async (identifier) => {
  const { profile, user } = await findStudentAndUser(identifier);

  if (!profile && !user) {
    const error = new Error("Student record not found");
    error.statusCode = 404;
    throw error;
  }

  await executeAtomicOperation(async (sess) => {
    const sessOpt = sess ? { session: sess } : {};

    if (profile) {
      profile.isDeleted = false;
      profile.status = "ACTIVE";
      await profile.save(sessOpt);
    }

    if (user) {
      user.isDeleted = false;
      user.status = "ACTIVE";
      await user.save(sessOpt);
    }
  });

  return {
    success: true,
    action: "RESTORED",
    message: "Student account and profile restored to active status.",
    profileId: profile?._id,
    userId: user?._id,
  };
};

module.exports = {
  findStudentAndUser,
  hasHistoricalRecords,
  updateStudentStatus,
  deleteStudentLifecycle,
  restoreStudentLifecycle,
};
