const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createFacultySchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  facultyId: Joi.string().trim().required(),
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
  contactNumber: Joi.string().trim().allow(""),
  photo: Joi.string().trim().allow(""),
  department: Joi.string().trim().allow("", null),
  assignedClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
  assignedSubjects: Joi.array().items(Joi.string().hex().length(24)).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const updateFacultySchema = Joi.object({
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
  contactNumber: Joi.string().trim().allow(""),
  photo: Joi.string().trim().allow(""),
  department: Joi.string().trim().allow("", null),
  assignedClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
  assignedSubjects: Joi.array().items(Joi.string().hex().length(24)).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE"),
});

module.exports = {
  validateCreateFaculty: validateSchema(createFacultySchema),
  validateUpdateFaculty: validateSchema(updateFacultySchema),
};
