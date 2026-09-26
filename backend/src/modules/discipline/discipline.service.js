const DisciplineRecord = require("./discipline-record.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const ParentProfile = require("../parents/parent.model");

/**
 * Records a new disciplinary incident.
 * Enforces class-assignment check for ASATITHA role.
 * Automatically deducts demerit points from student's disciplineScore.
 */
const recordIncident = async (incidentData, reqUser) => {
  const { studentId, incidentType, severity = "LOW", demeritPoints = 0, description, actionTaken, incidentDate } = incidentData;

  const student = await StudentProfile.findById(studentId);
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }

  if (reqUser.role !== "ADMIN") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    if (!faculty) {
      const err = new Error("Faculty profile not found");
      err.statusCode = 403;
      throw err;
    }

    const isClassTeacher =
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());

    if (!isClassTeacher) {
      const err = new Error("Unauthorized: student does not belong to your assigned classes");
      err.statusCode = 403;
      throw err;
    }
  }

  const record = await DisciplineRecord.create({
    studentId,
    classId: student.classId,
    incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
    incidentType,
    severity,
    demeritPoints: Number(demeritPoints) || 0,
    description,
    actionTaken,
    reportedBy: reqUser.userId,
  });

  // Deduct demerit points from StudentProfile.disciplineScore
  if (record.demeritPoints > 0) {
    const currentScore = student.disciplineScore !== undefined ? student.disciplineScore : 100;
    student.disciplineScore = Math.max(0, currentScore - record.demeritPoints);
    await student.save();
  }

  return record.populate("studentId", "nameEnglish registrationNumber classId house disciplineScore");
};

/**
 * Resolves a disciplinary incident.
 */
const resolveIncident = async (recordId, reqUser, { resolutionRemarks }) => {
  const record = await DisciplineRecord.findById(recordId).populate("studentId");
  if (!record) {
    const err = new Error("Discipline record not found");
    err.statusCode = 404;
    throw err;
  }

  if (reqUser.role !== "ADMIN") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    if (!faculty) {
      const err = new Error("Faculty profile not found");
      err.statusCode = 403;
      throw err;
    }

    const student = record.studentId;
    const isClassTeacher =
      student &&
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());

    if (!isClassTeacher) {
      const err = new Error("Unauthorized: student does not belong to your assigned classes");
      err.statusCode = 403;
      throw err;
    }
  }

  record.resolved = true;
  record.resolvedAt = new Date();
  record.resolvedBy = reqUser.userId;
  if (resolutionRemarks) record.resolutionRemarks = resolutionRemarks;

  await record.save();
  return record;
};

const getMyDisciplineRecords = async (studentId) => {
  return DisciplineRecord.find({ studentId })
    .populate("classId", "name code")
    .populate("reportedBy", "name email")
    .sort({ incidentDate: -1 });
};

const getStudentDisciplineRecords = async (studentId, reqUser) => {
  if (reqUser.role === "STUDENT") {
    if (!reqUser.studentId || reqUser.studentId.toString() !== studentId.toString()) {
      const err = new Error("Access denied: students can only access their own discipline records");
      err.statusCode = 403;
      throw err;
    }
  } else if (reqUser.role === "PARENT") {
    const parent = await ParentProfile.findOne({ userId: reqUser.userId });
    if (!parent || !parent.studentIds.map((id) => id.toString()).includes(studentId.toString())) {
      const err = new Error("Access denied: student is not linked to your parent account");
      err.statusCode = 403;
      throw err;
    }
  }

  return DisciplineRecord.find({ studentId })
    .populate("classId", "name code")
    .populate("reportedBy", "name email")
    .populate("resolvedBy", "name email")
    .sort({ incidentDate: -1 });
};

module.exports = {
  recordIncident,
  resolveIncident,
  getMyDisciplineRecords,
  getStudentDisciplineRecords,
};
