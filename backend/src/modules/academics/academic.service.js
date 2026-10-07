const AcademicYear = require("./academic-year.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const Syllabus = require("./syllabus.model");
const { escapeRegex } = require("../../shared/utils/regex");

// AcademicYear
const createAcademicYear = async (data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({}, { isCurrent: false });
  }
  return AcademicYear.create(data);
};

const getAcademicYears = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      AcademicYear.find(filter).sort({ startDate: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      AcademicYear.countDocuments(filter),
    ]);
    return { data, total };
  }
  return AcademicYear.find(filter).sort({ startDate: -1 }).lean();
};

const getAcademicYearById = async (id) => AcademicYear.findById(id).lean();

const updateAcademicYear = async (id, data) => {
  if (data.isCurrent) {
    await AcademicYear.updateMany({ _id: { $ne: id } }, { isCurrent: false });
  }
  return AcademicYear.findByIdAndUpdate(id, data, { new: true });
};

// Class
const createClass = async (data) => Class.create(data);

const getClasses = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      Class.find(filter)
        .populate("institutionId", "name code")
        .populate("academicYearId", "yearCode title")
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Class.countDocuments(filter),
    ]);
    return { data, total };
  }
  return Class.find(filter)
    .populate("institutionId", "name code")
    .populate("academicYearId", "yearCode title")
    .lean();
};

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

  // Normalize classes list
  let classList = [];
  if (Array.isArray(data.classes)) {
    classList = data.classes;
  } else if (Array.isArray(data.classIds)) {
    classList = data.classIds;
  } else if (data.classId) {
    classList = [data.classId];
  }

  // Validate class existence if classes are provided
  if (classList.length > 0) {
    const validClasses = await Class.find({ _id: { $in: classList } }).select("_id academicYearId");
    if (validClasses.length !== classList.length) {
      const error = new Error("One or more assigned classes do not exist");
      error.statusCode = 400;
      throw error;
    }
    payload.classes = validClasses.map((c) => c._id);
    if (!payload.academicYearId && validClasses[0]?.academicYearId) {
      payload.academicYearId = validClasses[0].academicYearId;
    }
  } else {
    payload.classes = [];
  }

  const created = await Subject.create(payload);
  return Subject.findById(created._id)
    .populate("classes", "name code department academicYearId")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

const getSubjects = async (filter = {}, pagination = null) => {
  const query = { ...filter };
  if (pagination) {
    const [data, total] = await Promise.all([
      Subject.find(query)
        .populate("classes", "name code department academicYearId")
        .populate("academicYearId", "yearName yearCode")
        .sort({ subjectCode: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Subject.countDocuments(query),
    ]);
    return { data, total };
  }
  return Subject.find(query)
    .populate("classes", "name code department academicYearId")
    .populate("academicYearId", "yearName yearCode")
    .sort({ subjectCode: 1 })
    .lean();
};

const getSubjectById = async (id) =>
  Subject.findById(id)
    .populate("classes", "name code department academicYearId")
    .populate("academicYearId", "yearName yearCode")
    .lean();

const updateSubject = async (id, data) => {
  const payload = { ...data };
  if (data.name && !data.subjectName) payload.subjectName = data.name;
  if (data.code && !data.subjectCode) payload.subjectCode = data.code;

  let hasClassUpdate = false;
  let classList = [];
  if (Array.isArray(data.classes)) {
    classList = data.classes;
    hasClassUpdate = true;
  } else if (Array.isArray(data.classIds)) {
    classList = data.classIds;
    hasClassUpdate = true;
  } else if (data.classId !== undefined) {
    classList = data.classId ? [data.classId] : [];
    hasClassUpdate = true;
  }

  if (hasClassUpdate) {
    if (classList.length > 0) {
      const validClasses = await Class.find({ _id: { $in: classList } }).select("_id academicYearId");
      if (validClasses.length !== classList.length) {
        const error = new Error("One or more assigned classes do not exist");
        error.statusCode = 400;
        throw error;
      }
      payload.classes = validClasses.map((c) => c._id);
      if (!payload.academicYearId && validClasses[0]?.academicYearId) {
        payload.academicYearId = validClasses[0].academicYearId;
      }
    } else {
      payload.classes = [];
    }
  }

  return Subject.findByIdAndUpdate(id, payload, { new: true })
    .populate("classes", "name code department academicYearId")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

// Syllabus
const createSyllabus = async (data) => {
  const payload = { ...data };
  if (!payload.title && payload.kitabName) {
    payload.title = payload.kitabName;
  }

  // Referential & compatibility check: Verify subject belongs to class
  const subject = await Subject.findById(payload.subjectId);
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }
  if (Array.isArray(subject.classes) && subject.classes.length > 0) {
    const isAssigned = subject.classes.some((c) => c.toString() === payload.classId.toString());
    if (!isAssigned) {
      const error = new Error("Subject is not assigned to the selected class");
      error.statusCode = 400;
      throw error;
    }
  }

  // Duplicate prevention: One active syllabus per class + subject + academicYear + examType
  const existing = await Syllabus.findOne({
    classId: payload.classId,
    subjectId: payload.subjectId,
    academicYearId: payload.academicYearId,
    examType: payload.examType || "ANNUAL",
    isDeleted: { $ne: true },
  });
  if (existing) {
    const error = new Error("A syllabus for this class, subject, academic year, and exam type already exists");
    error.statusCode = 409;
    throw error;
  }

  const syllabus = await Syllabus.create(payload);
  return Syllabus.findById(syllabus._id)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .populate("institutionId", "name code")
    .lean();
};

const getSyllabuses = async (filter = {}, search = "", pagination = null) => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { kitabName: searchRegex },
      { title: searchRegex },
      { "units.title": searchRegex },
      { version: searchRegex },
    ];
  }

  if (pagination) {
    const [data, total] = await Promise.all([
      Syllabus.find(query)
        .populate("subjectId", "subjectName subjectCode category")
        .populate("classId", "name code")
        .populate("academicYearId", "yearName yearCode")
        .populate("institutionId", "name code")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Syllabus.countDocuments(query),
    ]);
    return { data, total };
  }

  return Syllabus.find(query)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .populate("institutionId", "name code")
    .sort({ createdAt: -1 })
    .lean();
};

const getSyllabusById = async (id) =>
  Syllabus.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .populate("institutionId", "name code")
    .lean();

const updateSyllabus = async (id, data) => {
  const payload = { ...data };
  if (!payload.title && payload.kitabName) {
    payload.title = payload.kitabName;
  }

  // Conflict check if changing unique keys
  if (payload.classId || payload.subjectId || payload.academicYearId || payload.examType) {
    const current = await Syllabus.findById(id);
    if (current) {
      const checkClass = payload.classId || current.classId;
      const checkSubject = payload.subjectId || current.subjectId;
      const checkYear = payload.academicYearId || current.academicYearId;
      const checkExamType = payload.examType || current.examType;

      // Verify subject is assigned to class
      const subjectDoc = await Subject.findById(checkSubject);
      if (subjectDoc && Array.isArray(subjectDoc.classes) && subjectDoc.classes.length > 0) {
        const isAssigned = subjectDoc.classes.some((c) => c.toString() === checkClass.toString());
        if (!isAssigned) {
          const error = new Error("Subject is not assigned to the selected class");
          error.statusCode = 400;
          throw error;
        }
      }

      const conflict = await Syllabus.findOne({
        _id: { $ne: id },
        classId: checkClass,
        subjectId: checkSubject,
        academicYearId: checkYear,
        examType: checkExamType,
        isDeleted: { $ne: true },
      });
      if (conflict) {
        const error = new Error("A syllabus for this class, subject, academic year, and exam type already exists");
        error.statusCode = 409;
        throw error;
      }
    }
  }

  return Syllabus.findByIdAndUpdate(id, payload, { new: true })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .populate("institutionId", "name code")
    .lean();
};

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
