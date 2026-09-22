const Event = require("./event.model");
const EventRegistration = require("./event-registration.model");

// Events
const createEvent = async (data) => Event.create(data);
const getEvents = async (filter = {}) => Event.find(filter).sort({ eventDate: 1 }).lean();
const getEventBySlug = async (slug) => Event.findOne({ slug }).lean();
const updateEvent = async (id, data) => Event.findByIdAndUpdate(id, data, { new: true });

// Event Registrations
const registerForEvent = async (data) => {
  const event = await Event.findById(data.eventId).lean();
  if (!event) throw new Error("Event not found");

  if (!event.isRegistrationOpen || event.status === "CANCELLED" || event.status === "COMPLETED") {
    throw new Error("Registration for this event is closed");
  }

  return EventRegistration.create(data);
};

const getEventRegistrations = async (filter = {}) => {
  return EventRegistration.find(filter)
    .populate("eventId", "title slug eventDate location venue")
    .populate("userId", "name email username role")
    .populate("paymentId", "transactionId status amount")
    .lean();
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
