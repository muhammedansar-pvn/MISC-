const crypto = require("crypto");
const User = require("../models/User");
const { sendUserInvitationEmail } = require("../services/emailService");


const createUserInvitation = async (req, res) => {
  try {
    const { name, email, role, department, mobile } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email or username
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const allowedRoles = ["ADMIN", "STUDENT", "FACULTY", "INSTITUTION"];
    const targetRole = role ? role.toUpperCase() : "STUDENT";

    if (!allowedRoles.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      });
    }

    // Generate cryptographically secure 32-byte token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Compute SHA-256 hash to store in DB
    const invitationTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires in 30 minutes
    const invitationTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Create user record in INVITED status
    const user = new User({
      name,
      email: normalizedEmail,
      username: normalizedEmail,
      role: targetRole,
      department: department || undefined,
      mobile: mobile || undefined,
      status: "INVITED",
      invitationTokenHash,
      invitationTokenExpiresAt,
    });

    await user.save();

    // Send invitation email via Resend
    try {
      await sendUserInvitationEmail(normalizedEmail, name, rawToken);
    } catch (emailError) {
      // Rollback user creation to avoid inconsistent state on email failure
      await User.findByIdAndDelete(user._id);
      console.error("Failed to send invitation email, transaction rolled back:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send invitation email. Please check email configuration.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User invitation sent successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        invitationExpiresAt: user.invitationTokenExpiresAt,
      },
    });
  } catch (error) {
    console.error("Create User Invitation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while inviting user",
    });
  }
};

module.exports = {
  createUserInvitation,
};
