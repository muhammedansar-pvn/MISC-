const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const {
  handleGetNotifications,
  handleGetUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
} = require("./notification.controller");

const router = express.Router();

// All notification endpoints require authenticated user
router.use(requireAuth);

router.get("/", handleGetNotifications);
router.get("/unread-count", handleGetUnreadCount);
router.patch("/read-all", handleMarkAllAsRead);
router.patch("/:id/read", handleMarkAsRead);

module.exports = router;
