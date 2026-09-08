const crypto = require("crypto");
const AccountSetupToken = require("../models/AccountSetupToken");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");

// Verify account setup token
const verifyAccountSetupToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Setup token is required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const setupToken = await AccountSetupToken.findOne({
      tokenHash,
    });

    if (!setupToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid setup link",
      });
    }

    if (setupToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: "This setup link has already been used",
      });
    }

    if (setupToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This setup link has expired",
      });
    }

    const user = await User.findById(setupToken.userId).select(
      "_id role status mobile"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Setup link is valid",
      data: {
        userId: user._id,
        role: user.role,
        status: user.status,
        expiresAt: setupToken.expiresAt,
      },
    });
  } catch (error) {
    console.error("Account setup token verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify setup link",
    });
  }
};

// Complete account setup
const setupAccount = async (req, res) => {
  try {
    const { token, username, password } = req.body;

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const setupToken = await AccountSetupToken.findOne({
      tokenHash,
    });

    if (!setupToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid setup link",
      });
    }

    if (setupToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: "This setup link has already been used",
      });
    }

    if (setupToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This setup link has expired",
      });
    }

    const user = await User.findById(setupToken.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    if (user.status !== "PENDING_SETUP") {
      return res.status(400).json({
        success: false,
        message: "This account is not available for setup",
      });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase().trim(),
      _id: { $ne: user._id },
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    const passwordHash = await hashPassword(password);

    user.username = username.toLowerCase().trim();
    user.passwordHash = passwordHash;
    user.status = "ACTIVE";

    await user.save();

    setupToken.usedAt = new Date();
    await setupToken.save();

    return res.status(200).json({
      success: true,
      message: "Account setup completed successfully",
      data: {
        userId: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Account setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Account setup failed",
    });
  }
};

module.exports = {
  verifyAccountSetupToken,
  setupAccount,
};