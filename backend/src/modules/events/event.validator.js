const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const eventSchema = Joi.object({
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().lowercase().required(),
  description: Joi.string().required(),
  eventDate: Joi.date().iso().required(),
  venue: Joi.string().trim().required(),
  registrationFee: Joi.number().min(0).default(0),
  registrationDeadline: Joi.date().iso().allow(null),
  isRegistrationOpen: Joi.boolean().default(true),
  status: Joi.string().valid("UPCOMING", "ONGOING", "COMPLETED", "CANCELLED").required(),
});

const eventRegistrationSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  userId: Joi.string().hex().length(24).allow(null, ""),
  participantName: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  mobile: Joi.string().trim().required(),
  institutionName: Joi.string().trim().allow(""),
  registrationStatus: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED").default("PENDING"),
  paymentId: Joi.string().hex().length(24).allow(null, ""),
});

module.exports = {
  validateEvent: validateSchema(eventSchema),
  validateEventRegistration: validateSchema(eventRegistrationSchema),
};
