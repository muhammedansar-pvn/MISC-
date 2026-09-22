const crypto = require("crypto");
const User = require("../users/user.model");
const AccountSetupToken = require("./account-setup-token.model");
const PasswordResetToken = require("./password-reset-token.model");
const { comparePassword, hashPassword } = require("../../shared/utils/password");
const { generateToken } = require("../../shared/utils/jwt");
const { sendPasswordResetEmail } = require("../../shared/services/email.service");
const {
  sendAndStoreOtp,
  verifyOtpCode,
  verify2FAOtp,
  resend2FAOtp,
  maskEmail,
} = require("./auth.service");

// 1. Register User
const register = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
      isDeleted: { $ne: true },
    });

    if (existingUser) {
      if (existingUser.emailVerified === false) {
        await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION");
        return res.status(200).json({
          success: true,
          message: "Registration pending verification. A new OTP has been sent to your email.",
          requiresEmailVerification: true,
          email: normalizedEmail,
        });
      }
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);
    const targetRole = role && ["STUDENT", "FACULTY", "INSTITUTION"].includes(role.toUpperCase())
      ? role.toUpperCase()
      : "STUDENT";

    await User.create({
      name,
      email: normalizedEmail,
      username: normalizedEmail,
      passwordHash,
      role: targetRole,
      status: "PENDING_SETUP",
      emailVerified: false,
      mobile: mobile || undefined,
      isDeleted: false,
    });

    await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION");

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
      requiresEmailVerification: true,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
};

// 2. Verify Email OTP
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    await verifyOtpCode(normalizedEmail, otp, "EMAIL_VERIFICATION");

    const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    user.emailVerified = true;
    user.status = "ACTIVE";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verify Email OTP Error:", error);
    return res.status(400).json({ success: false, message: error.message || "OTP verification failed" });
  }
};

// 3. Resend Email OTP
const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
    if (!user || user.emailVerified === true) {
      return res.status(200).json({
        success: true,
        message: "If an unverified account exists, a new verification OTP has been sent.",
      });
    }

    await sendAndStoreOtp(normalizedEmail, "EMAIL_VERIFICATION");

    return res.status(200).json({
      success: true,
      message: "A new email verification OTP has been sent.",
    });
  } catch (error) {
    console.error("Resend Email OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to resend OTP" });
  }
};

// 4. Login
const login = async (req, res) => {
  try {
    const { username, email, password, requires2FA } = req.body;
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select("+passwordHash");

    if (!user || user.isDeleted === true) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    if (!user.passwordHash) {
      return res.status(403).json({ success: false, message: "Account setup is not completed" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    if (user.role !== "ADMIN" && user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        requiresEmailVerification: true,
        message: "Please verify your email before logging in.",
        email: user.email,
      });
    }

    if (user.status !== "ACTIVE" || user.isDeleted === true) {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    if (requires2FA === true) {
      const otpResult = await sendAndStoreOtp(user.email, "LOGIN_2FA", { userId: user._id });
      return res.status(200).json({
        success: true,
        requires2FA: true,
        verificationId: otpResult.verificationId,
        email: maskEmail(user.email),
        message: "Credentials verified. A 6-digit 2FA verification code has been sent to your email.",
      });
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
    return res.status(500).json({ success: false, message: error.message || "Login failed" });
  }
};

// 5. Verify 2FA OTP
const verifyOtp = async (req, res) => {
  try {
    const { verificationId, otp, identifier, purpose } = req.body;

    if (verificationId) {
      const result = await verify2FAOtp(verificationId, otp);

      const user = await User.findById(result.userId);
      if (!user || user.isDeleted === true) {
        return res.status(404).json({ success: false, message: "User account not found" });
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json({ success: false, message: "Account is not active" });
      }

      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "2FA authentication successful",
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
    }

    if (identifier && purpose) {
      const result = await verifyOtpCode(identifier, otp, purpose);
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(400).json({ success: false, message: "Verification ID and OTP code are required" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(400).json({ success: false, message: error.message || "OTP verification failed" });
  }
};

// 6. Resend 2FA OTP
const resendOtp = async (req, res) => {
  try {
    const { verificationId, identifier, purpose } = req.body;

    if (verificationId) {
      const result = await resend2FAOtp(verificationId);
      return res.status(200).json({
        success: true,
        message: result.message,
        verificationId: result.verificationId,
        email: result.email,
      });
    }

    if (identifier && purpose) {
      const result = await sendAndStoreOtp(identifier, purpose);
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(400).json({ success: false, message: "Verification ID is required to resend OTP" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(400).json({ success: false, message: error.message || "Failed to resend OTP" });
  }
};

// 7. Verify Account Setup Token
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

    const user = await User.findOne({ _id: setupTokenDoc.userId, isDeleted: { $ne: true } });
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

// 8. Account Setup / Set Password
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

    const user = await User.findOne({ _id: setupTokenDoc.userId, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    if (username && username.trim().toLowerCase() !== user.username) {
      const normalizedUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({ username: normalizedUsername, isDeleted: { $ne: true } });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: "Username is already taken" });
      }
      user.username = normalizedUsername;
    }

    user.passwordHash = await hashPassword(password);
    user.status = "ACTIVE";
    user.emailVerified = true;
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

// 9. Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
    if (!user) {
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

// 10. Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetTokenDoc = await PasswordResetToken.findOne({ tokenHash });

    if (!resetTokenDoc || resetTokenDoc.usedAt || resetTokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired password reset link" });
    }

    const user = await User.findOne({ _id: resetTokenDoc.userId, isDeleted: { $ne: true } });
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

// 11. Send Generic OTP
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

module.exports = {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
  verifyOtp,
  resendOtp,
  setPassword,
  accountSetup,
  verifyAccountSetupToken,
  forgotPassword,
  resetPassword,
  sendOtp,
};
