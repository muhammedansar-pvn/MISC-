const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createAssignmentSchema = Joi.object({
  facultyId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
  notes: Joi.string().trim().allow("").optional(),
});

const queryAssignmentSchema = Joi.object({
  facultyId: Joi.string().hex().length(24).optional(),
  academicYearId: Joi.string().hex().length(24).optional(),
  classId: Joi.string().hex().length(24).optional(),
  subjectId: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

module.exports = {
  validateCreateAssignment: validateSchema(createAssignmentSchema),
  validateQueryAssignment: validateSchema(queryAssignmentSchema, "query"),
};
