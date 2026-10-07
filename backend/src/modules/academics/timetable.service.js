const Timetable = require("./timetable.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const AcademicYear = require("./academic-year.model");
const StudentProfile = require("../students/student.model");
const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");

const DAY_ORDER = {
  SATURDAY: 1,
  SUNDAY: 2,
  MONDAY: 3,
  TUESDAY: 4,
  WEDNESDAY: 5,
  THURSDAY: 6,
  FRIDAY: 7,
};

const createTimetableEntry = async (data) => {
  const { classId, academicYearId, dayOfWeek, periodNumber, subjectId, facultyId } = data;

  // 1. Verify Class
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error("Class not found");
  }

  // 1b. Verify Class Working Days
  const allowedDays = Array.isArray(classObj.workingDays) && classObj.workingDays.length > 0
    ? classObj.workingDays.map((d) => d.toUpperCase())
    : ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

  const targetDay = (dayOfWeek || "").toUpperCase();
  if (!allowedDays.includes(targetDay)) {
    const dayDisplay = targetDay.charAt(0).toUpperCase() + targetDay.slice(1).toLowerCase();
    const error = new Error(`Timetable cannot be assigned on ${dayDisplay} because this class has no scheduled classes on ${dayDisplay}.`);
    error.statusCode = 400;
    throw error;
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

  // 3b. Verify Subject is assigned to this Class
  if (Array.isArray(subjectObj.classes) && subjectObj.classes.length > 0) {
    const isAssigned = subjectObj.classes.some((c) => c.toString() === classId.toString());
    if (!isAssigned) {
      const error = new Error(
        `Subject "${subjectObj.subjectName || subjectObj.name}" is not assigned to class "${classObj.name}"`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 4. Verify Faculty
  await assertFacultyAvailableForAssignment(facultyId);

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

  // 5b. Check for faculty double-booking conflict across classes
  const facultyClash = await Timetable.findOne({
    facultyId,
    academicYearId,
    dayOfWeek: dayOfWeek.toUpperCase(),
    periodNumber,
    isDeleted: { $ne: true },
  });

  if (facultyClash) {
    throw new Error(
      `Faculty conflict: This faculty member is already scheduled to teach in another class during Period ${periodNumber} on ${dayOfWeek.toUpperCase()}`
    );
  }

  const newEntry = await Timetable.create({
    ...data,
    dayOfWeek: dayOfWeek.toUpperCase(),
    institutionId: data.institutionId || classObj.institutionId,
  });

  const populated = await Timetable.findById(newEntry._id)
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation contactNumber")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

  // Asynchronous & Fail-safe Notification Trigger AFTER successful database creation
  try {
    const { notifyTimetableAssigned } = require("../notifications/notification.service");
    await notifyTimetableAssigned(populated);
  } catch (notifErr) {
    console.error("Non-fatal error in notifyTimetableAssigned:", notifErr.message);
  }

  return populated;
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

  // Verify Class & Working Days
  const classObj = await Class.findById(targetClassId);
  if (!classObj) {
    throw new Error("Class not found");
  }

  const allowedDays = Array.isArray(classObj.workingDays) && classObj.workingDays.length > 0
    ? classObj.workingDays.map((d) => d.toUpperCase())
    : ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

  if (!allowedDays.includes(targetDay)) {
    const dayDisplay = targetDay.charAt(0).toUpperCase() + targetDay.slice(1).toLowerCase();
    const error = new Error(`Timetable cannot be assigned on ${dayDisplay} because this class has no scheduled classes on ${dayDisplay}.`);
    error.statusCode = 400;
    throw error;
  }

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

  // Check faculty conflict if faculty, slot, or day changed
  const targetFacultyId = data.facultyId || current.facultyId;
  const facultyConflict = await Timetable.findOne({
    _id: { $ne: id },
    facultyId: targetFacultyId,
    academicYearId: targetYearId,
    dayOfWeek: targetDay,
    periodNumber: targetPeriod,
    isDeleted: { $ne: true },
  });
  if (facultyConflict) {
    throw new Error(
      `Faculty conflict: This faculty member is already scheduled to teach in another class during Period ${targetPeriod} on ${targetDay}`
    );
  }

  // Validate subject and class-subject compatibility
  const targetSubjectId = data.subjectId || current.subjectId;
  const subj = await Subject.findById(targetSubjectId);
  if (!subj) throw new Error("Subject not found");

  if (Array.isArray(subj.classes) && subj.classes.length > 0) {
    const isAssigned = subj.classes.some((c) => c.toString() === targetClassId.toString());
    if (!isAssigned) {
      const error = new Error(
        `Subject "${subj.subjectName || subj.name}" is not assigned to class "${classObj.name}"`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate faculty if changed
  if (data.facultyId) {
    await assertFacultyAvailableForAssignment(data.facultyId);
  }

  const payload = { ...data };
  if (data.dayOfWeek) payload.dayOfWeek = data.dayOfWeek.toUpperCase();

  const updated = await Timetable.findByIdAndUpdate(id, payload, { new: true })
    .populate("subjectId", "subjectName subjectCode category")
    .populate("facultyId", "nameEnglish nameArabic designation")
    .populate("classId", "name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

  // Asynchronous & Fail-safe Notification Trigger AFTER successful database update
  try {
    const { notifyTimetableAssigned, notifyTimetableUpdated } = require("../notifications/notification.service");
    const oldFacultyId = current.facultyId?.toString();
    const newFacultyId = (updated.facultyId?._id || updated.facultyId)?.toString();

    if (newFacultyId && oldFacultyId !== newFacultyId) {
      // Reassigned to a different faculty member: notify newly assigned faculty
      await notifyTimetableAssigned(updated);
    } else if (newFacultyId) {
      // Same faculty: notify if schedule or teaching details were updated
      await notifyTimetableUpdated(updated, { previousEntry: current });
    }
  } catch (notifErr) {
    console.error("Non-fatal error in notifyTimetableUpdated:", notifErr.message);
  }

  return updated;
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
