const crypto = require("crypto");
const User = require("../models/User");
const AccountSetupToken = require("../models/AccountSetupToken");
const PasswordResetToken = require("../models/PasswordResetToken");
const { comparePassword, hashPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../services/emailService");
const { sendAndStoreOtp, verifyOtpCode } = require("../services/otpService");

// 1. Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedIdentifier = username.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    if (!user.passwordHash) {
      return res.status(403).json({ success: false, message: "Account setup is not completed" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// 2. Verify Account Setup Token
const verifyAccountSetupToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const setupTokenDoc = await AccountSetupToken.findOne({ tokenHash });

    if (!setupTokenDoc) {
      return res.status(400).json({ success: false, message: "Invalid account setup token" });
    }

    if (setupTokenDoc.usedAt) {
      return res.status(400).json({ success: false, message: "Account setup token has already been used" });
    }

    if (setupTokenDoc.expiresAt && setupTokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Account setup token has expired" });
    }

    const user = await User.findById(setupTokenDoc.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Associated user account not found" });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Verify setup token error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify setup token" });
  }
};

// 3. Account Setup / Set Password
const accountSetup = async (req, res) => {
  try {
    const { token, username, password, confirmPassword } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const setupTokenDoc = await AccountSetupToken.findOne({ tokenHash });

    if (!setupTokenDoc) {
      return res.status(400).json({ success: false, message: "Invalid account setup token" });
    }

    if (setupTokenDoc.usedAt) {
      return res.status(400).json({ success: false, message: "Account setup token has already been used" });
    }

    if (setupTokenDoc.expiresAt && setupTokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Account setup token has expired" });
    }

    const user = await User.findById(setupTokenDoc.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    if (username && username.trim().toLowerCase() !== user.username) {
      const normalizedUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({ username: normalizedUsername });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: "Username is already taken" });
      }
      user.username = normalizedUsername;
    }

    user.passwordHash = await hashPassword(password);
    user.status = "ACTIVE";
    await user.save();

    setupTokenDoc.usedAt = new Date();
    await setupTokenDoc.save();

    return res.status(200).json({ success: true, message: "Account setup successful. You can now login." });
  } catch (error) {
    console.error("Account setup error:", error);
    return res.status(500).json({ success: false, message: "Failed to set up account" });
  }
};

const setPassword = accountSetup;

// 3. Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    await sendPasswordResetEmail(normalizedEmail, rawToken);

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Forgot password request failed" });
  }
};

// 4. Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetTokenDoc = await PasswordResetToken.findOne({ tokenHash });

    if (!resetTokenDoc || resetTokenDoc.usedAt || resetTokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired password reset link" });
    }

    const user = await User.findById(resetTokenDoc.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    user.passwordHash = await hashPassword(password);
    await user.save();

    resetTokenDoc.usedAt = new Date();
    await resetTokenDoc.save();

    return res.status(200).json({ success: true, message: "Password reset successful. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Reset password failed" });
  }
};

// 5. Send OTP
const sendOtp = async (req, res) => {
  try {
    const { identifier, purpose } = req.body;
    const result = await sendAndStoreOtp(identifier, purpose);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(400).json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

// 6. Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp, purpose } = req.body;
    const result = await verifyOtpCode(identifier, otp, purpose);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(400).json({ success: false, message: error.message || "OTP verification failed" });
  }
};

module.exports = {
  login,
  setPassword,
  accountSetup,
  verifyAccountSetupToken,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
};