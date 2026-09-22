const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createStudentSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  nameEnglish: Joi.string().trim().min(2).max(100).required(),
  nameArabic: Joi.string().trim().max(100).allow(""),
  placeEnglish: Joi.string().trim().max(100).allow(""),
  placeArabic: Joi.string().trim().max(100).allow(""),
  dateOfBirth: Joi.date().iso().required(),
  admissionYear: Joi.number().integer().min(2000).max(2100).required(),
  classId: Joi.string().hex().length(24).allow(null, ""),
  institutionId: Joi.string().hex().length(24).allow(null, ""),
  contactNumber: Joi.string().trim().allow(""),
  fatherName: Joi.string().trim().min(2).max(100).required(),
  motherName: Joi.string().trim().min(2).max(100).required(),
  photo: Joi.string().trim().allow(""),
});

const updateStudentSchema = Joi.object({
  nameEnglish: Joi.string().trim().min(2).max(100),
  nameArabic: Joi.string().trim().max(100).allow(""),
  placeEnglish: Joi.string().trim().max(100).allow(""),
  placeArabic: Joi.string().trim().max(100).allow(""),
  dateOfBirth: Joi.date().iso(),
  admissionYear: Joi.number().integer().min(2000).max(2100),
  classId: Joi.string().hex().length(24).allow(null, ""),
  institutionId: Joi.string().hex().length(24).allow(null, ""),
  contactNumber: Joi.string().trim().allow(""),
  fatherName: Joi.string().trim().min(2).max(100),
  motherName: Joi.string().trim().min(2).max(100),
  photo: Joi.string().trim().allow(""),
});

const registerStudentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).allow("").optional(),
  email: Joi.string().email().required(),
  username: Joi.string().trim().alphanum().min(3).max(30).allow("").optional(),
  mobile: Joi.string().trim().allow("").optional(),
  nameEnglish: Joi.string().trim().min(2).max(100).required(),
  nameArabic: Joi.string().trim().max(100).allow("").optional(),
  placeEnglish: Joi.string().trim().max(100).allow("").optional(),
  placeArabic: Joi.string().trim().max(100).allow("").optional(),
  dateOfBirth: Joi.date().iso().required(),
  admissionYear: Joi.number().integer().min(2000).max(2100).required(),
  classId: Joi.string().hex().length(24).allow(null, "").optional(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  contactNumber: Joi.string().trim().allow("").optional(),
  fatherName: Joi.string().trim().min(2).max(100).required(),
  motherName: Joi.string().trim().min(2).max(100).required(),
  photo: Joi.string().trim().allow("").optional(),
});

module.exports = {
  validateStudent: validateSchema(createStudentSchema),
  validateUpdateStudent: validateSchema(updateStudentSchema),
  validateRegisterStudent: validateSchema(registerStudentSchema),
};

