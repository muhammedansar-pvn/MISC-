const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const academicYearSchema = Joi.object({
  yearName: Joi.string().trim().required(),
  yearCode: Joi.string().trim().uppercase().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  isCurrent: Joi.boolean().default(false),
  status: Joi.string().valid("UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED").required(),
});

const classSchema = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  academicYearId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const subjectSchema = Joi.object({
  subjectName: Joi.string().trim(),
  name: Joi.string().trim(),
  subjectCode: Joi.string().trim().uppercase(),
  code: Joi.string().trim().uppercase(),
  category: Joi.string().valid("ISLAMIC_STUDIES", "CONTEMPORARY", "LANGUAGE", "GENERAL").default("GENERAL"),
  type: Joi.string().valid("THEORY", "PRACTICAL", "BOTH").optional(),
  credits: Joi.number().optional(),
  description: Joi.string().trim().allow(""),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
}).or("subjectName", "name").or("subjectCode", "code");

const syllabusSchema = Joi.object({
  title: Joi.string().trim().required(),
  subjectId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).required(),
  fileUrl: Joi.string().trim().required(),
  version: Joi.string().trim().default("1.0"),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "SUPERSEDED", "ACTIVE", "INACTIVE").default("ACTIVE"),
});

const updateSyllabusSchema = Joi.object({
  title: Joi.string().trim(),
  subjectId: Joi.string().hex().length(24),
  classId: Joi.string().hex().length(24),
  academicYearId: Joi.string().hex().length(24),
  fileUrl: Joi.string().trim(),
  version: Joi.string().trim(),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "SUPERSEDED", "ACTIVE", "INACTIVE"),
});

module.exports = {
  validateAcademicYear: validateSchema(academicYearSchema),
  validateClass: validateSchema(classSchema),
  validateSubject: validateSchema(subjectSchema),
  validateSyllabus: validateSchema(syllabusSchema),
  validateUpdateSyllabus: validateSchema(updateSyllabusSchema),
};
