const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createFacultySchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  facultyId: Joi.string().trim().min(2).max(40).required(),
  institutionId: Joi.string().hex().length(24).allow(null, ""),
  nameEnglish: Joi.string().trim().allow(""),
  nameArabic: Joi.string().trim().allow(""),
  placeEnglish: Joi.string().trim().allow(""),
  placeArabic: Joi.string().trim().allow(""),
  designation: Joi.string().trim().allow(""),
  islamicQualification: Joi.string().trim().allow(""),
  academicQualification: Joi.string().trim().allow(""),
  joiningYear: Joi.number().integer().min(1950).max(2100).allow(null),
  previousExperience: Joi.string().trim().allow(""),
  contactNumber: Joi.string().trim().pattern(/^\+?[0-9\s().-]{7,20}$/).allow(""),
  photo: Joi.string().trim().allow(""),
  department: Joi.string().trim().allow("", null),
  assignedClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
  assignedSubjects: Joi.array().items(Joi.string().hex().length(24)).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const updateFacultySchema = Joi.object({
  email: Joi.string().trim().email().lowercase(),
  institutionId: Joi.string().hex().length(24).allow(null, ""),
  facultyId: Joi.string().trim().min(2).max(40),
  nameEnglish: Joi.string().trim().min(2).max(100),
  nameArabic: Joi.string().trim().allow(""),
  placeEnglish: Joi.string().trim().allow(""),
  placeArabic: Joi.string().trim().allow(""),
  designation: Joi.string().trim().allow(""),
  islamicQualification: Joi.string().trim().allow(""),
  academicQualification: Joi.string().trim().allow(""),
  joiningYear: Joi.number().integer().min(1950).max(2100).allow(null),
  previousExperience: Joi.string().trim().allow(""),
  contactNumber: Joi.string().trim().pattern(/^\+?[0-9\s().-]{7,20}$/).allow(""),
  photo: Joi.string().trim().allow(""),
  department: Joi.string().trim().allow("", null),
  assignedClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
  assignedSubjects: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const updateFacultyStatusSchema = Joi.object({
  status: Joi.string().uppercase().valid("ACTIVE", "INACTIVE", "SUSPENDED").required(),
});

module.exports = {
  validateCreateFaculty: validateSchema(createFacultySchema),
  validateUpdateFaculty: validateSchema(updateFacultySchema),
  validateUpdateFacultyStatus: validateSchema(updateFacultyStatusSchema),
};
