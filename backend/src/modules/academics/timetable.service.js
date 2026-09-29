const Timetable = require("./timetable.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const AcademicYear = require("./academic-year.model");
const FacultyProfile = require("../faculty/faculty.model");
const StudentProfile = require("../students/student.model");

const DAY_ORDER = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const createTimetableEntry = async (data) => {
  const { classId, academicYearId, dayOfWeek, periodNumber, subjectId, facultyId } = data;

  // 1. Verify Class
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error("Class not found");
  }

  // 2. Verify Academic Year
  const yearObj = await AcademicYear.findById(academicYearId);
  if (!yearObj) {
    throw new Error("Academic Year not found");
  }

  // 3. Verify Subject
  const subjectObj = await Subject.findById(subjectId);
  if (!subjectObj) {
    throw new Error("Subject not found");
  }

  // 4. Verify Faculty
  const facultyObj = await FacultyProfile.findById(facultyId);
  if (!facultyObj) {
    throw new Error("Faculty profile not found");
  }

  // 5. Check for existing schedule clash in same class
  const existingClash = await Timetable.findOne({
    classId,
    academicYearId,
    dayOfWeek: dayOfWeek.toUpperCase(),
    periodNumber,
    isDeleted: { $ne: true },
  });

  if (existingClash) {
    throw new Error(
      `Schedule clash: Period ${periodNumber} on ${dayOfWeek.toUpperCase()} is already assigned in this class`
    );
  }

  const newEntry = await Timetable.create({
    ...data,
    dayOfWeek: dayOfWeek.toUpperCase(),
    institutionId: data.institutionId || classObj.institutionId,
  });

  return Timetable.findById(newEntry._id)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation contactNumber")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

const getTimetableEntries = async (filter = {}, pagination = null) => {
  const query = { isDeleted: { $ne: true } };

  if (filter.classId) query.classId = filter.classId;
  if (filter.academicYearId) query.academicYearId = filter.academicYearId;
  if (filter.dayOfWeek) query.dayOfWeek = filter.dayOfWeek.toUpperCase();
  if (filter.facultyId) query.facultyId = filter.facultyId;
  if (filter.subjectId) query.subjectId = filter.subjectId;
  if (filter.status) query.status = filter.status.toUpperCase();
  if (filter.institutionId) query.institutionId = filter.institutionId;

  const entries = await Timetable.find(query)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

  const sorted = entries.sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayDiff !== 0) return dayDiff;
    return a.periodNumber - b.periodNumber;
  });

  if (pagination) {
    const total = sorted.length;
    const paged = sorted.slice(pagination.skip, pagination.skip + pagination.limit);
    return { data: paged, total };
  }

  return sorted;
};

const getTimetableEntryById = async (id) => {
  return Timetable.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

const updateTimetableEntry = async (id, data) => {
  const current = await Timetable.findById(id);
  if (!current || current.isDeleted) {
    throw new Error("Timetable entry not found");
  }

  const targetClassId = data.classId || current.classId;
  const targetYearId = data.academicYearId || current.academicYearId;
  const targetDay = (data.dayOfWeek || current.dayOfWeek).toUpperCase();
  const targetPeriod = data.periodNumber !== undefined ? data.periodNumber : current.periodNumber;

  // Check clash if time/slot moved
  if (
    targetClassId.toString() !== current.classId.toString() ||
    targetYearId.toString() !== current.academicYearId.toString() ||
    targetDay !== current.dayOfWeek ||
    targetPeriod !== current.periodNumber
  ) {
    const clash = await Timetable.findOne({
      _id: { $ne: id },
      classId: targetClassId,
      academicYearId: targetYearId,
      dayOfWeek: targetDay,
      periodNumber: targetPeriod,
      isDeleted: { $ne: true },
    });
    if (clash) {
      throw new Error(
        `Schedule clash: Period ${targetPeriod} on ${targetDay} is already assigned in this class`
      );
    }
  }

  // Validate subject if changed
  if (data.subjectId) {
    const subj = await Subject.findById(data.subjectId);
    if (!subj) throw new Error("Subject not found");
  }

  // Validate faculty if changed
  if (data.facultyId) {
    const fac = await FacultyProfile.findById(data.facultyId);
    if (!fac) throw new Error("Faculty profile not found");
  }

  const payload = { ...data };
  if (data.dayOfWeek) payload.dayOfWeek = data.dayOfWeek.toUpperCase();

  return Timetable.findByIdAndUpdate(id, payload, { new: true })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();
};

const deleteTimetableEntry = async (id, hardDelete = false) => {
  if (hardDelete) {
    return Timetable.findByIdAndDelete(id);
  }
  return Timetable.findByIdAndUpdate(
    id,
    { status: "INACTIVE", isDeleted: true },
    { new: true }
  );
};

const getStudentTimetable = async (userId) => {
  const profile = await StudentProfile.findOne({ userId })
    .populate({
      path: "classId",
      select: "name code academicYearId",
      populate: {
        path: "academicYearId",
        select: "yearName yearCode",
      },
    })
    .lean();

  if (!profile || !profile.classId) {
    return {
      class: null,
      academicYear: null,
      entries: [],
    };
  }

  const classId = profile.classId._id || profile.classId;
  const entries = await getTimetableEntries({
    classId,
    status: "ACTIVE",
  });

  return {
    class: profile.classId,
    academicYear: profile.classId?.academicYearId || null,
    entries,
  };
};

module.exports = {
  createTimetableEntry,
  getTimetableEntries,
  getTimetableEntryById,
  updateTimetableEntry,
  deleteTimetableEntry,
  getStudentTimetable,
};
