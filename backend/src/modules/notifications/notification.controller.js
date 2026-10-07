const notificationService = require("./notification.service");

/**
 * GET /api/notifications
 * Retrieves notifications for the authenticated user only.
 */
const handleGetNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { page, limit, unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve notifications",
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns unread notification count for the authenticated user.
 */
const handleGetUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const result = await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to get unread notification count",
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read, strictly verifying ownership.
 */
const handleMarkAsRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications belonging to the authenticated user as read.
 */
const handleMarkAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read",
    });
  }
};

module.exports = {
  handleGetNotifications,
  handleGetUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
};
