const Exam = require("../models/Exam");
const ExamSchedule = require("../models/ExamSchedule");
const ExamRegistration = require("../models/ExamRegistration");
const MarkEntry = require("../models/MarkEntry");
const ExamResult = require("../models/ExamResult");
const StudentProfile = require("../models/StudentProfile");

// Exam
const createExam = async (data) => Exam.create(data);
const getExams = async (filter = {}) => Exam.find(filter).populate("academicYearId").sort({ startDate: -1 });
const getExamById = async (id) => Exam.findById(id).populate("academicYearId");
const updateExam = async (id, data) => Exam.findByIdAndUpdate(id, data, { new: true });

// ExamSchedule
const createExamSchedule = async (data) => ExamSchedule.create(data);
const getExamSchedules = async (filter = {}) => ExamSchedule.find(filter).populate("examId").populate("classId").populate("subjectId");
const getExamScheduleById = async (id) => ExamSchedule.findById(id).populate("examId").populate("classId").populate("subjectId");
const updateExamSchedule = async (id, data) => ExamSchedule.findByIdAndUpdate(id, data, { new: true });

// ExamRegistration
const registerStudentForExam = async (data) => {
  const existingReg = await ExamRegistration.findOne({ examId: data.examId, studentId: data.studentId });
  if (existingReg) {
    throw new Error("Student is already registered for this examination");
  }

  const existingRoll = await ExamRegistration.findOne({ rollNumber: data.rollNumber });
  if (existingRoll) {
    throw new Error("Roll number is already assigned");
  }

  return ExamRegistration.create(data);
};

const getExamRegistrations = async (filter = {}) => {
  return ExamRegistration.find(filter)
    .populate("examId")
    .populate("studentId")
    .populate("institutionId")
    .populate("paymentId");
};

const updateExamRegistrationStatus = async (id, registrationStatus) => {
  return ExamRegistration.findByIdAndUpdate(id, { registrationStatus }, { new: true });
};

// MarkEntry
const submitOrUpdateMarkEntry = async (data) => {
  const schedule = await ExamSchedule.findById(data.examScheduleId);
  if (!schedule) {
    throw new Error("Exam schedule record not found");
  }

  if (data.marksObtained > schedule.maxMarks) {
    throw new Error(`Marks obtained cannot exceed maximum marks (${schedule.maxMarks})`);
  }

  return MarkEntry.findOneAndUpdate(
    { examScheduleId: data.examScheduleId, studentId: data.studentId },
    { ...data, examId: schedule.examId, subjectId: schedule.subjectId },
    { upsert: true, new: true, runValidators: true }
  );
};

const getMarkEntries = async (filter = {}) => {
  return MarkEntry.find(filter)
    .populate("examId")
    .populate("examScheduleId")
    .populate("studentId")
    .populate("subjectId")
    .populate("evaluatorId");
};

const verifyMarkEntries = async (examScheduleId) => {
  await MarkEntry.updateMany(
    { examScheduleId, status: { $in: ["DRAFT", "SUBMITTED"] } },
    { status: "VERIFIED" }
  );
  return { success: true, message: "Mark entries verified successfully" };
};

// ExamResult Aggregation (Requires Verified Marks!)
const aggregateAndGenerateResults = async (examId, classId) => {
  // Check if any mark entries for this exam & class are unverified
  const unverifiedEntries = await MarkEntry.find({
    examId,
    status: { $ne: "VERIFIED" },
  });

  const schedulesForClass = await ExamSchedule.find({ examId, classId }).select("_id");
  const scheduleIds = schedulesForClass.map((s) => s._id.toString());

  const unverifiedForClass = unverifiedEntries.filter((m) =>
    scheduleIds.includes(m.examScheduleId.toString())
  );

  if (unverifiedForClass.length > 0) {
    throw new Error(
      `Cannot generate results. Found ${unverifiedForClass.length} unverified or draft mark entries for this class.`
    );
  }

  // Get all registered students for this exam & class
  const registrations = await ExamRegistration.find({ examId }).populate("studentId");

  const classStudents = registrations.filter(
    (r) => r.studentId && r.studentId.classId && r.studentId.classId.toString() === classId.toString()
  );

  const generatedResults = [];

  for (const reg of classStudents) {
    const studentId = reg.studentId._id;
    const institutionId = reg.institutionId;

    const studentMarks = await MarkEntry.find({
      examId,
      studentId,
    }).populate("examScheduleId");

    let totalMax = 0;
    let totalObtained = 0;
    let hasFailed = false;

    for (const entry of studentMarks) {
      const schedule = entry.examScheduleId;
      if (schedule) {
        totalMax += schedule.maxMarks;
        totalObtained += entry.isAbsent ? 0 : entry.marksObtained;

        if (entry.isAbsent || entry.marksObtained < schedule.passMarks) {
          hasFailed = true;
        }
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let grade = "F";
    if (!hasFailed) {
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";
      else grade = "D";
    }

    const resultStatus = hasFailed ? "FAILED" : "PASSED";

    const result = await ExamResult.findOneAndUpdate(
      { examId, studentId },
      {
        examId,
        studentId,
        classId,
        institutionId,
        totalMaxMarks: totalMax,
        totalMarksObtained: totalObtained,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        resultStatus,
        publishedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    generatedResults.push(result);
  }

  return generatedResults;
};

const getExamResults = async (filter = {}) => {
  return ExamResult.find(filter)
    .populate("examId")
    .populate("studentId")
    .populate("classId")
    .populate("institutionId");
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  createExamSchedule,
  getExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  registerStudentForExam,
  getExamRegistrations,
  updateExamRegistrationStatus,
  submitOrUpdateMarkEntry,
  getMarkEntries,
  verifyMarkEntries,
  aggregateAndGenerateResults,
  getExamResults,
};
