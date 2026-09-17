const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

// Events
const createEvent = async (data) => Event.create(data);
const getEvents = async (filter = {}) => Event.find(filter).sort({ eventDate: 1 });
const getEventBySlug = async (slug) => Event.findOne({ slug });
const updateEvent = async (id, data) => Event.findByIdAndUpdate(id, data, { new: true });

// Event Registrations
const registerForEvent = async (data) => {
  const event = await Event.findById(data.eventId);
  if (!event) throw new Error("Event not found");

  if (!event.isRegistrationOpen || event.status === "CANCELLED" || event.status === "COMPLETED") {
    throw new Error("Registration for this event is closed");
  }

  return EventRegistration.create(data);
};

const getEventRegistrations = async (filter = {}) => {
  return EventRegistration.find(filter).populate("eventId").populate("userId").populate("paymentId");
};

const updateEventRegistrationStatus = async (id, registrationStatus, paymentId) => {
  const update = { registrationStatus };
  if (paymentId) update.paymentId = paymentId;
  return EventRegistration.findByIdAndUpdate(id, update, { new: true });
};

module.exports = {
  createEvent,
  getEvents,
  getEventBySlug,
  updateEvent,
  registerForEvent,
  getEventRegistrations,
  updateEventRegistrationStatus,
};
