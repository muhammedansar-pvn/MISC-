const AcademicYear = require("./academic-year.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const Syllabus = require("./syllabus.model");

// AcademicYear
const createAcademicYear = async (data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({}, { isCurrent: false });
  }
  return AcademicYear.create(data);
};

const getAcademicYears = async (filter = {}) =>
  AcademicYear.find(filter).sort({ startDate: -1 }).lean();

const getAcademicYearById = async (id) => AcademicYear.findById(id).lean();

const updateAcademicYear = async (id, data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({ _id: { $ne: id } }, { isCurrent: false });
  }
  return AcademicYear.findByIdAndUpdate(id, data, { new: true });
};

// Class
const createClass = async (data) => Class.create(data);

const getClasses = async (filter = {}) =>
  Class.find(filter)
    .populate("institutionId", "name code")
    .populate("academicYearId", "yearCode title")
    .lean();

const getClassById = async (id) =>
  Class.findById(id)
    .populate("institutionId", "name code")
    .populate("academicYearId", "yearCode title")
    .lean();

const updateClass = async (id, data) => Class.findByIdAndUpdate(id, data, { new: true });

// Subject
const createSubject = async (data) => {
  const payload = {
    ...data,
    subjectName: data.subjectName || data.name,
    subjectCode: data.subjectCode || data.code,
  };
  return Subject.create(payload);
};

const getSubjects = async (filter = {}) => Subject.find(filter).sort({ subjectCode: 1 }).lean();

const getSubjectById = async (id) => Subject.findById(id).lean();

const updateSubject = async (id, data) => {
  const payload = { ...data };
  if (data.name && !data.subjectName) payload.subjectName = data.name;
  if (data.code && !data.subjectCode) payload.subjectCode = data.code;
  return Subject.findByIdAndUpdate(id, payload, { new: true });
};

// Syllabus
const createSyllabus = async (data) => {
  const syllabus = await Syllabus.create(data);
  return Syllabus.findById(syllabus._id)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

const getSyllabuses = async (filter = {}, search = "") => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { version: searchRegex },
    ];
  }

  return Syllabus.find(query)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .sort({ createdAt: -1 })
    .lean();
};

const getSyllabusById = async (id) =>
  Syllabus.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

const updateSyllabus = async (id, data) =>
  Syllabus.findByIdAndUpdate(id, data, { new: true })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

const deleteSyllabus = async (id, hardDelete = false) => {
  if (hardDelete) {
    return Syllabus.findByIdAndDelete(id);
  }
  return Syllabus.findByIdAndUpdate(
    id,
    { status: "INACTIVE", isDeleted: true },
    { new: true }
  );
};

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
  deleteSyllabus,
};
