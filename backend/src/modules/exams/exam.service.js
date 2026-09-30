const mongoose = require("mongoose");
const Exam = require("./exam.model");
const ExamSchedule = require("./exam-schedule.model");
const ExamRegistration = require("./exam-registration.model");
const MarkEntry = require("./mark-entry.model");
const ExamResult = require("./exam-result.model");
const MarkCorrectionRequest = require("./mark-correction-request.model");
const StudentProfile = require("../students/student.model");
const academicAuthService = require("../academics/academic-auth.service");

// Grading scale helper preserving existing project rules
const calculateGrade = (percentage, hasFailed = false) => {
  if (hasFailed) return "F";
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "D";
};

// ==========================================
// 1. EXAMS
// ==========================================
const createExam = async (data) => Exam.create(data);

const getExams = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      Exam.find(filter)
        .populate("academicYearId", "yearCode title yearName status")
        .sort({ startDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);
    return { data, total };
  }
  return Exam.find(filter)
    .populate("academicYearId", "yearCode title yearName status")
    .sort({ startDate: -1 })
    .lean();
};

const getExamById = async (id) =>
  Exam.findById(id)
    .populate("academicYearId", "yearCode title yearName status")
    .lean();

const updateExam = async (id, data) => Exam.findByIdAndUpdate(id, data, { new: true });

// ==========================================
// 2. EXAM SCHEDULES
// ==========================================
const createExamSchedule = async (data) => {
  if (!data.academicYearId && data.examId) {
    const exam = await Exam.findById(data.examId).select("academicYearId").lean();
    if (exam && exam.academicYearId) {
      data.academicYearId = exam.academicYearId;
    }
  }

  const existing = await ExamSchedule.findOne({
    examId: data.examId,
    classId: data.classId,
    subjectId: data.subjectId,
  });
  if (existing) {
    const error = new Error("An exam schedule already exists for this exam, class, and subject");
    error.statusCode = 409;
    throw error;
  }

  return ExamSchedule.create(data);
};

const getExamSchedules = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      ExamSchedule.find(filter)
        .populate("examId", "title code examCode startDate endDate")
        .populate("classId", "name className code section")
        .populate("subjectId", "subjectName subjectCode name code")
        .populate("academicYearId", "yearName yearCode")
        .sort({ examDate: 1, startTime: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExamSchedule.countDocuments(filter),
    ]);
    return { data, total };
  }
  return ExamSchedule.find(filter)
    .populate("examId", "title code examCode startDate endDate")
    .populate("classId", "name className code section")
    .populate("subjectId", "subjectName subjectCode name code")
    .populate("academicYearId", "yearName yearCode")
    .sort({ examDate: 1, startTime: 1 })
    .lean();
};

const getExamScheduleById = async (id) =>
  ExamSchedule.findById(id)
    .populate("examId", "title code examCode startDate endDate")
    .populate("classId", "name className code section")
    .populate("subjectId", "subjectName subjectCode name code")
    .populate("academicYearId", "yearName yearCode")
    .lean();

const updateExamSchedule = async (id, data) => ExamSchedule.findByIdAndUpdate(id, data, { new: true });

// Scoped schedules for faculty assignments
const getFacultyExamSchedules = async (facultyUserId, filter = {}) => {
  const facultyProfileId = await academicAuthService.resolveFacultyProfileId(facultyUserId);
  if (!facultyProfileId) return [];

  const FacultyAssignment = require("../academics/faculty-assignment.model");
  const assignments = await FacultyAssignment.find({
    facultyId: facultyProfileId,
    status: "ACTIVE",
  }).select("classId subjectId academicYearId").lean();

  if (assignments.length === 0) return [];

  const classIds = assignments.map((a) => a.classId);
  const subjectIds = assignments.map((a) => a.subjectId);

  const query = {
    classId: { $in: classIds },
    subjectId: { $in: subjectIds },
  };

  if (filter.examId) query.examId = filter.examId;
  if (filter.classId) query.classId = filter.classId;
  if (filter.academicYearId) query.academicYearId = filter.academicYearId;

  return ExamSchedule.find(query)
    .populate("examId", "title code examCode startDate endDate status")
    .populate("classId", "name className code section")
    .populate("subjectId", "subjectName subjectCode name code category")
    .populate("academicYearId", "yearName yearCode")
    .sort({ examDate: 1, startTime: 1 })
    .lean();
};

// ==========================================
// 3. CANDIDATE ROSTER FOR EXAM SCHEDULE
// ==========================================
const getExamScheduleRoster = async (examScheduleId, requestingUser = null) => {
  const schedule = await ExamSchedule.findById(examScheduleId)
    .populate("examId", "title code examCode startDate endDate status")
    .populate("classId", "name className code")
    .populate("subjectId", "subjectName subjectCode name code category")
    .populate("academicYearId", "yearName yearCode isCurrent")
    .lean();

  if (!schedule) {
    const error = new Error("Exam schedule record not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization check for faculty
  if (requestingUser && requestingUser.role === "FACULTY") {
    const facultyProfileId = await academicAuthService.resolveFacultyProfileId(
      requestingUser.facultyId || requestingUser.userId || requestingUser._id
    );
    const isAssigned = await academicAuthService.isFacultyAssigned({
      facultyId: facultyProfileId,
      classId: schedule.classId._id || schedule.classId,
      subjectId: schedule.subjectId._id || schedule.subjectId,
      academicYearId: schedule.academicYearId?._id || schedule.academicYearId,
    });
    if (!isAssigned) {
      const error = new Error("Forbidden: You are not assigned to evaluate this class and subject");
      error.statusCode = 403;
      throw error;
    }
  }

  const classId = schedule.classId._id || schedule.classId;

  // Retrieve enrolled students of the class cohort
  const students = await StudentProfile.find({
    classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .select("_id nameEnglish name registrationNumber admissionNumber")
    .sort({ registrationNumber: 1, nameEnglish: 1 })
    .lean();

  // Retrieve existing mark entries
  const existingMarks = await MarkEntry.find({
    examScheduleId: schedule._id,
  }).lean();

  const markMap = new Map(existingMarks.map((m) => [m.studentId.toString(), m]));

  const roster = students.map((s) => {
    const entry = markMap.get(s._id.toString());
    return {
      studentId: s._id,
      studentName: s.nameEnglish || s.name || "Student Candidate",
      registrationNumber: s.registrationNumber || "N/A",
      admissionNumber: s.admissionNumber || "N/A",
      markEntryId: entry?._id || null,
      marksObtained: entry != null && entry.marksObtained != null ? entry.marksObtained : null,
      isAbsent: entry ? Boolean(entry.isAbsent) : false,
      status: entry ? entry.status : "NOT_ENTERED",
      remarks: entry ? entry.remarks : "",
    };
  });

  return {
    schedule: {
      _id: schedule._id,
      examId: schedule.examId,
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      academicYearId: schedule.academicYearId,
      examDate: schedule.examDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxMarks: schedule.maxMarks,
      passMarks: schedule.passMarks,
      status: schedule.status,
    },
    roster,
  };
};

// ==========================================
// 4. EXAM REGISTRATIONS
// ==========================================
const registerStudentForExam = async (data) => {
  const existingReg = await ExamRegistration.exists({ examId: data.examId, studentId: data.studentId });
  if (existingReg) {
    const error = new Error("Student is already registered for this examination");
    error.statusCode = 409;
    throw error;
  }

  if (data.rollNumber) {
    const existingRoll = await ExamRegistration.exists({ rollNumber: data.rollNumber });
    if (existingRoll) {
      const error = new Error("Roll number is already assigned");
      error.statusCode = 409;
      throw error;
    }
  } else {
    data.rollNumber = `ROLL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }

  if (!data.registrationStatus) {
    data.registrationStatus = "REGISTERED";
  }

  return ExamRegistration.create(data);
};

const getExamRegistrations = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      ExamRegistration.find(filter)
        .populate("examId", "title code examCode startDate endDate")
        .populate("studentId", "nameEnglish name registrationNumber classId")
        .populate("institutionId", "name code")
        .populate("paymentId", "transactionId status amount")
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExamRegistration.countDocuments(filter),
    ]);
    return { data, total };
  }
  return ExamRegistration.find(filter)
    .populate("examId", "title code examCode startDate endDate")
    .populate("studentId", "nameEnglish name registrationNumber classId")
    .populate("institutionId", "name code")
    .populate("paymentId", "transactionId status amount")
    .lean();
};

const updateExamRegistrationStatus = async (id, registrationStatus) => {
  return ExamRegistration.findByIdAndUpdate(id, { registrationStatus }, { new: true });
};

// ==========================================
// 5. MARK ENTRIES (SECURE & AUTHORIZED)
// ==========================================
const submitOrUpdateMarkEntry = async (data, requestingUser = null) => {
  const schedule = await ExamSchedule.findById(data.examScheduleId).lean();
  if (!schedule) {
    const error = new Error("Exam schedule record not found");
    error.statusCode = 404;
    throw error;
  }

  // Cross-verify submitted metadata against schedule
  if (data.examId && data.examId.toString() !== schedule.examId.toString()) {
    const error = new Error("Submitted examId does not match exam schedule");
    error.statusCode = 400;
    throw error;
  }
  if (data.classId && data.classId.toString() !== schedule.classId.toString()) {
    const error = new Error("Submitted classId does not match exam schedule");
    error.statusCode = 400;
    throw error;
  }
  if (data.subjectId && data.subjectId.toString() !== schedule.subjectId.toString()) {
    const error = new Error("Submitted subjectId does not match exam schedule");
    error.statusCode = 400;
    throw error;
  }
  if (data.academicYearId && data.academicYearId.toString() !== schedule.academicYearId?.toString()) {
    const error = new Error("Submitted academicYearId does not match exam schedule");
    error.statusCode = 400;
    throw error;
  }

  // Evaluator Authorization & Impersonation Prevention
  let resolvedEvaluatorId = null;
  if (requestingUser) {
    if (requestingUser.role === "FACULTY") {
      const facultyProfileId = await academicAuthService.resolveFacultyProfileId(
        requestingUser.facultyId || requestingUser.userId || requestingUser._id
      );
      if (!facultyProfileId) {
        const error = new Error("No faculty profile associated with user account");
        error.statusCode = 403;
        throw error;
      }

      // Block client-side evaluator impersonation
      if (data.evaluatorId && data.evaluatorId.toString() !== facultyProfileId.toString()) {
        const error = new Error("Forbidden: Cannot submit marks on behalf of another evaluator");
        error.statusCode = 403;
        throw error;
      }

      const isAssigned = await academicAuthService.isFacultyAssigned({
        facultyId: facultyProfileId,
        classId: schedule.classId,
        subjectId: schedule.subjectId,
        academicYearId: schedule.academicYearId,
      });

      if (!isAssigned) {
        const error = new Error("Forbidden: You are not assigned to evaluate this class and subject");
        error.statusCode = 403;
        throw error;
      }

      resolvedEvaluatorId = facultyProfileId;
    } else if (["ADMIN", "PRINCIPAL", "HOD", "INSTITUTION"].includes(requestingUser.role)) {
      resolvedEvaluatorId = data.evaluatorId || null;
    } else {
      const error = new Error("Forbidden: Insufficient privileges to submit marks");
      error.statusCode = 403;
      throw error;
    }
  }

  // Validate student belongs to class
  const student = await StudentProfile.findById(data.studentId).lean();
  if (!student) {
    const error = new Error("Student candidate not found");
    error.statusCode = 404;
    throw error;
  }

  if (student.classId.toString() !== schedule.classId.toString()) {
    const error = new Error("Student does not belong to the scheduled class cohort");
    error.statusCode = 400;
    throw error;
  }

  // Validate marks
  const isAbsent = Boolean(data.isAbsent);
  const marksObtained = isAbsent ? 0 : Number(data.marksObtained);

  if (!isAbsent) {
    if (typeof data.marksObtained !== "number" || isNaN(marksObtained)) {
      const error = new Error("Marks obtained must be a valid number");
      error.statusCode = 400;
      throw error;
    }
    if (marksObtained < 0) {
      const error = new Error("Marks obtained cannot be negative");
      error.statusCode = 400;
      throw error;
    }
    if (marksObtained > schedule.maxMarks) {
      const error = new Error(`Marks obtained cannot exceed maximum marks (${schedule.maxMarks})`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Check state immutability on existing mark
  const existing = await MarkEntry.findOne({
    examScheduleId: schedule._id,
    studentId: data.studentId,
  });

  if (existing) {
    if (existing.status === "VERIFIED" || existing.status === "PUBLISHED") {
      if (!requestingUser || requestingUser.role === "FACULTY") {
        const error = new Error(
          `Marks have already been ${existing.status.toLowerCase()} and cannot be directly modified. Please submit a Mark Correction Request.`
        );
        error.statusCode = 403;
        throw error;
      }
    }
  }

  const markStatus = data.status && ["DRAFT", "SUBMITTED"].includes(data.status)
    ? data.status
    : "DRAFT";

  const updated = await MarkEntry.findOneAndUpdate(
    { examScheduleId: schedule._id, studentId: data.studentId },
    {
      $set: {
        examId: schedule.examId,
        examScheduleId: schedule._id,
        studentId: data.studentId,
        classId: schedule.classId,
        subjectId: schedule.subjectId,
        academicYearId: schedule.academicYearId,
        marksObtained,
        isAbsent,
        evaluatorId: resolvedEvaluatorId,
        status: markStatus,
        remarks: data.remarks || "",
        submittedBy: requestingUser ? requestingUser.userId || requestingUser._id : undefined,
        submittedAt: new Date(),
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  return updated;
};

// Bulk Roster Marks Submission
const submitRosterMarks = async ({ examScheduleId, status = "SUBMITTED", marks = [] }, requestingUser = null) => {
  const schedule = await ExamSchedule.findById(examScheduleId).lean();
  if (!schedule) {
    const error = new Error("Exam schedule record not found");
    error.statusCode = 404;
    throw error;
  }

  let resolvedEvaluatorId = null;
  if (requestingUser) {
    if (requestingUser.role === "FACULTY") {
      const facultyProfileId = await academicAuthService.resolveFacultyProfileId(
        requestingUser.facultyId || requestingUser.userId || requestingUser._id
      );
      if (!facultyProfileId) {
        const error = new Error("No faculty profile associated with user account");
        error.statusCode = 403;
        throw error;
      }

      const isAssigned = await academicAuthService.isFacultyAssigned({
        facultyId: facultyProfileId,
        classId: schedule.classId,
        subjectId: schedule.subjectId,
        academicYearId: schedule.academicYearId,
      });

      if (!isAssigned) {
        const error = new Error("Forbidden: You are not assigned to evaluate this class and subject");
        error.statusCode = 403;
        throw error;
      }

      resolvedEvaluatorId = facultyProfileId;
    } else if (["ADMIN", "PRINCIPAL", "HOD", "INSTITUTION"].includes(requestingUser.role)) {
      resolvedEvaluatorId = null;
    } else {
      const error = new Error("Forbidden: Insufficient privileges to submit marks");
      error.statusCode = 403;
      throw error;
    }
  }

  if (!Array.isArray(marks) || marks.length === 0) {
    const error = new Error("Marks array must not be empty");
    error.statusCode = 400;
    throw error;
  }

  const markStudentIds = marks.map((m) => m.studentId);
  const enrolledStudents = await StudentProfile.find({
    _id: { $in: markStudentIds },
    classId: schedule.classId,
    isDeleted: { $ne: true },
  }).select("_id");

  if (enrolledStudents.length !== marks.length) {
    const validSet = new Set(enrolledStudents.map((s) => s._id.toString()));
    const invalidIds = markStudentIds.filter((id) => !validSet.has(id.toString()));
    const error = new Error(
      `One or more students do not belong to the scheduled class cohort: ${invalidIds.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Check if any mark is already VERIFIED or PUBLISHED
  const existingLocked = await MarkEntry.find({
    examScheduleId: schedule._id,
    studentId: { $in: markStudentIds },
    status: { $in: ["VERIFIED", "PUBLISHED"] },
  }).select("studentId status");

  if (existingLocked.length > 0 && requestingUser && requestingUser.role === "FACULTY") {
    const error = new Error(
      `Cannot modify marks: ${existingLocked.length} candidate(s) already have verified or published marks. Submit a Mark Correction Request.`
    );
    error.statusCode = 403;
    throw error;
  }

  const validStatus = ["DRAFT", "SUBMITTED"].includes(status) ? status : "DRAFT";

  const bulkOps = marks.map((m) => {
    const isAbsent = Boolean(m.isAbsent);
    const marksObtained = isAbsent ? 0 : Number(m.marksObtained);

    if (!isAbsent) {
      if (typeof m.marksObtained !== "number" || isNaN(marksObtained)) {
        const error = new Error(`Invalid mark value for student ${m.studentId}`);
        error.statusCode = 400;
        throw error;
      }
      if (marksObtained < 0) {
        const error = new Error(`Marks cannot be negative for student ${m.studentId}`);
        error.statusCode = 400;
        throw error;
      }
      if (marksObtained > schedule.maxMarks) {
        const error = new Error(`Marks cannot exceed ${schedule.maxMarks} for student ${m.studentId}`);
        error.statusCode = 400;
        throw error;
      }
    }

    return {
      updateOne: {
        filter: {
          examScheduleId: schedule._id,
          studentId: new mongoose.Types.ObjectId(m.studentId),
        },
        update: {
          $set: {
            examId: schedule.examId,
            examScheduleId: schedule._id,
            studentId: new mongoose.Types.ObjectId(m.studentId),
            classId: schedule.classId,
            subjectId: schedule.subjectId,
            academicYearId: schedule.academicYearId,
            marksObtained,
            isAbsent,
            evaluatorId: resolvedEvaluatorId,
            status: validStatus,
            remarks: m.remarks || "",
            submittedBy: requestingUser ? requestingUser.userId || requestingUser._id : undefined,
            submittedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  await MarkEntry.bulkWrite(bulkOps);

  return {
    success: true,
    examScheduleId: schedule._id,
    totalProcessed: marks.length,
    status: validStatus,
  };
};

const getMarkEntries = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      MarkEntry.find(filter)
        .populate("examId", "title code examCode")
        .populate("examScheduleId", "maxMarks passMarks examDate")
        .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
        .populate("subjectId", "subjectName subjectCode name code")
        .populate("evaluatorId", "nameEnglish name")
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      MarkEntry.countDocuments(filter),
    ]);
    return { data, total };
  }
  return MarkEntry.find(filter)
    .populate("examId", "title code examCode")
    .populate("examScheduleId", "maxMarks passMarks examDate")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("subjectId", "subjectName subjectCode name code")
    .populate("evaluatorId", "nameEnglish name")
    .lean();
};

const verifyMarkEntries = async (examScheduleId, reviewingUser = null) => {
  if (reviewingUser && !["ADMIN", "PRINCIPAL", "HOD"].includes(reviewingUser.role)) {
    const error = new Error("Forbidden: Only administrators can verify marks");
    error.statusCode = 403;
    throw error;
  }

  const schedule = await ExamSchedule.findById(examScheduleId).lean();
  if (!schedule) {
    const error = new Error("Exam schedule record not found");
    error.statusCode = 404;
    throw error;
  }

  const result = await MarkEntry.updateMany(
    { examScheduleId, status: { $in: ["DRAFT", "SUBMITTED"] } },
    {
      $set: {
        status: "VERIFIED",
        verifiedBy: reviewingUser ? reviewingUser.userId || reviewingUser._id : undefined,
        verifiedAt: new Date(),
      },
    }
  );

  return {
    success: true,
    message: `Mark entries verified successfully (${result.modifiedCount} records updated)`,
  };
};

// ==========================================
// 6. MARK CORRECTION REQUESTS
// ==========================================
const createMarkCorrectionRequest = async (data, requestingUser) => {
  const markEntry = await MarkEntry.findById(data.markEntryId).lean();
  if (!markEntry) {
    const error = new Error("Mark entry not found");
    error.statusCode = 404;
    throw error;
  }

  if (requestingUser.role === "FACULTY") {
    const facultyProfileId = await academicAuthService.resolveFacultyProfileId(
      requestingUser.facultyId || requestingUser.userId || requestingUser._id
    );
    const isAssigned = await academicAuthService.isFacultyAssigned({
      facultyId: facultyProfileId,
      classId: markEntry.classId,
      subjectId: markEntry.subjectId,
    });
    if (!isAssigned) {
      const error = new Error("Forbidden: You are not assigned to this class and subject");
      error.statusCode = 403;
      throw error;
    }
  }

  const schedule = await ExamSchedule.findById(markEntry.examScheduleId).lean();
  if (data.newMarks < 0 || (schedule && data.newMarks > schedule.maxMarks)) {
    const error = new Error(`New marks must be between 0 and ${schedule ? schedule.maxMarks : 100}`);
    error.statusCode = 400;
    throw error;
  }

  const request = await MarkCorrectionRequest.create({
    markEntryId: markEntry._id,
    examScheduleId: markEntry.examScheduleId,
    examId: markEntry.examId,
    studentId: markEntry.studentId,
    subjectId: markEntry.subjectId,
    classId: markEntry.classId,
    academicYearId: markEntry.academicYearId,
    oldMarks: markEntry.marksObtained,
    newMarks: data.newMarks,
    reason: data.reason,
    requestedBy: requestingUser.userId || requestingUser._id,
    status: "PENDING",
  });

  return request;
};

const reviewMarkCorrectionRequest = async (requestId, status, reviewingUser, adminRemarks = "") => {
  if (!reviewingUser || !["ADMIN", "PRINCIPAL", "HOD"].includes(reviewingUser.role)) {
    const error = new Error("Forbidden: Only administrators can review correction requests");
    error.statusCode = 403;
    throw error;
  }

  const request = await MarkCorrectionRequest.findById(requestId);
  if (!request) {
    const error = new Error("Correction request not found");
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error(`Correction request has already been ${request.status.toLowerCase()}`);
    error.statusCode = 400;
    throw error;
  }

  request.status = status;
  request.reviewedBy = reviewingUser.userId || reviewingUser._id;
  request.reviewedAt = new Date();
  request.adminRemarks = adminRemarks;
  await request.save();

  if (status === "APPROVED") {
    await MarkEntry.findByIdAndUpdate(request.markEntryId, {
      $set: {
        marksObtained: request.newMarks,
        remarks: `Corrected via Request ${request._id}: ${adminRemarks || request.reason}`,
      },
    });

    // Check if result exists and re-aggregate if needed
    const existingResult = await ExamResult.findOne({
      examId: request.examId,
      studentId: request.studentId,
    });
    if (existingResult) {
      await aggregateAndGenerateResults(request.examId, request.classId, reviewingUser);
    }
  }

  return request;
};

const getMarkCorrectionRequests = async (filter = {}) => {
  return MarkCorrectionRequest.find(filter)
    .populate("studentId", "nameEnglish registrationNumber")
    .populate("subjectId", "subjectName subjectCode name code")
    .populate("requestedBy", "name email")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

// ==========================================
// 7. EXAM RESULT AGGREGATION & GENERATION
// ==========================================
const aggregateAndGenerateResults = async (examId, classId, publishingUser = null) => {
  if (publishingUser && !["ADMIN", "PRINCIPAL", "HOD"].includes(publishingUser.role)) {
    const error = new Error("Forbidden: Only administrators can publish exam results");
    error.statusCode = 403;
    throw error;
  }

  const schedules = await ExamSchedule.find({ examId, classId })
    .populate("subjectId", "subjectName subjectCode name code")
    .lean();

  if (schedules.length === 0) {
    const error = new Error("No exam schedules found for this exam and class.");
    error.statusCode = 400;
    throw error;
  }

  const scheduleIds = schedules.map((s) => s._id);

  // Require that all marks are VERIFIED or PUBLISHED (no DRAFT or SUBMITTED entries)
  const unverifiedCount = await MarkEntry.countDocuments({
    examScheduleId: { $in: scheduleIds },
    status: { $in: ["DRAFT", "SUBMITTED"] },
  });

  if (unverifiedCount > 0) {
    const error = new Error(
      `Cannot generate results. Found ${unverifiedCount} unverified or draft mark entries for this class.`
    );
    error.statusCode = 400;
    throw error;
  }

  const classStudents = await StudentProfile.find({
    classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  }).lean();

  if (classStudents.length === 0) {
    return [];
  }

  const exam = await Exam.findById(examId).select("academicYearId").lean();
  const academicYearId = exam?.academicYearId || schedules[0].academicYearId;

  // Retrieve all marks for this class & exam
  const allMarks = await MarkEntry.find({
    examId,
    classId,
    examScheduleId: { $in: scheduleIds },
  })
    .populate("subjectId", "subjectName subjectCode name code")
    .lean();

  const marksByStudent = new Map();
  for (const m of allMarks) {
    const sId = m.studentId.toString();
    if (!marksByStudent.has(sId)) {
      marksByStudent.set(sId, []);
    }
    marksByStudent.get(sId).push(m);
  }

  const bulkOps = [];
  const publishedAt = new Date();

  for (const student of classStudents) {
    const sId = student._id.toString();
    const studentMarks = marksByStudent.get(sId) || [];

    const subjectResults = [];
    let totalMaxMarks = 0;
    let totalMarksObtained = 0;
    let hasFailedAnySubject = false;

    for (const schedule of schedules) {
      const markEntry = studentMarks.find(
        (m) => m.examScheduleId.toString() === schedule._id.toString()
      );

      const isAbsent = markEntry ? Boolean(markEntry.isAbsent) : true;
      const obtained = markEntry && !isAbsent ? markEntry.marksObtained : 0;
      const maxM = schedule.maxMarks;
      const passM = schedule.passMarks;

      const subPercentage = maxM > 0 ? (obtained / maxM) * 100 : 0;
      const subFailed = isAbsent || obtained < passM;
      if (subFailed) hasFailedAnySubject = true;

      const subGrade = calculateGrade(subPercentage, subFailed);
      const subName = schedule.subjectId?.subjectName || schedule.subjectId?.name || "Subject";
      const subCode = schedule.subjectId?.subjectCode || schedule.subjectId?.code || "";

      subjectResults.push({
        subjectId: schedule.subjectId._id || schedule.subjectId,
        subjectName: subName,
        subjectCode: subCode,
        marksObtained: obtained,
        maxMarks: maxM,
        passMarks: passM,
        grade: subGrade,
        isAbsent,
        resultStatus: subFailed ? "FAILED" : "PASSED",
      });

      totalMaxMarks += maxM;
      totalMarksObtained += obtained;
    }

    const overallPercentage =
      totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 10000) / 100 : 0;

    const overallGrade = calculateGrade(overallPercentage, hasFailedAnySubject);
    const resultStatus = hasFailedAnySubject ? "FAILED" : "PASSED";

    bulkOps.push({
      updateOne: {
        filter: { examId, studentId: student._id },
        update: {
          $set: {
            examId,
            studentId: student._id,
            classId,
            academicYearId,
            subjectResults,
            totalMaxMarks,
            totalMarksObtained,
            percentage: overallPercentage,
            grade: overallGrade,
            resultStatus,
            status: "PUBLISHED",
            publishedBy: publishingUser ? publishingUser.userId || publishingUser._id : undefined,
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

  // Also update MarkEntry status to PUBLISHED
  await MarkEntry.updateMany(
    { examScheduleId: { $in: scheduleIds } },
    { $set: { status: "PUBLISHED", publishedAt, publishedBy: publishingUser ? publishingUser.userId || publishingUser._id : undefined } }
  );

  return ExamResult.find({ examId, classId })
    .populate("examId", "title code")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("classId", "name className code")
    .lean();
};

const getExamResults = async (filter = {}, pagination = null, requestingUser = null) => {
  const query = { ...filter };

  if (requestingUser) {
    if (requestingUser.role === "STUDENT") {
      if (!requestingUser.studentId) {
        const error = new Error("No student profile associated with this account");
        error.statusCode = 403;
        throw error;
      }
      query.studentId = requestingUser.studentId;
      query.status = "PUBLISHED";
    } else if (requestingUser.role === "FACULTY") {
      const authorizedClasses = await academicAuthService.getFacultyAuthorizedClasses(
        requestingUser.userId || requestingUser._id
      );
      const authClassIds = authorizedClasses.map((c) => c._id.toString());
      if (query.classId) {
        if (!authClassIds.includes(query.classId.toString())) {
          const error = new Error("Forbidden: You are not assigned to this class");
          error.statusCode = 403;
          throw error;
        }
      } else {
        query.classId = { $in: authClassIds };
      }
    }
  }

  if (pagination) {
    const [data, total] = await Promise.all([
      ExamResult.find(query)
        .populate("examId", "title code examCode")
        .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
        .populate("classId", "name className code")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExamResult.countDocuments(query),
    ]);
    return { data, total };
  }

  return ExamResult.find(query)
    .populate("examId", "title code examCode")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("classId", "name className code")
    .sort({ createdAt: -1 })
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
  getFacultyExamSchedules,
  getExamScheduleRoster,
  registerStudentForExam,
  getExamRegistrations,
  updateExamRegistrationStatus,
  submitOrUpdateMarkEntry,
  submitRosterMarks,
  getMarkEntries,
  verifyMarkEntries,
  createMarkCorrectionRequest,
  reviewMarkCorrectionRequest,
  getMarkCorrectionRequests,
  aggregateAndGenerateResults,
  getExamResults,
};
