const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const examSchema = Joi.object({
  title: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  academicYearId: Joi.string().hex().length(24).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  status: Joi.string().valid("DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "PUBLISHED").required(),
});

const examScheduleSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).required(),
  examDate: Joi.date().iso().required(),
  startTime: Joi.string().trim().required(),
  endTime: Joi.string().trim().required(),
  maxMarks: Joi.number().greater(0).required(),
  passMarks: Joi.number().min(0).max(Joi.ref("maxMarks")).required(),
});

const examRegistrationSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).required(),
  institutionId: Joi.string().hex().length(24).required(),
  rollNumber: Joi.string().trim().required(),
  registrationStatus: Joi.string().valid("REGISTERED", "HALL_TICKET_ISSUED", "CANCELLED").default("REGISTERED"),
  paymentId: Joi.string().hex().length(24).allow(null, ""),
});

const markEntrySchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  examScheduleId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).required(),
  marksObtained: Joi.number().min(0).required(),
  isAbsent: Joi.boolean().default(false),
  evaluatorId: Joi.string().hex().length(24).allow(null, ""),
  status: Joi.string().valid("DRAFT", "SUBMITTED", "VERIFIED").default("DRAFT"),
});

const examResultSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  institutionId: Joi.string().hex().length(24).required(),
  totalMaxMarks: Joi.number().greater(0).required(),
  totalMarksObtained: Joi.number().min(0).required(),
  percentage: Joi.number().min(0).max(100).required(),
  grade: Joi.string().trim().required(),
  resultStatus: Joi.string().valid("PASSED", "FAILED", "WITHHELD").required(),
  publishedAt: Joi.date().iso().allow(null),
});

module.exports = {
  validateExam: validateSchema(examSchema),
  validateExamSchedule: validateSchema(examScheduleSchema),
  validateExamRegistration: validateSchema(examRegistrationSchema),
  validateMarkEntry: validateSchema(markEntrySchema),
  validateExamResult: validateSchema(examResultSchema),
};
