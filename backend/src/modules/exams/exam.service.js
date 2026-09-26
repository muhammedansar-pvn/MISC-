const mongoose = require("mongoose");
const Exam = require("./exam.model");
const ExamSchedule = require("./exam-schedule.model");
const ExamRegistration = require("./exam-registration.model");
const MarkEntry = require("./mark-entry.model");
const ExamResult = require("./exam-result.model");

// Exam
const createExam = async (data) => Exam.create(data);

const getExams = async (filter = {}) =>
  Exam.find(filter)
    .populate("academicYearId", "yearCode title status")
    .sort({ startDate: -1 })
    .lean();

const getExamById = async (id) =>
  Exam.findById(id)
    .populate("academicYearId", "yearCode title status")
    .lean();

const updateExam = async (id, data) => Exam.findByIdAndUpdate(id, data, { new: true });

// ExamSchedule
const createExamSchedule = async (data) => ExamSchedule.create(data);

const getExamSchedules = async (filter = {}) =>
  ExamSchedule.find(filter)
    .populate("examId", "title examCode startDate endDate")
    .populate("classId", "className section")
    .populate("subjectId", "subjectName subjectCode")
    .lean();

const getExamScheduleById = async (id) =>
  ExamSchedule.findById(id)
    .populate("examId", "title examCode startDate endDate")
    .populate("classId", "className section")
    .populate("subjectId", "subjectName subjectCode")
    .lean();

const updateExamSchedule = async (id, data) => ExamSchedule.findByIdAndUpdate(id, data, { new: true });

// ExamRegistration
const registerStudentForExam = async (data) => {
  const existingReg = await ExamRegistration.exists({ examId: data.examId, studentId: data.studentId });
  if (existingReg) {
    throw new Error("Student is already registered for this examination");
  }

  if (data.rollNumber) {
    const existingRoll = await ExamRegistration.exists({ rollNumber: data.rollNumber });
    if (existingRoll) {
      throw new Error("Roll number is already assigned");
    }
  } else {
    data.rollNumber = `ROLL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }

  return ExamRegistration.create(data);
};

const getExamRegistrations = async (filter = {}) => {
  return ExamRegistration.find(filter)
    .populate("examId", "title examCode startDate endDate")
    .populate("studentId", "name registrationNumber classId")
    .populate("institutionId", "name code")
    .populate("paymentId", "transactionId status amount")
    .lean();
};

const updateExamRegistrationStatus = async (id, registrationStatus) => {
  return ExamRegistration.findByIdAndUpdate(id, { registrationStatus }, { new: true });
};

// MarkEntry
const submitOrUpdateMarkEntry = async (data) => {
  const schedule = await ExamSchedule.findById(data.examScheduleId).lean();
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
    .populate("examId", "title examCode")
    .populate("examScheduleId", "maxMarks passMarks examDate")
    .populate("studentId", "name registrationNumber")
    .populate("subjectId", "subjectName subjectCode")
    .populate("evaluatorId", "name")
    .lean();
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
  const schedulesForClass = await ExamSchedule.find({ examId, classId }).select("_id").lean();
  const scheduleIds = schedulesForClass.map((s) => s._id);

  if (scheduleIds.length === 0) {
    throw new Error("No exam schedules found for this exam and class.");
  }

  const unverifiedCount = await MarkEntry.countDocuments({
    examScheduleId: { $in: scheduleIds },
    status: { $ne: "VERIFIED" },
  });

  if (unverifiedCount > 0) {
    throw new Error(
      `Cannot generate results. Found ${unverifiedCount} unverified or draft mark entries for this class.`
    );
  }

  const registrations = await ExamRegistration.find({ examId }).populate("studentId", "classId").lean();

  const classStudents = registrations.filter(
    (r) => r.studentId && r.studentId.classId && r.studentId.classId.toString() === classId.toString()
  );

  if (classStudents.length === 0) {
    return [];
  }

  const studentMap = new Map();
  classStudents.forEach((r) => {
    studentMap.set(r.studentId._id.toString(), r.institutionId);
  });

  const studentObjectIds = Array.from(studentMap.keys()).map((id) => new mongoose.Types.ObjectId(id));
  const examObjectId = new mongoose.Types.ObjectId(examId);

  const aggregatedStats = await MarkEntry.aggregate([
    {
      $match: {
        examId: examObjectId,
        studentId: { $in: studentObjectIds },
      },
    },
    {
      $lookup: {
        from: "examSchedules",
        localField: "examScheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    { $unwind: "$schedule" },
    {
      $group: {
        _id: "$studentId",
        totalMax: { $sum: "$schedule.maxMarks" },
        totalObtained: {
          $sum: { $cond: [{ $eq: ["$isAbsent", true] }, 0, "$marksObtained"] },
        },
        hasFailed: {
          $max: {
            $cond: [
              {
                $or: [
                  { $eq: ["$isAbsent", true] },
                  { $lt: ["$marksObtained", "$schedule.passMarks"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const bulkOps = [];
  const publishedAt = new Date();

  for (const stat of aggregatedStats) {
    const studentIdStr = stat._id.toString();
    const institutionId = studentMap.get(studentIdStr);
    const totalMax = stat.totalMax || 0;
    const totalObtained = stat.totalObtained || 0;
    const hasFailed = stat.hasFailed === 1;

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

    bulkOps.push({
      updateOne: {
        filter: { examId, studentId: stat._id },
        update: {
          $set: {
            examId,
            studentId: stat._id,
            classId,
            institutionId,
            totalMaxMarks: totalMax,
            totalMarksObtained: totalObtained,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            resultStatus,
            publishedAt,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length > 0) {
    await ExamResult.bulkWrite(bulkOps);
  }

  return ExamResult.find({ examId, classId })
    .populate("examId", "title examCode")
    .populate("studentId", "name registrationNumber")
    .populate("classId", "className section")
    .populate("institutionId", "name code")
    .lean();
};

const getExamResults = async (filter = {}) => {
  return ExamResult.find(filter)
    .populate("examId", "title examCode")
    .populate("studentId", "name registrationNumber")
    .populate("classId", "className section")
    .populate("institutionId", "name code")
    .lean();
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
