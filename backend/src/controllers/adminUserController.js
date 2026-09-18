const crypto = require("crypto");
const User = require("../models/User");
const AccountSetupToken = require("../models/AccountSetupToken");
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
    });

    await user.save();

    // Create invitation token in accountSetupTokens
    const setupTokenDoc = await AccountSetupToken.create({
      userId: user._id,
      tokenHash: invitationTokenHash,
      purpose: "ADMIN_INVITATION",
      expiresAt: invitationTokenExpiresAt,
    });

    // Send invitation email via Resend
    try {
      const emailResult = await sendUserInvitationEmail(normalizedEmail, name, rawToken);
      if (!emailResult || emailResult.success === false) {
        throw new Error(emailResult?.error || emailResult?.message || "Failed to deliver invitation email");
      }
    } catch (emailError) {
      // Rollback user creation and token doc to avoid inconsistent state
      await AccountSetupToken.findByIdAndDelete(setupTokenDoc._id);
      await User.findByIdAndDelete(user._id);
      console.error("Failed to send invitation email, transaction rolled back:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send account setup invitation. Please try again.",
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
        invitationExpiresAt: invitationTokenExpiresAt,
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

const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toUpperCase();
    }

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user details",
    });
  }
};

const Event = require("../models/Event");
const Exam = require("../models/Exam");
const Payment = require("../models/Payment");

const getDashboardStats = async (req, res) => {
  try {
    const [userStatsFacet, events, exams, payments] = await Promise.all([
      User.aggregate([
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

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: extractCount(facet.totalUsers),
        activeUsers: extractCount(facet.activeUsers),
        pendingUsers: extractCount(facet.pendingUsers),
        institutions: extractCount(facet.institutions),
        students: extractCount(facet.students),
        faculty: extractCount(facet.faculty),
        events,
        exams,
        payments,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  createUserInvitation,
  getUsers,
  getUserById,
  getDashboardStats,
};
