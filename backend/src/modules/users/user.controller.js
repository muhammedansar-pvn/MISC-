const userService = require("./user.service");

const getCurrentUserId = (req) => {
  if (!req.user) return null;
  const id = req.user.userId || req.user.id || req.user._id;
  return id ? id.toString() : null;
};

const createUserInvitation = async (req, res) => {
  try {
    const result = await userService.createUserInvitation(req.body);
    return res.status(result.isReinvitation ? 200 : 201).json({
      success: true,
      requiresOtp: true,
      message: "User registration initiated. An email verification OTP code has been sent.",
      data: {
        verificationId: result.verificationId,
        email: result.email,
        maskedEmail: result.maskedEmail,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create User Invitation Error:", error);
    if (error.code === 11000 || (error.message && error.message.includes("E11000"))) {
      return res.status(409).json({
        success: false,
        message: "A user with this email address or username already exists.",
      });
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error while inviting user",
      ...(error.code ? { error: { code: error.code, message: error.message } } : {}),
    });
  }
};

const verifyAdminUserOtp = async (req, res) => {
  try {
    const result = await userService.verifyAdminUserOtp(req.body);
    return res.status(200).json({
      success: true,
      message: `Registration successful. An account setup link has been sent to ${result.email}.`,
      data: result,
    });
  } catch (error) {
    console.error("Verify Admin Registration OTP Error:", error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

const resendAdminUserOtp = async (req, res) => {
  try {
    const result = await userService.resendAdminUserOtp(req.body);
    return res.status(200).json({
      success: true,
      message: "A new email verification OTP has been sent.",
      data: result,
    });
  } catch (error) {
    console.error("Resend Admin User OTP Error:", error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to resend OTP code",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);
    if (result.isPaginated) {
      return res.status(200).json({
        success: true,
        count: result.count,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        data: result.users,
      });
    }
    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.users,
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
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve user details",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const currentAdminId = getCurrentUserId(req);
    const updatedUser = await userService.updateUser(req.params.id, req.body, currentAdminId);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const currentAdminId = getCurrentUserId(req);
    const { updatedUser, targetStatus } = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      currentAdminId
    );
    return res.status(200).json({
      success: true,
      message: `User status updated to ${targetStatus}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const currentAdminId = getCurrentUserId(req);
    await userService.deleteUser(req.params.id, currentAdminId);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await userService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
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
  verifyAdminUserOtp,
  resendAdminUserOtp,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
};
