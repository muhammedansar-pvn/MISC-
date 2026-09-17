const Joi = require("joi");
const { validateSchema } = require("./authValidator");

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
  institutionId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const subjectSchema = Joi.object({
  subjectName: Joi.string().trim().required(),
  subjectCode: Joi.string().trim().uppercase().required(),
  category: Joi.string().valid("ISLAMIC_STUDIES", "CONTEMPORARY", "LANGUAGE", "GENERAL").required(),
  description: Joi.string().trim().allow(""),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const syllabusSchema = Joi.object({
  title: Joi.string().trim().required(),
  subjectId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).required(),
  fileUrl: Joi.string().trim().required(),
  version: Joi.string().trim().required(),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "SUPERSEDED").required(),
});

module.exports = {
  validateAcademicYear: validateSchema(academicYearSchema),
  validateClass: validateSchema(classSchema),
  validateSubject: validateSchema(subjectSchema),
  validateSyllabus: validateSchema(syllabusSchema),
};
