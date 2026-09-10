const crypto = require("crypto");
const User = require("../models/User");
const {
  comparePassword,
  hashPassword,
} = require("../utils/password");
const {
  generateToken,
} = require("../utils/jwt");


const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/Email and password are required",
      });
    }

    const normalizedIdentifier = username.toLowerCase().trim();

    const user = await User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    if (!user.passwordHash) {
      return res.status(403).json({
        success: false,
        message: "Account setup is not completed",
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
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

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


const setPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, password, and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token received in request
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token hash
    const user = await User.findOne({
      invitationTokenHash: tokenHash,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation link.",
      });
    }

    // Check if token has already been used
    if (user.invitationUsedAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation link.",
      });
    }

    // Check if token has expired
    if (!user.invitationTokenExpiresAt || user.invitationTokenExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation link.",
      });
    }

    // Hash the new password using existing password utility
    const newPasswordHash = await hashPassword(password);

    // Update user status and credentials
    user.passwordHash = newPasswordHash;
    user.status = "ACTIVE";
    user.invitationUsedAt = new Date();
    user.invitationTokenHash = undefined;
    user.invitationTokenExpiresAt = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully. You can now login.",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set password. Please try again later.",
    });
  }
};

module.exports = {
  login,
  setPassword,
};