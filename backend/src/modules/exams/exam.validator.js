const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const examSchema = Joi.object({
  title: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().trim().allow("", null).optional(),
  academicYearId: Joi.string().hex().length(24).required(),
  term: Joi.string().trim().allow("").optional(),
  examType: Joi.string().trim().allow("").optional(),
  fee: Joi.number().min(0).allow(null).optional(),
  examFee: Joi.number().min(0).allow(null).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  examStartDate: Joi.date().iso().optional(),
  examEndDate: Joi.date().iso().optional(),
  registrationStartDate: Joi.date().iso().allow(null).optional(),
  registrationEndDate: Joi.date().iso().allow(null).optional(),
  eligibleClassIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  subjectIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  status: Joi.string().valid("DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "PUBLISHED").default("SCHEDULED"),
  publishedAt: Joi.date().iso().allow(null).optional(),
  resultPublicationDate: Joi.date().iso().allow(null).optional(),
})
  .or("title", "name")
  .custom((value, helpers) => {
    if (value.fee !== undefined && value.examFee === undefined) {
      value.examFee = value.fee;
    }
    if (value.examFee !== undefined && value.fee === undefined) {
      value.fee = value.examFee;
    }
    const sDate = value.startDate || value.examStartDate;
    const eDate = value.endDate || value.examEndDate;
    if (!sDate) {
      return helpers.message("Start date is required");
    }
    if (!eDate) {
      return helpers.message("End date is required");
    }
    if (new Date(eDate) <= new Date(sDate)) {
      return helpers.message("End date must be greater than start date");
    }
    if (value.registrationStartDate && value.registrationEndDate) {
      if (new Date(value.registrationEndDate) < new Date(value.registrationStartDate)) {
        return helpers.message("Registration end date cannot be earlier than registration start date");
      }
    }
    if (value.status === "PUBLISHED") {
      if (!value.registrationStartDate || !value.registrationEndDate) {
        return helpers.message("Published examinations must have registration start and end dates configured");
      }
      if (!value.eligibleClassIds || value.eligibleClassIds.length === 0) {
        return helpers.message("Published examinations must have at least one eligible class configured");
      }
    }
    if (value.resultPublicationDate) {
      const pubDate = new Date(value.resultPublicationDate);
      if (isNaN(pubDate.getTime())) {
        return helpers.message("Result publication date must be a valid date");
      }
    }
    return value;
  });

const publishExamSchema = Joi.object({
  status: Joi.string().valid("DRAFT", "PUBLISHED").optional(),
  isPublished: Joi.boolean().optional(),
});


const examScheduleSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).optional(),
  examDate: Joi.date().iso().required(),
  startTime: Joi.string().trim().required(),
  endTime: Joi.string().trim().required(),
  maxMarks: Joi.number().greater(0).required(),
  passMarks: Joi.number().min(0).max(Joi.ref("maxMarks")).required(),
  status: Joi.string().valid("SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED").optional(),
});

const examRegistrationSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).allow(null, "").optional(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  rollNumber: Joi.string().trim().allow(null, "").optional(),
  registrationStatus: Joi.string().valid("REGISTERED", "HALL_TICKET_ISSUED", "CANCELLED").default("REGISTERED"),
  paymentId: Joi.string().hex().length(24).allow(null, ""),
});

const markEntrySchema = Joi.object({
  examId: Joi.string().hex().length(24).optional(),
  examScheduleId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).optional(),
  subjectId: Joi.string().hex().length(24).optional(),
  academicYearId: Joi.string().hex().length(24).optional(),
  marksObtained: Joi.number().min(0).required(),
  isAbsent: Joi.boolean().default(false),
  evaluatorId: Joi.string().hex().length(24).allow(null, "").optional(),
  status: Joi.string().valid("DRAFT", "SUBMITTED", "VERIFIED", "PUBLISHED").default("DRAFT"),
  remarks: Joi.string().allow("").optional(),
});

const rosterMarksSchema = Joi.object({
  status: Joi.string().valid("DRAFT", "SUBMITTED").default("SUBMITTED"),
  marks: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.string().hex().length(24).required(),
        marksObtained: Joi.number().min(0).required(),
        isAbsent: Joi.boolean().default(false),
        remarks: Joi.string().allow("").optional(),
      })
    )
    .min(1)
    .required(),
});

const markCorrectionRequestSchema = Joi.object({
  markEntryId: Joi.string().hex().length(24).required(),
  newMarks: Joi.number().min(0).required(),
  reason: Joi.string().trim().min(3).required(),
});

const reviewCorrectionRequestSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  adminRemarks: Joi.string().trim().allow("").optional(),
});

const examResultSchema = Joi.object({
  examId: Joi.string().hex().length(24).required(),
  studentId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  academicYearId: Joi.string().hex().length(24).optional(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  totalMaxMarks: Joi.number().greater(0).required(),
  totalMarksObtained: Joi.number().min(0).required(),
  percentage: Joi.number().min(0).max(100).required(),
  grade: Joi.string().trim().required(),
  resultStatus: Joi.string().valid("PASSED", "FAILED", "WITHHELD").required(),
  status: Joi.string().valid("DRAFT", "PUBLISHED").optional(),
  publishedAt: Joi.date().iso().allow(null),
});

module.exports = {
  validateExam: validateSchema(examSchema),
  validateExamSchedule: validateSchema(examScheduleSchema),
  validateExamRegistration: validateSchema(examRegistrationSchema),
  validateMarkEntry: validateSchema(markEntrySchema),
  validateRosterMarks: validateSchema(rosterMarksSchema),
  validateMarkCorrectionRequest: validateSchema(markCorrectionRequestSchema),
  validateReviewCorrectionRequest: validateSchema(reviewCorrectionRequestSchema),
  validateExamResult: validateSchema(examResultSchema),
  validatePublishExam: validateSchema(publishExamSchema),
};

