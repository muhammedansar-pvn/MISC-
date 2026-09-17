const crypto = require("crypto");
const OtpVerification = require("../models/OtpVerification");
const { sendOtpEmail } = require("./emailService");

const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const sendAndStoreOtp = async (identifier, purpose) => {
  // Rate limiting check: check attempts in last 10 minutes
  const recentOtp = await OtpVerification.findOne({
    identifier,
    purpose,
    expiresAt: { $gt: new Date() },
  });

  if (recentOtp && recentOtp.attempts >= 5) {
    throw new Error("Too many OTP requests. Please wait before requesting again.");
  }

  const rawOtp = generate6DigitOtp();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous pending OTP for same identifier & purpose
  await OtpVerification.deleteMany({ identifier, purpose });

  await OtpVerification.create({
    identifier,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
  });

  // If identifier is an email address, send email
  if (identifier.includes("@")) {
    await sendOtpEmail(identifier, rawOtp, purpose);
  }

  return {
    success: true,
    message: "OTP generated and sent successfully",
    expiresAt,
    // Note: rawOtp return is intended for testing/dev environments if needed
  };
};

const verifyOtpCode = async (identifier, otp, purpose) => {
  const otpHash = hashOtp(otp);

  const record = await OtpVerification.findOne({
    identifier,
    purpose,
  });

  if (!record) {
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
    throw new Error("Invalid OTP code.");
  }

  record.verifiedAt = new Date();
  await record.save();

  return {
    success: true,
    message: "OTP verified successfully",
  };
};

module.exports = {
  sendAndStoreOtp,
  verifyOtpCode,
};
