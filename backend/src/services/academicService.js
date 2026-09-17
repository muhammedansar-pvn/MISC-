const AcademicYear = require("../models/AcademicYear");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Syllabus = require("../models/Syllabus");

// AcademicYear
const createAcademicYear = async (data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({}, { isCurrent: false });
  }
  return AcademicYear.create(data);
};
const getAcademicYears = async (filter = {}) => AcademicYear.find(filter).sort({ startDate: -1 });
const getAcademicYearById = async (id) => AcademicYear.findById(id);
const updateAcademicYear = async (id, data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({ _id: { $ne: id } }, { isCurrent: false });
  }
  return AcademicYear.findByIdAndUpdate(id, data, { new: true });
};

// Class
const createClass = async (data) => Class.create(data);
const getClasses = async (filter = {}) => Class.find(filter).populate("institutionId").populate("academicYearId");
const getClassById = async (id) => Class.findById(id).populate("institutionId").populate("academicYearId");
const updateClass = async (id, data) => Class.findByIdAndUpdate(id, data, { new: true });

// Subject
const createSubject = async (data) => Subject.create(data);
const getSubjects = async (filter = {}) => Subject.find(filter);
const getSubjectById = async (id) => Subject.findById(id);
const updateSubject = async (id, data) => Subject.findByIdAndUpdate(id, data, { new: true });

// Syllabus
const createSyllabus = async (data) => Syllabus.create(data);
const getSyllabuses = async (filter = {}) => Syllabus.find(filter).populate("subjectId").populate("classId").populate("academicYearId");
const getSyllabusById = async (id) => Syllabus.findById(id).populate("subjectId").populate("classId").populate("academicYearId");
const updateSyllabus = async (id, data) => Syllabus.findByIdAndUpdate(id, data, { new: true });

module.exports = {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  createClass,
  getClasses,
  getClassById,
  updateClass,
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  createSyllabus,
  getSyllabuses,
  getSyllabusById,
  updateSyllabus,
};
