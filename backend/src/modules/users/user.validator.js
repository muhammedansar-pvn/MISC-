const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const userInvitationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  role: Joi.string().valid("ADMIN", "STUDENT", "FACULTY", "INSTITUTION").required(),
  username: Joi.string().alphanum().min(3).max(30).trim().allow("", null),
  department: Joi.string().trim().allow("", null),
  mobile: Joi.string().trim().allow("", null),
  status: Joi.string().valid("PENDING_SETUP", "ACTIVE", "INVITED", "SUSPENDED", "INACTIVE").allow("", null),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim(),
  role: Joi.string().valid("ADMIN", "STUDENT", "FACULTY", "INSTITUTION"),
  department: Joi.string().trim().allow("", null),
  mobile: Joi.string().trim().allow("", null),
  status: Joi.string().valid("PENDING_SETUP", "ACTIVE", "INVITED", "SUSPENDED", "INACTIVE"),
});

const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("PENDING_SETUP", "ACTIVE", "INVITED", "SUSPENDED", "INACTIVE").required(),
});

module.exports = {
  validateUserInvitation: validateSchema(userInvitationSchema),
  validateUpdateUser: validateSchema(updateUserSchema),
  validateUpdateUserStatus: validateSchema(updateUserStatusSchema),
};
