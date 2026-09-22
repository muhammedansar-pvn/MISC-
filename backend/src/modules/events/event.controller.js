const eventService = require("./event.service");

const handleCreateEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body);
    return res.status(201).json({ success: true, message: "Event created successfully", data: event });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create event" });
  }
};

const handleGetEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const events = await eventService.getEvents(filter);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve events" });
  }
};

const handleGetEventBySlug = async (req, res) => {
  try {
    const event = await eventService.getEventBySlug(req.params.slug);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve event" });
  }
};

const handleUpdateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event updated successfully", data: event });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update event" });
  }
};

const handleRegisterForEvent = async (req, res) => {
  try {
    const regData = { ...req.body };
    if (req.user) {
      regData.userId = req.user.userId;
    }
    const registration = await eventService.registerForEvent(regData);
    return res.status(201).json({ success: true, message: "Registered for event successfully", data: registration });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Event registration failed" });
  }
};

const handleGetEventRegistrations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    const registrations = await eventService.getEventRegistrations(filter);
    return res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve event registrations" });
  }
};

module.exports = {
  handleCreateEvent,
  handleGetEvents,
  handleGetEventBySlug,
  handleUpdateEvent,
  handleRegisterForEvent,
  handleGetEventRegistrations,
};
