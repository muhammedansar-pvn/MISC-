const Joi = require("joi");
const { validateSchema } = require("./authValidator");

const createStudentSchema = Joi.object({
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

module.exports = {
  validateStudent: validateSchema(createStudentSchema),
  validateUpdateStudent: validateSchema(updateStudentSchema),
};