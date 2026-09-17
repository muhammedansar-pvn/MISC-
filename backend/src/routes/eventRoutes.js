const express = require("express");
const {
  handleCreateEvent,
  handleGetEvents,
  handleGetEventBySlug,
  handleUpdateEvent,
  handleRegisterForEvent,
  handleGetEventRegistrations,
} = require("../controllers/eventController");
const { validateEvent, validateEventRegistration } = require("../validators/eventValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Public event browsing
router.get("/events", handleGetEvents);
router.get("/events/:slug", handleGetEventBySlug);

// Admin event management
router.post("/events", requireAuth, requireRole("ADMIN"), validateEvent, handleCreateEvent);
router.put("/events/:id", requireAuth, requireRole("ADMIN"), validateEvent, handleUpdateEvent);

// Event Registrations
router.post("/event-registrations", validateEventRegistration, handleRegisterForEvent);
router.get("/event-registrations", requireAuth, requireRole("ADMIN"), handleGetEventRegistrations);

module.exports = router;
