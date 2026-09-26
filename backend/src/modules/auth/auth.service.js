const crypto = require("crypto");
const OtpVerification = require("./otp-verification.model");
const AccountSetupToken = require("./account-setup-token.model");
const { sendOtpEmail } = require("../../shared/services/email.service");
const env = require("../../config/env");

const generate6DigitOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
};

const sendAndStoreOtp = async (identifier, purpose, options = {}) => {
  const normalizedIdentifier = identifier.toLowerCase().trim();

  // Rate limiting cooldown: 30 seconds
  const recentOtp = await OtpVerification.findOne({
    identifier: normalizedIdentifier,
    purpose,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (recentOtp && (Date.now() - new Date(recentOtp.createdAt).getTime()) < 30000) {
    throw new Error("Please wait 30 seconds before requesting another OTP code.");
  }

  const rawOtp = generate6DigitOtp();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const verificationId = options.verificationId || crypto.randomBytes(32).toString("hex");

  // Invalidate previous pending OTP for same identifier & purpose
  await OtpVerification.deleteMany({ identifier: normalizedIdentifier, purpose });

  await OtpVerification.create({
    identifier: normalizedIdentifier,
    userId: options.userId || undefined,
    verificationId,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
  });

  let emailResult = { success: true };
  if (normalizedIdentifier.includes("@")) {
    emailResult = await sendOtpEmail(normalizedIdentifier, rawOtp, purpose);
  }

  const isSuccess = emailResult.success !== false;

  return {
    success: isSuccess,
    error: emailResult.error || undefined,
    message: isSuccess
      ? "OTP generated and sent successfully"
      : (emailResult.error?.message || emailResult.message || "Failed to deliver OTP email"),
    verificationId,
    expiresAt,
    maskedEmail: maskEmail(normalizedIdentifier),
  };
};

const verifyOtpCode = async (identifier, otp, purpose) => {
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const otpHash = hashOtp(otp);

  const record = await OtpVerification.findOne({
    identifier: normalizedIdentifier,
    purpose,
  });

  if (!record || record.verifiedAt) {
    throw new Error("Invalid or expired OTP");
  }

  if (record.expiresAt < new Date()) {
    await OtpVerification.findByIdAndDelete(record._id);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (record.attempts >= 5) {
    await OtpVerification.findByIdAndDelete(record._id);
    throw new Error("Maximum OTP verification attempts exceeded.");
  }

  if (record.otpHash !== otpHash) {
    record.attempts += 1;
    await record.save();
    if (record.attempts >= 5) {
      await OtpVerification.findByIdAndDelete(record._id);
      throw new Error("Maximum OTP verification attempts exceeded.");
    }
    throw new Error(`Invalid OTP code. ${5 - record.attempts} attempts remaining.`);
  }

  record.verifiedAt = new Date();
  await record.save();

  return {
    success: true,
    message: "OTP verified successfully",
  };
};

const verify2FAOtp = async (verificationId, otp) => {
  if (!verificationId || !otp) {
    throw new Error("Verification ID and OTP code are required.");
  }

  const otpHash = hashOtp(otp.trim());

  const record = await OtpVerification.findOne({
    verificationId,
    purpose: "LOGIN_2FA",
  });

  if (!record || record.verifiedAt) {
    throw new Error("Invalid or expired 2FA session. Please log in again.");
  }

  if (record.expiresAt < new Date()) {
    await OtpVerification.findByIdAndDelete(record._id);
    throw new Error("OTP has expired. Please request a new code.");
  }

  if (record.attempts >= 5) {
    await OtpVerification.findByIdAndDelete(record._id);
    throw new Error("Maximum 2FA verification attempts exceeded. Please log in again.");
  }

  if (record.otpHash !== otpHash) {
    record.attempts += 1;
    await record.save();

    if (record.attempts >= 5) {
      await OtpVerification.findByIdAndDelete(record._id);
      throw new Error("Maximum 2FA verification attempts exceeded. Please log in again.");
    }

    throw new Error(`Invalid OTP. ${5 - record.attempts} attempt(s) remaining.`);
  }

  await OtpVerification.findByIdAndDelete(record._id);

  return {
    success: true,
    userId: record.userId,
    identifier: record.identifier,
  };
};

const resend2FAOtp = async (verificationId) => {
  if (!verificationId) {
    throw new Error("Verification ID is required.");
  }

  const existing = await OtpVerification.findOne({
    verificationId,
    purpose: "LOGIN_2FA",
  });

  if (!existing) {
    throw new Error("Invalid or expired 2FA session. Please log in again.");
  }

  const timeSinceLastUpdate = Date.now() - new Date(existing.updatedAt || existing.createdAt).getTime();
  if (timeSinceLastUpdate < 30000) {
    throw new Error("Please wait 30 seconds before requesting a new OTP.");
  }

  const rawOtp = generate6DigitOtp();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  existing.otpHash = otpHash;
  existing.attempts = 0;
  existing.expiresAt = expiresAt;
  await existing.save();

  const emailResult = await sendOtpEmail(existing.identifier, rawOtp, "LOGIN_2FA");
  if (emailResult.success === false) {
    throw new Error(emailResult.message || "Failed to deliver new OTP email");
  }

  return {
    success: true,
    message: "A new 2FA OTP code has been sent to your registered email address.",
    verificationId: existing.verificationId,
    expiresAt,
    email: maskEmail(existing.identifier),
  };
};

const generateAccountSetupToken = async (userId, purpose = "ACCOUNT_SETUP") => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Invalidate previous unused setup tokens for this user
  await AccountSetupToken.deleteMany({ userId });

  await AccountSetupToken.create({
    userId,
    tokenHash,
    purpose,
    expiresAt,
  });

  const setupBaseUrl = env.SETUP_BASE_URL;
  const setupLink = `${setupBaseUrl}/${rawToken}`;

  return {
    setupLink,
    rawToken,
    expiresAt,
  };
};

module.exports = {
  generate6DigitOtp,
  hashOtp,
  maskEmail,
  sendAndStoreOtp,
  verifyOtpCode,
  verify2FAOtp,
  resend2FAOtp,
  generateAccountSetupToken,
};
