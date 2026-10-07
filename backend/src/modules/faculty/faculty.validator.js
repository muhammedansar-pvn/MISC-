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

const facultySelfProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).allow("", null).optional(),
  mobile: Joi.string().trim().pattern(/^\+?[0-9\s().-]{7,20}$/).allow("", null).optional(),
  nameEnglish: Joi.string().trim().min(2).max(100).optional(),
  nameArabic: Joi.string().trim().max(100).allow("").optional(),
  placeEnglish: Joi.string().trim().max(100).allow("").optional(),
  placeArabic: Joi.string().trim().max(100).allow("").optional(),
  designation: Joi.string().trim().max(100).allow("").optional(),
  islamicQualification: Joi.string().trim().max(255).allow("").optional(),
  academicQualification: Joi.string().trim().max(255).allow("").optional(),
  previousExperience: Joi.string().trim().max(1000).allow("").optional(),
  contactNumber: Joi.string().trim().pattern(/^\+?[0-9\s().-]{7,20}$/).allow("").optional(),
  photo: Joi.string().trim().allow("").optional(),

  // Explicitly reject administrative and institutional fields
  facultyId: Joi.forbidden().messages({ "any.unknown": "Updating facultyId is not permitted for faculty" }),
  institutionId: Joi.forbidden().messages({ "any.unknown": "Updating institutionId is not permitted for faculty" }),
  assignedClasses: Joi.forbidden().messages({ "any.unknown": "Updating assignedClasses is not permitted for faculty" }),
  assignedSubjects: Joi.forbidden().messages({ "any.unknown": "Updating assignedSubjects is not permitted for faculty" }),
  joiningYear: Joi.forbidden().messages({ "any.unknown": "Updating joiningYear is not permitted for faculty" }),
  department: Joi.forbidden().messages({ "any.unknown": "Updating department is not permitted for faculty" }),
  status: Joi.forbidden().messages({ "any.unknown": "Updating status is not permitted for faculty" }),
  role: Joi.forbidden().messages({ "any.unknown": "Updating role is not permitted for faculty" }),
  userId: Joi.forbidden().messages({ "any.unknown": "Updating userId is not permitted for faculty" }),
  _id: Joi.forbidden().messages({ "any.unknown": "Updating _id is not permitted for faculty" }),
  isDeleted: Joi.forbidden().messages({ "any.unknown": "Updating isDeleted is not permitted for faculty" }),
}).unknown(false);

module.exports = {
  validateCreateFaculty: validateSchema(createFacultySchema),
  validateUpdateFaculty: validateSchema(updateFacultySchema),
  validateUpdateFacultyStatus: validateSchema(updateFacultyStatusSchema),
  validateUpdateMyFacultyProfile: validateSchema(facultySelfProfileSchema),
};
