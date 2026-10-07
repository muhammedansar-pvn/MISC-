const mongoose = require("mongoose");
const Exam = require("./exam.model");
const ExamSchedule = require("./exam-schedule.model");
const ExamRegistration = require("./exam-registration.model");
const MarkEntry = require("./mark-entry.model");
const ExamResult = require("./exam-result.model");
const MarkCorrectionRequest = require("./mark-correction-request.model");
const StudentProfile = require("../students/student.model");
const academicAuthService = require("../academics/academic-auth.service");
const Payment = require("../payments/payment.model");
const notificationService = require("../notifications/notification.service");
require("../academics/subject.model");

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
const enrichExams = async (exams) => {
  if (!exams || exams.length === 0) return exams;
  const examIds = exams.map((e) => e._id);
  const regCounts = await ExamRegistration.aggregate([
    { $match: { examId: { $in: examIds } } },
    { $group: { _id: "$examId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count]));
  const now = new Date();

  return exams.map((exam) => {
    const examObj = exam.toObject ? exam.toObject() : { ...exam };
    const regCount = countMap.get(examObj._id.toString()) || 0;

    let registrationState = "DRAFT";
    if (examObj.status === "PUBLISHED") {
      if (!examObj.registrationStartDate || !examObj.registrationEndDate) {
        registrationState = "UNSCHEDULED";
      } else if (now < new Date(examObj.registrationStartDate)) {
        registrationState = "NOT_STARTED";
      } else if (now > new Date(examObj.registrationEndDate)) {
        registrationState = "CLOSED";
      } else {
        registrationState = "OPEN";
      }
    } else {
      registrationState = examObj.status;
    }

    return {
      ...examObj,
      registeredStudentsCount: regCount,
      registrationState,
      isRegistrationOpen: registrationState === "OPEN",
    };
  });
};

const createExam = async (data) => {
  const payload = { ...data };
  if (!payload.title && payload.name) payload.title = payload.name;
  if (!payload.name && payload.title) payload.name = payload.title;
  if (payload.examStartDate && !payload.startDate) payload.startDate = payload.examStartDate;
  if (payload.examEndDate && !payload.endDate) payload.endDate = payload.examEndDate;

  if (payload.status === "PUBLISHED") {
    if (
      !payload.academicYearId ||
      !payload.startDate ||
      !payload.endDate ||
      !payload.registrationStartDate ||
      !payload.registrationEndDate ||
      !payload.eligibleClassIds ||
      payload.eligibleClassIds.length === 0
    ) {
      const error = new Error("Cannot publish examination without complete configuration (academic year, dates, registration window, and eligible classes)");
      error.statusCode = 400;
      throw error;
    }
    if (!payload.publishedAt) payload.publishedAt = new Date();
  }

  const created = await Exam.create(payload);
  if (created.status === "PUBLISHED") {
    notificationService.notifyExamPublished(created).catch((e) => console.error("Non-fatal notifyExamPublished error:", e.message));
  }
  return created;
};

const getExams = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [rawExams, total] = await Promise.all([
      Exam.find(filter)
        .populate("academicYearId", "yearCode title yearName status")
        .populate("eligibleClassIds", "name className code section")
        .populate("subjectIds", "subjectName subjectCode name code category")
        .sort({ startDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);
    const data = await enrichExams(rawExams);
    return { data, total };
  }
  const rawExams = await Exam.find(filter)
    .populate("academicYearId", "yearCode title yearName status")
    .populate("eligibleClassIds", "name className code section")
    .populate("subjectIds", "subjectName subjectCode name code category")
    .sort({ startDate: -1 })
    .lean();
  return enrichExams(rawExams);
};

const getExamById = async (id) => {
  const exam = await Exam.findById(id)
    .populate("academicYearId", "yearCode title yearName status")
    .populate("eligibleClassIds", "name className code section")
    .populate("subjectIds", "subjectName subjectCode name code category")
    .lean();
  if (!exam) return null;
  const enriched = await enrichExams([exam]);
  return enriched[0];
};

const updateExam = async (id, data) => {
  const existingExam = await Exam.findById(id);
  if (!existingExam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const payload = { ...data };
  if (!payload.title && payload.name) payload.title = payload.name;
  if (!payload.name && payload.title) payload.name = payload.title;
  if (payload.examStartDate && !payload.startDate) payload.startDate = payload.examStartDate;
  if (payload.examEndDate && !payload.endDate) payload.endDate = payload.examEndDate;

  // Safeguard 1: Fee alteration check if payments exist
  if (payload.fee !== undefined && payload.fee !== existingExam.fee) {
    const registrations = await ExamRegistration.find({ examId: id }).select("_id paymentId").lean();
    if (registrations.length > 0) {
      const regIds = registrations.map((r) => r._id);
      const paymentIds = registrations.map((r) => r.paymentId).filter(Boolean);
      const hasSuccessfulPayment = await Payment.exists({
        $or: [
          { examRegistrationId: { $in: regIds }, status: "SUCCESS" },
          { _id: { $in: paymentIds }, status: "SUCCESS" },
        ],
      });
      if (hasSuccessfulPayment) {
        const error = new Error("Cannot modify examination fee after student fee payments have been processed");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Safeguard 2: Eligible class alteration check if registered students exist
  if (payload.eligibleClassIds !== undefined) {
    const registrations = await ExamRegistration.find({ examId: id })
      .populate("studentId", "classId")
      .lean();
    if (registrations.length > 0) {
      const newClassIdStrs = (payload.eligibleClassIds || []).map((c) => (c._id || c).toString());
      const hasExcludedRegisteredStudents = registrations.some((reg) => {
        const studentClassId = reg.studentId?.classId ? (reg.studentId.classId._id || reg.studentId.classId).toString() : null;
        return studentClassId && !newClassIdStrs.includes(studentClassId);
      });
      if (hasExcludedRegisteredStudents) {
        const error = new Error("Cannot remove eligible classes that already have registered students");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Effective status determination and completeness check
  const targetStatus = payload.status !== undefined ? payload.status : existingExam.status;
  if (targetStatus === "PUBLISHED") {
    const effectiveYear = payload.academicYearId !== undefined ? payload.academicYearId : existingExam.academicYearId;
    const effectiveStart = payload.startDate !== undefined ? payload.startDate : existingExam.startDate;
    const effectiveEnd = payload.endDate !== undefined ? payload.endDate : existingExam.endDate;
    const effectiveRegStart = payload.registrationStartDate !== undefined ? payload.registrationStartDate : existingExam.registrationStartDate;
    const effectiveRegEnd = payload.registrationEndDate !== undefined ? payload.registrationEndDate : existingExam.registrationEndDate;
    const effectiveClasses = payload.eligibleClassIds !== undefined ? payload.eligibleClassIds : existingExam.eligibleClassIds;

    if (
      !effectiveYear ||
      !effectiveStart ||
      !effectiveEnd ||
      !effectiveRegStart ||
      !effectiveRegEnd ||
      !effectiveClasses ||
      effectiveClasses.length === 0
    ) {
      const error = new Error("Cannot publish examination without complete configuration (academic year, dates, registration window, and eligible classes)");
      error.statusCode = 400;
      throw error;
    }

    if (!existingExam.publishedAt && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }
  }

  const updated = await Exam.findByIdAndUpdate(id, payload, { new: true })
    .populate("academicYearId", "yearCode title yearName status")
    .populate("eligibleClassIds", "name className code section")
    .populate("subjectIds", "subjectName subjectCode name code category");

  if (updated && updated.status === "PUBLISHED" && (!existingExam || existingExam.status !== "PUBLISHED")) {
    notificationService.notifyExamPublished(updated).catch((e) => console.error("Non-fatal notifyExamPublished error:", e.message));
  }

  return updated;
};

const publishExam = async (id, shouldPublish = true) => {
  const existingExam = await Exam.findById(id);
  if (!existingExam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  if (shouldPublish) {
    if (
      !existingExam.academicYearId ||
      !existingExam.startDate ||
      !existingExam.endDate ||
      !existingExam.registrationStartDate ||
      !existingExam.registrationEndDate ||
      !existingExam.eligibleClassIds ||
      existingExam.eligibleClassIds.length === 0
    ) {
      const error = new Error("Cannot publish examination without complete configuration (academic year, dates, registration window, and eligible classes)");
      error.statusCode = 400;
      throw error;
    }
    existingExam.status = "PUBLISHED";
    if (!existingExam.publishedAt) {
      existingExam.publishedAt = new Date();
    }
  } else {
    existingExam.status = "DRAFT";
  }

  await existingExam.save();
  if (shouldPublish) {
    notificationService.notifyExamPublished(existingExam).catch((e) => console.error("Non-fatal notifyExamPublished error:", e.message));
  }
  return existingExam;
};


// ==========================================
// 1b. AVAILABLE EXAMINATIONS FOR STUDENT
// ==========================================
const getAvailableExamsForStudent = async (studentProfileId) => {
  const student = await StudentProfile.findById(studentProfileId)
    .populate("classId", "name className code")
    .lean();

  if (!student) {
    const error = new Error("Student profile record not found");
    error.statusCode = 404;
    throw error;
  }

  if (student.status === "INACTIVE" || student.status === "SUSPENDED" || student.isDeleted) {
    const error = new Error("Cannot retrieve examinations for an inactive or suspended student");
    error.statusCode = 400;
    throw error;
  }

  // Find candidate exams that are scheduled/ongoing/published
  const examQuery = {
    status: { $in: ["SCHEDULED", "PUBLISHED", "ONGOING"] },
  };

  if (student.academicYearId) {
    examQuery.$or = [
      { academicYearId: student.academicYearId },
      { academicYearId: { $exists: false } },
      { academicYearId: null },
    ];
  }

  const exams = await Exam.find(examQuery)
    .populate("academicYearId", "yearCode title yearName status")
    .populate("eligibleClassIds", "name className code section")
    .sort({ startDate: 1 })
    .lean();

  if (!exams || exams.length === 0) {
    return [];
  }

  // Pre-fetch all registrations of this student for these exams
  const examIds = exams.map((e) => e._id);
  const existingRegistrations = await ExamRegistration.find({
    studentId: student._id,
    examId: { $in: examIds },
  })
    .populate("paymentId", "transactionId status amount currency gateway receiptUrl paidAt")
    .lean();

  const regMap = new Map();
  for (const reg of existingRegistrations) {
    regMap.set(reg.examId.toString(), reg);
  }

  // Pre-fetch all schedules for these candidate exams
  const allSchedules = await ExamSchedule.find({
    examId: { $in: examIds },
  })
    .populate("subjectId", "subjectName subjectCode name code")
    .select("examId classId subjectId examDate startTime endTime maxMarks passMarks status")
    .sort({ examDate: 1, startTime: 1 })
    .lean();

  const schedulesByExam = new Map();
  for (const sched of allSchedules) {
    const key = sched.examId.toString();
    if (!schedulesByExam.has(key)) {
      schedulesByExam.set(key, []);
    }
    schedulesByExam.get(key).push(sched);
  }

  const now = new Date();
  const availableExams = [];

  for (const exam of exams) {
    const examKey = exam._id.toString();
    const schedules = schedulesByExam.get(examKey) || [];

    // Check Class Eligibility
    let isClassEligible = true;
    if (exam.eligibleClassIds && exam.eligibleClassIds.length > 0) {
      const studentClassIdStr = student.classId ? (student.classId._id || student.classId).toString() : null;
      isClassEligible = exam.eligibleClassIds.some(
        (c) => (c._id || c).toString() === studentClassIdStr
      );
    } else if (student.classId && schedules.length > 0) {
      const studentClassIdStr = (student.classId._id || student.classId).toString();
      isClassEligible = schedules.some((s) => s.classId?.toString() === studentClassIdStr);
    }

    // If not class eligible and not already registered, skip from available list
    const existingReg = regMap.get(examKey);
    if (!isClassEligible && !existingReg) {
      continue;
    }

    // Determine registration window status
    let isRegistrationOpen = true;
    let registrationCloseReason = null;

    if (exam.registrationStartDate && now < new Date(exam.registrationStartDate)) {
      isRegistrationOpen = false;
      registrationCloseReason = `Registration opens on ${new Date(exam.registrationStartDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    } else if (exam.registrationEndDate && now > new Date(exam.registrationEndDate)) {
      isRegistrationOpen = false;
      registrationCloseReason = `Registration closed on ${new Date(exam.registrationEndDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    } else if (!exam.registrationEndDate && now > new Date(exam.startDate)) {
      isRegistrationOpen = false;
      registrationCloseReason = "Registration closed (examination already commenced)";
    }

    // Filter student schedules for this class
    const studentClassIdStr = student.classId ? (student.classId._id || student.classId).toString() : null;
    const studentSchedules = studentClassIdStr
      ? schedules.filter((s) => s.classId?.toString() === studentClassIdStr)
      : schedules;

    // Check payment status on registration
    const effectiveFee = Number(exam.fee !== undefined && exam.fee !== null ? exam.fee : (exam.examFee || 0));
    let isPaid = false;
    let paymentStatus = "UNPAID";
    if (existingReg) {
      if (existingReg.registrationStatus === "HALL_TICKET_ISSUED") {
        isPaid = true;
        paymentStatus = "PAID";
      } else if (existingReg.paymentId && existingReg.paymentId.status === "SUCCESS") {
        isPaid = true;
        paymentStatus = "PAID";
      } else if (existingReg.paymentId && existingReg.paymentId.status === "PENDING") {
        paymentStatus = "PENDING";
      } else if (effectiveFee === 0) {
        isPaid = true;
        paymentStatus = "PAID";
      }
    }

    availableExams.push({
      _id: exam._id,
      title: exam.title || exam.name,
      name: exam.name || exam.title,
      code: exam.code,
      term: exam.term,
      examType: exam.examType,
      fee: effectiveFee,
      examFee: effectiveFee,
      startDate: exam.startDate,
      endDate: exam.endDate,
      registrationStartDate: exam.registrationStartDate || null,
      registrationEndDate: exam.registrationEndDate || null,
      status: exam.status,
      academicYear: exam.academicYearId,
      eligibleClasses: exam.eligibleClassIds || [],
      schedulesCount: studentSchedules.length,
      schedules: studentSchedules,
      isRegistered: Boolean(existingReg),
      isPaid: Boolean(isPaid),
      paymentStatus,
      registrationStatus: existingReg?.registrationStatus || null,
      registration: existingReg
        ? {
            _id: existingReg._id,
            rollNumber: existingReg.rollNumber,
            registrationStatus: existingReg.registrationStatus,
            paymentStatus,
            isPaid,
            createdAt: existingReg.createdAt,
          }
        : null,
      isRegistrationOpen: isRegistrationOpen && !existingReg,
      registrationCloseReason: existingReg ? "Already Registered" : registrationCloseReason,
    });
  }

  return availableExams;
};

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

  const Subject = require("../academics/subject.model");
  const subject = await Subject.findById(data.subjectId);
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }
  if (Array.isArray(subject.classes) && subject.classes.length > 0) {
    const isAssigned = subject.classes.some((c) => c.toString() === data.classId.toString());
    if (!isAssigned) {
      const error = new Error("Subject is not assigned to the selected class");
      error.statusCode = 400;
      throw error;
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

const updateExamSchedule = async (id, data) => {
  const current = await ExamSchedule.findById(id);
  if (!current) {
    const error = new Error("Exam schedule not found");
    error.statusCode = 404;
    throw error;
  }
  const targetClassId = data.classId || current.classId;
  const targetSubjectId = data.subjectId || current.subjectId;
  if (data.classId || data.subjectId) {
    const Subject = require("../academics/subject.model");
    const subject = await Subject.findById(targetSubjectId);
    if (!subject) {
      const error = new Error("Subject not found");
      error.statusCode = 404;
      throw error;
    }
    if (Array.isArray(subject.classes) && subject.classes.length > 0) {
      const isAssigned = subject.classes.some((c) => c.toString() === targetClassId.toString());
      if (!isAssigned) {
        const error = new Error("Subject is not assigned to the selected class");
        error.statusCode = 400;
        throw error;
      }
    }
  }
  return ExamSchedule.findByIdAndUpdate(id, data, { new: true });
};

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
  // 1. Verify Exam existence and status
  const exam = await Exam.findById(data.examId).lean();
  if (!exam) {
    const error = new Error("Examination record not found");
    error.statusCode = 404;
    throw error;
  }
  if (exam.status === "COMPLETED") {
    const error = new Error("Registration is closed for completed examinations");
    error.statusCode = 400;
    throw error;
  }
  if (exam.status === "DRAFT") {
    const error = new Error("Registration is not open for draft examinations");
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify Student Profile existence and active status
  const student = await StudentProfile.findById(data.studentId).lean();
  if (!student) {
    const error = new Error("Student profile record not found");
    error.statusCode = 404;
    throw error;
  }
  if (student.status === "INACTIVE" || student.status === "SUSPENDED" || student.isDeleted) {
    const error = new Error("Cannot register an inactive or suspended student for examinations");
    error.statusCode = 400;
    throw error;
  }

  // 3. Class Eligibility Check
  if (exam.eligibleClassIds && exam.eligibleClassIds.length > 0) {
    const studentClassIdStr = student.classId ? (student.classId._id || student.classId).toString() : null;
    const isEligible = exam.eligibleClassIds.some(
      (c) => (c._id || c).toString() === studentClassIdStr
    );
    if (!isEligible) {
      const error = new Error("Student's class is not eligible for this examination");
      error.statusCode = 400;
      throw error;
    }
  } else if (student.classId) {
    const studentClassIdStr = (student.classId._id || student.classId).toString();
    const totalSchedules = await ExamSchedule.countDocuments({ examId: exam._id });
    if (totalSchedules > 0) {
      const hasClassSchedule = await ExamSchedule.exists({ examId: exam._id, classId: studentClassIdStr });
      if (!hasClassSchedule) {
        const error = new Error("Examination schedule is not configured for student's class");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // 4. Registration Window Check
  const now = new Date();
  if (exam.registrationStartDate && now < new Date(exam.registrationStartDate)) {
    const error = new Error(
      `Examination registration has not opened yet (Opens: ${new Date(exam.registrationStartDate).toLocaleDateString("en-IN")})`
    );
    error.statusCode = 400;
    throw error;
  }
  if (exam.registrationEndDate && now > new Date(exam.registrationEndDate)) {
    const error = new Error(
      `Examination registration has closed (Closed: ${new Date(exam.registrationEndDate).toLocaleDateString("en-IN")})`
    );
    error.statusCode = 400;
    throw error;
  }
  if (!exam.registrationEndDate && now > new Date(exam.startDate)) {
    const error = new Error("Registration is closed because examination has already commenced");
    error.statusCode = 400;
    throw error;
  }

  // 5. Prevent duplicate candidate registration
  const existingReg = await ExamRegistration.findOne({ examId: data.examId, studentId: data.studentId });
  if (existingReg) {
    const error = new Error("Student is already registered for this examination");
    error.statusCode = 409;
    throw error;
  }

  // 4. Validate or generate roll number
  if (data.rollNumber && data.rollNumber.trim()) {
    const existingRoll = await ExamRegistration.exists({ rollNumber: data.rollNumber.trim() });
    if (existingRoll) {
      const error = new Error("Roll number is already assigned");
      error.statusCode = 409;
      throw error;
    }
    data.rollNumber = data.rollNumber.trim();
  } else {
    const baseCode = (exam.code || "EXAM").replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
    const regPart = (student.registrationNumber || Date.now().toString().slice(-4)).replace(/[^A-Za-z0-9]/g, "").slice(-4);
    let candidateRoll = `ROLL-${baseCode}-${regPart}`;
    const rollTaken = await ExamRegistration.exists({ rollNumber: candidateRoll });
    if (rollTaken) {
      candidateRoll = `ROLL-${baseCode}-${regPart}-${Math.floor(100 + Math.random() * 900)}`;
    }
    data.rollNumber = candidateRoll;
  }

  // 5. Check and reconcile fee payment upon registration
  let isPaid = false;
  let linkedPaymentId = data.paymentId || null;

  if (linkedPaymentId) {
    const payment = await Payment.findById(linkedPaymentId).lean();
    if (payment && payment.status === "SUCCESS") {
      isPaid = true;
    }
  } else {
    // Only link if there's an unlinked successful payment explicitly designated for this exam
    const existingPayment = await Payment.findOne({
      userId: student.userId,
      paymentType: "EXAM_FEE",
      status: "SUCCESS",
      examRegistrationId: null,
      $or: [
        { "metadata.examId": exam._id },
        { "metadata.notes.examId": exam._id.toString() },
      ],
    }).sort({ createdAt: -1 }).lean();

    if (existingPayment) {
      linkedPaymentId = existingPayment._id;
      isPaid = true;
    }
  }

  data.paymentId = linkedPaymentId;
  data.registrationStatus = isPaid ? "HALL_TICKET_ISSUED" : (data.registrationStatus || "REGISTERED");

  const createdReg = await ExamRegistration.create(data);
  notificationService.notifyExamRegistration(createdReg, exam).catch((e) => console.error("Non-fatal notifyExamRegistration error:", e.message));
  if (createdReg.registrationStatus === "HALL_TICKET_ISSUED") {
    notificationService.notifyHallTicketIssued(createdReg, exam).catch((e) => console.error("Non-fatal notifyHallTicketIssued error:", e.message));
  }
  return createdReg;
};

const getExamRegistrations = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      ExamRegistration.find(filter)
        .populate("examId", "title code examCode startDate endDate status")
        .populate("studentId", "nameEnglish name registrationNumber admissionNumber classId")
        .populate("institutionId", "name code")
        .populate("paymentId", "transactionId status amount currency gateway receiptUrl paidAt createdAt")
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExamRegistration.countDocuments(filter),
    ]);
    return { data, total };
  }
  return ExamRegistration.find(filter)
    .populate("examId", "title code examCode startDate endDate status")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber classId")
    .populate("institutionId", "name code")
    .populate("paymentId", "transactionId status amount currency gateway receiptUrl paidAt createdAt")
    .lean();
};

const getExamRegistrationById = async (id, requestingUser = null) => {
  const registration = await ExamRegistration.findById(id)
    .populate("examId", "title code examCode startDate endDate status")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber classId photo contactNumber")
    .populate("institutionId", "name code")
    .populate("paymentId", "transactionId status amount currency gateway receiptUrl paidAt createdAt")
    .lean();

  if (!registration) {
    const error = new Error("Exam registration record not found");
    error.statusCode = 404;
    throw error;
  }

  // IDOR & Authorization check
  if (requestingUser) {
    if (requestingUser.role === "STUDENT") {
      const studentProfileId = registration.studentId?._id
        ? registration.studentId._id.toString()
        : registration.studentId.toString();
      if (studentProfileId !== requestingUser.studentId?.toString()) {
        const error = new Error("Access denied: You are not authorized to view this exam registration");
        error.statusCode = 403;
        throw error;
      }
    } else if (requestingUser.role === "PARENT") {
      const studentProfileId = registration.studentId?._id
        ? registration.studentId._id.toString()
        : registration.studentId.toString();
      const parentStudents = (requestingUser.parentStudentIds || []).map((s) => s.toString());
      if (!parentStudents.includes(studentProfileId)) {
        const error = new Error("Access denied: You are not authorized to view this exam registration");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  return registration;
};

const checkExamFeePaymentStatus = async (registrationId, requestingUser = null) => {
  const registration = await ExamRegistration.findById(registrationId)
    .populate("examId", "title code examCode startDate endDate status")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber classId")
    .populate("institutionId", "name code");

  if (!registration) {
    const error = new Error("Exam registration record not found");
    error.statusCode = 404;
    throw error;
  }

  // IDOR & Authorization check
  if (requestingUser) {
    if (requestingUser.role === "STUDENT") {
      const studentProfileId = registration.studentId?._id
        ? registration.studentId._id.toString()
        : registration.studentId.toString();
      if (studentProfileId !== requestingUser.studentId?.toString()) {
        const error = new Error("Access denied: You are not authorized to check exam fee for this registration");
        error.statusCode = 403;
        throw error;
      }
    } else if (requestingUser.role === "PARENT") {
      const studentProfileId = registration.studentId?._id
        ? registration.studentId._id.toString()
        : registration.studentId.toString();
      const parentStudents = (requestingUser.parentStudentIds || []).map((s) => s.toString());
      if (!parentStudents.includes(studentProfileId)) {
        const error = new Error("Access denied: You are not authorized to check exam fee for this registration");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  let payment = null;

  // 1. If registration already has paymentId linked, inspect it
  if (registration.paymentId) {
    payment = await Payment.findById(registration.paymentId).lean();
    if (payment && payment.status === "SUCCESS") {
      if (registration.registrationStatus !== "HALL_TICKET_ISSUED") {
        registration.registrationStatus = "HALL_TICKET_ISSUED";
        await registration.save();
      }
      return {
        isPaid: true,
        status: "PAID",
        payment,
        registration,
        message: "Exam fee payment confirmed and Hall Ticket is available.",
      };
    }
  }

  // 2. Auto-reconcile: Check if a successful payment exists for this exam registration
  const successfulPayment = await Payment.findOne({
    examRegistrationId: registration._id,
    paymentType: "EXAM_FEE",
    status: "SUCCESS",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (successfulPayment) {
    registration.paymentId = successfulPayment._id;
    registration.registrationStatus = "HALL_TICKET_ISSUED";
    await registration.save();
    return {
      isPaid: true,
      status: "PAID",
      payment: successfulPayment,
      registration,
      message: "Exam fee payment reconciled successfully. Hall Ticket issued.",
    };
  }

  // 3. Check for any pending or initiated payment
  const pendingPayment = await Payment.findOne({
    examRegistrationId: registration._id,
    paymentType: "EXAM_FEE",
    status: { $in: ["PENDING", "INITIATED"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (pendingPayment) {
    return {
      isPaid: false,
      status: "PENDING",
      payment: pendingPayment,
      registration,
      message: "Exam fee payment transaction is pending confirmation.",
    };
  }

  // 4. Check for any failed payment
  const failedPayment = await Payment.findOne({
    examRegistrationId: registration._id,
    paymentType: "EXAM_FEE",
    status: "FAILED",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (failedPayment) {
    return {
      isPaid: false,
      status: "FAILED",
      payment: failedPayment,
      registration,
      message: failedPayment.failureReason || "Last payment attempt failed. You may retry.",
    };
  }

  // 5. Default: No payment record found
  return {
    isPaid: false,
    status: "UNPAID",
    payment: null,
    registration,
    message: "Exam fee has not been paid.",
  };
};

const updateExamRegistrationStatus = async (id, registrationStatus) => {
  const updatedReg = await ExamRegistration.findByIdAndUpdate(id, { registrationStatus }, { new: true });
  if (updatedReg && updatedReg.registrationStatus === "HALL_TICKET_ISSUED") {
    const exam = await Exam.findById(updatedReg.examId).select("title name code").lean();
    notificationService.notifyHallTicketIssued(updatedReg, exam).catch((e) => console.error("Non-fatal notifyHallTicketIssued error:", e.message));
  }
  return updatedReg;
};

// ==========================================
// 5. MARK ENTRIES (SECURE & AUTHORIZED)
// ==========================================
const submitOrUpdateMarkEntry = async (data, requestingUser = null) => {
  if (requestingUser?.role === "FACULTY") {
    const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
    await assertFacultyAvailableForAssignment(requestingUser.userId || requestingUser.id || requestingUser.facultyId);
  }

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
  if (requestingUser?.role === "FACULTY") {
    const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
    await assertFacultyAvailableForAssignment(requestingUser.userId || requestingUser.id || requestingUser.facultyId);
  }

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

  try {
    const examDoc = await Exam.findById(examId).lean();
    if (examDoc && isExamResultPublished(examDoc)) {
      notificationService.notifyResultPublished(examDoc, classId).catch((e) => console.error("Non-fatal notifyResultPublished error:", e.message));
    }
  } catch (notifErr) {
    console.error("Non-fatal error in result publication notification:", notifErr.message);
  }

  return ExamResult.find({ examId, classId })
    .populate("examId", "title code")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("classId", "name className code")
    .lean();
};

/**
 * Centralized rule for exam result visibility.
 * Returns true if the results for this exam are publicly visible to students and parents.
 */
const isExamResultPublished = (exam, currentTime = new Date()) => {
  if (!exam) return false;
  if (exam.resultPublicationDate) {
    return new Date(currentTime).getTime() >= new Date(exam.resultPublicationDate).getTime();
  }
  // Backward compatibility: If no resultPublicationDate is configured,
  // it is visible if the exam status is PUBLISHED or COMPLETED (legacy behavior)
  return exam.status === "PUBLISHED" || exam.status === "COMPLETED";
};

const getExamResults = async (filter = {}, pagination = null, requestingUser = null) => {
  const query = { ...filter };
  const currentTime = new Date();

  if (requestingUser) {
    if (requestingUser.role === "STUDENT") {
      if (!requestingUser.studentId) {
        const error = new Error("No student profile associated with this account");
        error.statusCode = 403;
        throw error;
      }
      query.studentId = requestingUser.studentId;
      query.status = "PUBLISHED";

      // If specific examId is queried
      if (query.examId) {
        const targetExam = await Exam.findById(query.examId).lean();
        if (!targetExam) {
          return pagination ? { data: [], total: 0 } : [];
        }
        if (!isExamResultPublished(targetExam, currentTime)) {
          return {
            data: [],
            total: 0,
            isPublished: false,
            publicationStatus: "SCHEDULED",
            resultPublicationDate: targetExam.resultPublicationDate || null,
            examTitle: targetExam.title || targetExam.name || "Examination",
            message: targetExam.resultPublicationDate
              ? `Results for ${targetExam.title || targetExam.name || "this examination"} will be published on ${new Date(targetExam.resultPublicationDate).toISOString()}`
              : "Results for this examination have not been published yet.",
          };
        }
      } else {
        // Exclude unpublished exams from the student's result feed
        const unpublishedExams = await Exam.find({
          resultPublicationDate: { $gt: currentTime },
        })
          .select("_id")
          .lean();
        const unpublishedIds = unpublishedExams.map((e) => e._id);
        if (unpublishedIds.length > 0) {
          query.examId = { $nin: unpublishedIds };
        }
      }
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
    } else if (requestingUser.role === "PARENT") {
      const parentStudentIds = (requestingUser.parentStudentIds || []).map((id) => id.toString());
      if (query.studentId) {
        if (!parentStudentIds.includes(query.studentId.toString())) {
          const error = new Error("Forbidden: You are not authorized to view this student's results");
          error.statusCode = 403;
          throw error;
        }
      } else {
        query.studentId = { $in: parentStudentIds };
      }
      query.status = "PUBLISHED";

      // If specific examId is queried
      if (query.examId) {
        const targetExam = await Exam.findById(query.examId).lean();
        if (!targetExam) {
          return pagination ? { data: [], total: 0 } : [];
        }
        if (!isExamResultPublished(targetExam, currentTime)) {
          return {
            data: [],
            total: 0,
            isPublished: false,
            publicationStatus: "SCHEDULED",
            resultPublicationDate: targetExam.resultPublicationDate || null,
            examTitle: targetExam.title || targetExam.name || "Examination",
            message: targetExam.resultPublicationDate
              ? `Results for ${targetExam.title || targetExam.name || "this examination"} will be published on ${new Date(targetExam.resultPublicationDate).toISOString()}`
              : "Results for this examination have not been published yet.",
          };
        }
      } else {
        // Exclude unpublished exams from the parent's result feed
        const unpublishedExams = await Exam.find({
          resultPublicationDate: { $gt: currentTime },
        })
          .select("_id")
          .lean();
        const unpublishedIds = unpublishedExams.map((e) => e._id);
        if (unpublishedIds.length > 0) {
          query.examId = { $nin: unpublishedIds };
        }
      }
    }
  }

  if (pagination) {
    const [rawResults, total] = await Promise.all([
      ExamResult.find(query)
        .populate("examId", "title code examCode resultPublicationDate status")
        .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
        .populate("classId", "name className code")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      ExamResult.countDocuments(query),
    ]);

    // Defense-in-depth: ensure no unpublished exam slips through for student/parent
    let data = rawResults;
    if (requestingUser && (requestingUser.role === "STUDENT" || requestingUser.role === "PARENT")) {
      data = rawResults.filter((r) => isExamResultPublished(r.examId, currentTime));
    }

    return { data, total };
  }

  const rawResults = await ExamResult.find(query)
    .populate("examId", "title code examCode resultPublicationDate status")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("classId", "name className code")
    .sort({ createdAt: -1 })
    .lean();

  let data = rawResults;
  if (requestingUser && (requestingUser.role === "STUDENT" || requestingUser.role === "PARENT")) {
    data = rawResults.filter((r) => isExamResultPublished(r.examId, currentTime));
  }

  return data;
};

const getExamResultById = async (id, requestingUser = null) => {
  const result = await ExamResult.findById(id)
    .populate("examId", "title code examCode resultPublicationDate status")
    .populate("studentId", "nameEnglish name registrationNumber admissionNumber")
    .populate("classId", "name className code")
    .lean();

  if (!result) {
    const error = new Error("Exam result not found");
    error.statusCode = 404;
    throw error;
  }

  const currentTime = new Date();

  if (requestingUser) {
    if (requestingUser.role === "STUDENT") {
      const studentIdStr = result.studentId?._id?.toString() || result.studentId?.toString();
      if (studentIdStr !== requestingUser.studentId?.toString()) {
        const error = new Error("Forbidden: You are not authorized to view this result");
        error.statusCode = 403;
        throw error;
      }
      if (!isExamResultPublished(result.examId, currentTime)) {
        const error = new Error(
          result.examId?.resultPublicationDate
            ? `Results for this examination have not been published yet. Scheduled for: ${new Date(result.examId.resultPublicationDate).toISOString()}`
            : "Results for this examination have not been published yet."
        );
        error.statusCode = 403;
        error.isPublished = false;
        error.resultPublicationDate = result.examId?.resultPublicationDate;
        throw error;
      }
    } else if (requestingUser.role === "PARENT") {
      const parentStudentIds = (requestingUser.parentStudentIds || []).map((sId) => sId.toString());
      const studentIdStr = result.studentId?._id?.toString() || result.studentId?.toString();
      if (!parentStudentIds.includes(studentIdStr)) {
        const error = new Error("Forbidden: You are not authorized to view this student's results");
        error.statusCode = 403;
        throw error;
      }
      if (!isExamResultPublished(result.examId, currentTime)) {
        const error = new Error(
          result.examId?.resultPublicationDate
            ? `Results for this examination have not been published yet. Scheduled for: ${new Date(result.examId.resultPublicationDate).toISOString()}`
            : "Results for this examination have not been published yet."
        );
        error.statusCode = 403;
        error.isPublished = false;
        error.resultPublicationDate = result.examId?.resultPublicationDate;
        throw error;
      }
    } else if (requestingUser.role === "FACULTY") {
      const authorizedClasses = await academicAuthService.getFacultyAuthorizedClasses(
        requestingUser.userId || requestingUser._id
      );
      const authClassIds = authorizedClasses.map((c) => c._id.toString());
      const classIdStr = result.classId?._id?.toString() || result.classId?.toString();
      if (!authClassIds.includes(classIdStr)) {
        const error = new Error("Forbidden: You are not assigned to this class");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  return result;
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  getAvailableExamsForStudent,
  updateExam,
  publishExam,
  createExamSchedule,
  getExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  getFacultyExamSchedules,
  getExamScheduleRoster,
  registerStudentForExam,
  getExamRegistrations,
  getExamRegistrationById,
  checkExamFeePaymentStatus,
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
  getExamResultById,
  isExamResultPublished,
};
