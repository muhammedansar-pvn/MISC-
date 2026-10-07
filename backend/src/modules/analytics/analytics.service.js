const mongoose = require("mongoose");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const FacultyAssignment = require("../academics/faculty-assignment.model");
const Class = require("../academics/class.model");
const Subject = require("../academics/subject.model");
const AcademicYear = require("../academics/academic-year.model");
const AttendanceRecord = require("../attendance/attendance-record.model");
const Exam = require("../exams/exam.model");
const ExamSchedule = require("../exams/exam-schedule.model");
const ExamRegistration = require("../exams/exam-registration.model");
const ExamResult = require("../exams/exam-result.model");
const MarkEntry = require("../exams/mark-entry.model");
const ParentProfile = require("../parents/parent.model");
const Payment = require("../payments/payment.model");
const User = require("../users/user.model");
const academicAuthService = require("../academics/academic-auth.service");

/**
 * -------------------------------------------------------------
 * 1. ADMIN ANALYTICS SERVICE
 * -------------------------------------------------------------
 */
const getAdminAnalytics = async (filters = {}) => {
  const { academicYearId, classId, startDate, endDate } = filters;

  // 1. Base query match filters
  const studentMatch = { isDeleted: { $ne: true } };
  const attendanceMatch = {};

  if (academicYearId && mongoose.Types.ObjectId.isValid(academicYearId)) {
    studentMatch.academicYearId = new mongoose.Types.ObjectId(academicYearId);
    attendanceMatch.academicYearId = new mongoose.Types.ObjectId(academicYearId);
  }

  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    studentMatch.classId = new mongoose.Types.ObjectId(classId);
    attendanceMatch.classId = new mongoose.Types.ObjectId(classId);
  }

  if (startDate || endDate) {
    attendanceMatch.date = {};
    if (startDate) attendanceMatch.date.$gte = new Date(startDate);
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      attendanceMatch.date.$lte = eDate;
    }
  }

  const now = new Date();

  // 2. Fetch parallel high-level aggregates
  const [
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalFaculty,
    totalClasses,
    totalParents,
    classesList,
    academicYearsList,
    studentsByClassAgg,
    studentsByYearAgg,
    studentsByHouseAgg,
    studentsByAdmissionAgg,
    attendanceStatsAgg,
    attendanceMonthlyAgg,
    classAttendanceAgg,
    examsList,
    examRegistrationsAgg,
    examPaymentsAgg,
    examResultsAgg,
    recentMarkEntriesAgg,
    lowAttendanceStudentsAgg,
  ] = await Promise.all([
    // Student counts
    StudentProfile.countDocuments(studentMatch),
    StudentProfile.countDocuments({ ...studentMatch, status: "ACTIVE" }),
    StudentProfile.countDocuments({ ...studentMatch, status: { $in: ["INACTIVE", "SUSPENDED"] } }),

    // Faculty count
    FacultyProfile.countDocuments({ status: "ACTIVE" }),

    // Classes & Parents
    Class.countDocuments({ status: "ACTIVE" }),
    ParentProfile.countDocuments({ isDeleted: { $ne: true }, status: "ACTIVE" }),

    // Class and Academic Year lookups
    Class.find({ status: "ACTIVE" }).select("_id name code department").lean(),
    AcademicYear.find().select("_id yearCode name isCurrent").lean(),

    // Students grouped by class
    StudentProfile.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: "$classId",
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDoc",
        },
      },
      { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          classId: "$_id",
          className: { $ifNull: ["$classDoc.name", "Unassigned"] },
          classCode: { $ifNull: ["$classDoc.code", "N/A"] },
          department: { $ifNull: ["$classDoc.department", "General"] },
          total: 1,
          active: 1,
        },
      },
      { $sort: { className: 1 } },
    ]),

    // Students grouped by academic year
    StudentProfile.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: "$academicYearId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "academicYears",
          localField: "_id",
          foreignField: "_id",
          as: "yearDoc",
        },
      },
      { $unwind: { path: "$yearDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          yearId: "$_id",
          yearName: { $ifNull: ["$yearDoc.yearCode", { $ifNull: ["$yearDoc.name", "Current Year"] }] },
          count: 1,
        },
      },
    ]),

    // Students by House
    StudentProfile.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: { $ifNull: ["$house", "UNASSIGNED"] },
          count: { $sum: 1 },
        },
      },
    ]),

    // Students by Admission Year
    StudentProfile.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: "$admissionYear",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ]),

    // Attendance stats summary
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
        },
      },
    ]),

    // Monthly attendance trend
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    // Class-wise attendance comparison
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: "$classId",
          total: { $sum: 1 },
          attended: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDoc",
        },
      },
      { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          classId: "$_id",
          className: { $ifNull: ["$classDoc.name", "Class"] },
          classCode: { $ifNull: ["$classDoc.code", "N/A"] },
          total: 1,
          attended: 1,
          present: 1,
          absent: 1,
          late: 1,
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$attended", "$total"] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { percentage: -1 } },
    ]),

    // Exams List
    Exam.find()
      .populate("academicYearId", "yearCode name")
      .populate("eligibleClassIds", "name code")
      .sort({ startDate: -1 })
      .lean(),

    // Exam registrations
    ExamRegistration.aggregate([
      {
        $group: {
          _id: "$examId",
          totalRegistered: { $sum: 1 },
          hallTicketsIssued: {
            $sum: { $cond: [{ $eq: ["$registrationStatus", "HALL_TICKET_ISSUED"] }, 1, 0] },
          },
        },
      },
    ]),

    // Exam Fee Payments
    Payment.aggregate([
      { $match: { paymentType: "EXAM_FEE" } },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Exam Results aggregate
    ExamResult.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalResults: { $sum: 1 },
                passedCount: { $sum: { $cond: [{ $eq: ["$resultStatus", "PASSED"] }, 1, 0] } },
                failedCount: { $sum: { $cond: [{ $eq: ["$resultStatus", "FAILED"] }, 1, 0] } },
                averagePercentage: { $avg: "$percentage" },
              },
            },
          ],
          gradeDistribution: [
            {
              $group: {
                _id: "$grade",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topPerformers: [
            { $sort: { percentage: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "studentProfiles",
                localField: "studentId",
                foreignField: "_id",
                as: "studentDoc",
              },
            },
            { $unwind: { path: "$studentDoc", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "classes",
                localField: "classId",
                foreignField: "_id",
                as: "classDoc",
              },
            },
            { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                studentName: { $ifNull: ["$studentDoc.nameEnglish", "Student"] },
                registrationNumber: { $ifNull: ["$studentDoc.registrationNumber", "N/A"] },
                className: { $ifNull: ["$classDoc.name", "Class"] },
                percentage: 1,
                grade: 1,
                resultStatus: 1,
              },
            },
          ],
          strugglingStudents: [
            { $match: { $or: [{ resultStatus: "FAILED" }, { percentage: { $lt: 40 } }] } },
            { $limit: 10 },
            {
              $lookup: {
                from: "studentProfiles",
                localField: "studentId",
                foreignField: "_id",
                as: "studentDoc",
              },
            },
            { $unwind: { path: "$studentDoc", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "classes",
                localField: "classId",
                foreignField: "_id",
                as: "classDoc",
              },
            },
            { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                studentId: "$studentId",
                studentName: { $ifNull: ["$studentDoc.nameEnglish", "Student"] },
                registrationNumber: { $ifNull: ["$studentDoc.registrationNumber", "N/A"] },
                className: { $ifNull: ["$classDoc.name", "Class"] },
                percentage: 1,
                grade: 1,
                resultStatus: 1,
              },
            },
          ],
        },
      },
    ]),

    // Recent mark entries status
    MarkEntry.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // Attendance per student to flag <75%
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          attended: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
        },
      },
      {
        $project: {
          studentId: "$_id",
          total: 1,
          attended: 1,
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$attended", "$total"] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $match: { percentage: { $lt: 75 }, total: { $gte: 1 } } },
      {
        $lookup: {
          from: "studentProfiles",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDoc",
        },
      },
      { $unwind: { path: "$studentDoc", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "studentDoc.classId",
          foreignField: "_id",
          as: "classDoc",
        },
      },
      { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: 1,
          studentName: { $ifNull: ["$studentDoc.nameEnglish", "Student"] },
          registrationNumber: { $ifNull: ["$studentDoc.registrationNumber", "N/A"] },
          className: { $ifNull: ["$classDoc.name", "Class"] },
          total: 1,
          attended: 1,
          percentage: 1,
        },
      },
      { $sort: { percentage: 1 } },
      { $limit: 15 },
    ]),
  ]);

  // Attendance summary calculation
  const attTotal = attendanceStatsAgg[0] || {
    totalRecords: 0,
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
  };
  const attendedCount = attTotal.present + attTotal.late;
  const averageAttendance = attTotal.totalRecords > 0
    ? Number(((attendedCount / attTotal.totalRecords) * 100).toFixed(1))
    : 0;

  // Upcoming exams count
  const upcomingExams = examsList.filter((e) => {
    return new Date(e.startDate) > now || ["SCHEDULED", "PUBLISHED"].includes(e.status);
  });

  // Exams with pending results
  const completedExams = examsList.filter(
    (e) => e.status === "COMPLETED" || new Date(e.endDate) < now
  );
  const pendingResultsCount = completedExams.length; // Exams past end date or marked completed

  // Faculty to student ratio
  const facultyStudentRatio = totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(1) : "0";

  // Payments breakdown
  const successfulFeePayments = examPaymentsAgg.find((p) => p._id === "SUCCESS");
  const pendingFeePayments = examPaymentsAgg.find((p) => p._id === "PENDING" || p._id === "CREATED");
  const feeStats = {
    collectedAmount: successfulFeePayments ? successfulFeePayments.totalAmount : 0,
    collectedCount: successfulFeePayments ? successfulFeePayments.count : 0,
    pendingAmount: pendingFeePayments ? pendingFeePayments.totalAmount : 0,
    pendingCount: pendingFeePayments ? pendingFeePayments.count : 0,
  };

  // Exam Results block
  const examResultFacet = examResultsAgg[0] || {};
  const examResultSummary = (examResultFacet.summary && examResultFacet.summary[0]) || {
    totalResults: 0,
    passedCount: 0,
    failedCount: 0,
    averagePercentage: 0,
  };

  // Classes with unmarked attendance recently
  const classesWithRecordsSet = new Set(
    classAttendanceAgg.map((c) => c.classId ? c.classId.toString() : "")
  );
  const unmarkedClasses = classesList
    .filter((c) => !classesWithRecordsSet.has(c._id.toString()))
    .map((c) => ({
      classId: c._id,
      className: c.name,
      classCode: c.code,
      department: c.department || "General",
    }));

  return {
    kpis: {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalFaculty,
      totalClasses,
      totalParents,
      averageStudentAttendance: averageAttendance,
      upcomingExamsCount: upcomingExams.length,
      pendingResultsCount,
      facultyStudentRatio: `1 : ${facultyStudentRatio}`,
    },
    students: {
      byClass: studentsByClassAgg,
      byAcademicYear: studentsByYearAgg,
      byHouse: studentsByHouseAgg.map((h) => ({ house: h._id, count: h.count })),
      byAdmissionYear: studentsByAdmissionAgg.map((a) => ({ year: a._id, count: a.count })),
      statusOverview: {
        active: activeStudents,
        inactive: inactiveStudents,
        total: totalStudents,
      },
    },
    attendance: {
      overallPercentage: averageAttendance,
      totalRecords: attTotal.totalRecords,
      statusBreakdown: {
        present: attTotal.present,
        late: attTotal.late,
        absent: attTotal.absent,
        leave: attTotal.leave,
      },
      monthlyTrends: attendanceMonthlyAgg.map((m) => ({
        month: m._id,
        total: m.total,
        present: m.present,
        absent: m.absent,
        late: m.late,
        percentage: m.total > 0 ? Number(((m.present / m.total) * 100).toFixed(1)) : 0,
      })),
      classWiseComparison: classAttendanceAgg,
      unmarkedClassesCount: unmarkedClasses.length,
    },
    academics: {
      examsCount: examsList.length,
      totalResultsRecorded: examResultSummary.totalResults,
      passedCount: examResultSummary.passedCount,
      failedCount: examResultSummary.failedCount,
      passRate: examResultSummary.totalResults > 0
        ? Number(((examResultSummary.passedCount / examResultSummary.totalResults) * 100).toFixed(1))
        : 0,
      averageScore: examResultSummary.averagePercentage
        ? Number(examResultSummary.averagePercentage.toFixed(1))
        : 0,
      gradeDistribution: examResultFacet.gradeDistribution || [],
      topPerformers: examResultFacet.topPerformers || [],
      strugglingStudents: examResultFacet.strugglingStudents || [],
      feeCollection: feeStats,
    },
    faculty: {
      totalFaculty,
      facultyStudentRatio: `1 : ${facultyStudentRatio}`,
      markEntriesStatus: recentMarkEntriesAgg,
    },
    requiresAttention: {
      lowAttendanceStudents: lowAttendanceStudentsAgg,
      failingStudents: examResultFacet.strugglingStudents || [],
      unmarkedClasses,
      pendingResultsExams: completedExams.map((e) => ({
        examId: e._id,
        title: e.title || e.name,
        code: e.code,
        endDate: e.endDate,
        status: e.status,
      })),
    },
    availableFilters: {
      classes: classesList,
      academicYears: academicYearsList,
    },
  };
};

/**
 * -------------------------------------------------------------
 * 2. FACULTY ANALYTICS SERVICE
 * -------------------------------------------------------------
 */
const getFacultyAnalytics = async (facultyUserId, filters = {}) => {
  const facultyProfileId = await academicAuthService.resolveFacultyProfileId(facultyUserId);
  if (!facultyProfileId) {
    const error = new Error("Faculty profile not found for authenticated user");
    error.statusCode = 404;
    throw error;
  }

  const facultyProfile = await FacultyProfile.findById(facultyProfileId)
    .populate("assignedClasses", "name code department")
    .populate("assignedSubjects", "name subjectName code subjectCode")
    .lean();

  if (!facultyProfile) {
    const error = new Error("Faculty profile record not found");
    error.statusCode = 404;
    throw error;
  }

  // Find assignments from FacultyAssignment model
  const activeAssignments = await FacultyAssignment.find({
    facultyId: facultyProfileId,
    status: "ACTIVE",
  })
    .populate("classId", "name code department")
    .populate("subjectId", "name subjectName code subjectCode")
    .lean();

  // Aggregate assigned class IDs & subject IDs
  const assignedClassIdSet = new Set();
  const assignedSubjectIdSet = new Set();
  const classesMap = new Map();
  const subjectsMap = new Map();

  for (const a of activeAssignments) {
    if (a.classId) {
      const cId = a.classId._id.toString();
      assignedClassIdSet.add(cId);
      classesMap.set(cId, a.classId);
    }
    if (a.subjectId) {
      const sId = a.subjectId._id.toString();
      assignedSubjectIdSet.add(sId);
      subjectsMap.set(sId, a.subjectId);
    }
  }

  // Backward compatibility with profile fields
  if (facultyProfile.assignedClasses) {
    for (const c of facultyProfile.assignedClasses) {
      const cId = c._id.toString();
      assignedClassIdSet.add(cId);
      classesMap.set(cId, c);
    }
  }
  if (facultyProfile.assignedSubjects) {
    for (const s of facultyProfile.assignedSubjects) {
      const sId = s._id.toString();
      assignedSubjectIdSet.add(sId);
      subjectsMap.set(sId, s);
    }
  }

  const assignedClassObjectIds = Array.from(assignedClassIdSet).map(
    (id) => new mongoose.Types.ObjectId(id)
  );
  const assignedSubjectObjectIds = Array.from(assignedSubjectIdSet).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  // Scoped student cohort
  const assignedStudents = await StudentProfile.find({
    classId: { $in: assignedClassObjectIds },
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code")
    .select("_id nameEnglish registrationNumber classId admissionYear photo")
    .lean();

  const assignedStudentObjectIds = assignedStudents.map((s) => s._id);

  // Filter attendance records to faculty's classes & subjects
  const attendanceMatch = {
    classId: { $in: assignedClassObjectIds },
  };

  const [
    attendanceSummaryAgg,
    classWiseAttendanceAgg,
    attendanceMonthlyAgg,
    studentAttendanceBreakdown,
    schedulesForFaculty,
    markEntriesAgg,
  ] = await Promise.all([
    // Attendance overall in faculty classes
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        },
      },
    ]),

    // Class-wise attendance
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: "$classId",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        },
      },
    ]),

    // Monthly attendance trend
    AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: 1 },
          attended: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),

    // Per student attendance to identify low attendance (<75%)
    AttendanceRecord.aggregate([
      { $match: { studentId: { $in: assignedStudentObjectIds } } },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          attended: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
        },
      },
      {
        $project: {
          studentId: "$_id",
          total: 1,
          attended: 1,
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$attended", "$total"] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]),

    // Exam schedules for faculty classes and subjects
    ExamSchedule.find({
      classId: { $in: assignedClassObjectIds },
      ...(assignedSubjectObjectIds.length > 0 ? { subjectId: { $in: assignedSubjectObjectIds } } : {}),
    })
      .populate("examId", "title code startDate status")
      .populate("classId", "name code")
      .populate("subjectId", "name subjectName code subjectCode")
      .lean(),

    // Mark entries for faculty subjects
    MarkEntry.aggregate([
      {
        $match: {
          classId: { $in: assignedClassObjectIds },
          ...(assignedSubjectObjectIds.length > 0 ? { subjectId: { $in: assignedSubjectObjectIds } } : {}),
        },
      },
      {
        $group: {
          _id: {
            subjectId: "$subjectId",
            status: "$status",
          },
          count: { $sum: 1 },
          avgMarks: { $avg: "$marksObtained" },
        },
      },
    ]),
  ]);

  // Overall attendance calculation
  const attTotal = attendanceSummaryAgg[0] || { total: 0, present: 0, late: 0, absent: 0 };
  const attendedCount = attTotal.present + attTotal.late;
  const facultyAvgAttendance = attTotal.total > 0
    ? Number(((attendedCount / attTotal.total) * 100).toFixed(1))
    : 0;

  // Student low attendance lookup
  const studentAttMap = new Map(
    studentAttendanceBreakdown.map((s) => [s.studentId.toString(), s])
  );

  const atRiskStudents = [];
  for (const student of assignedStudents) {
    const att = studentAttMap.get(student._id.toString());
    const pct = att ? att.percentage : 100; // If no records yet, not necessarily marked absent
    if (att && att.total > 0 && att.percentage < 75) {
      atRiskStudents.push({
        studentId: student._id,
        name: student.nameEnglish,
        registrationNumber: student.registrationNumber,
        className: student.classId?.name || "Class",
        attendancePercentage: att.percentage,
        totalSessions: att.total,
        attendedSessions: att.attended,
      });
    }
  }

  // Class by class attendance list
  const classWiseList = Array.from(classesMap.values()).map((c) => {
    const classIdStr = c._id.toString();
    const stat = classWiseAttendanceAgg.find((s) => s._id && s._id.toString() === classIdStr);
    const total = stat ? stat.total : 0;
    const attended = stat ? stat.present + stat.late : 0;
    const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 0;
    const studentCount = assignedStudents.filter(
      (s) => s.classId && s.classId._id.toString() === classIdStr
    ).length;

    return {
      classId: c._id,
      className: c.name,
      classCode: c.code,
      department: c.department || "General",
      studentCount,
      attendancePercentage: pct,
      totalMarked: total,
    };
  });

  // Pending mark entry count
  const pendingMarksToSubmit = schedulesForFaculty.filter((s) => s.status === "SCHEDULED").length;

  return {
    kpis: {
      assignedClassesCount: assignedClassIdSet.size,
      assignedSubjectsCount: assignedSubjectIdSet.size,
      totalAssignedStudents: assignedStudents.length,
      myAverageAttendance: facultyAvgAttendance,
      pendingMarksToSubmit,
    },
    classes: classWiseList,
    attendanceTrend: attendanceMonthlyAgg.map((m) => ({
      month: m._id,
      percentage: m.total > 0 ? Number(((m.attended / m.total) * 100).toFixed(1)) : 0,
      total: m.total,
    })),
    assignedSubjects: Array.from(subjectsMap.values()).map((s) => ({
      subjectId: s._id,
      name: s.subjectName || s.name,
      code: s.subjectCode || s.code,
    })),
    requiresAttention: {
      lowAttendanceStudents: atRiskStudents.sort((a, b) => a.attendancePercentage - b.attendancePercentage),
      upcomingSchedules: schedulesForFaculty.slice(0, 5),
    },
  };
};

/**
 * -------------------------------------------------------------
 * 3. STUDENT ANALYTICS SERVICE
 * -------------------------------------------------------------
 */
const getStudentAnalytics = async (studentUserId) => {
  const student = await StudentProfile.findOne({
    userId: studentUserId,
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code department")
    .populate("academicYearId", "yearCode name")
    .lean();

  if (!student) {
    const error = new Error("Student profile record not found");
    error.statusCode = 404;
    throw error;
  }

  const studentId = student._id;
  const classId = student.classId?._id || student.classId;

  // Query student attendance, exam results, registrations, and upcoming exams in parallel
  const [
    attendanceRecords,
    subjectAttendanceAgg,
    monthlyAttendanceAgg,
    examResults,
    examRegistrations,
    upcomingExams,
  ] = await Promise.all([
    // All attendance records for this student
    AttendanceRecord.find({ studentId }).sort({ date: -1 }).lean(),

    // Attendance grouped by subject
    AttendanceRecord.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: "$subjectId",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subjectDoc",
        },
      },
      { $unwind: { path: "$subjectDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          subjectId: "$_id",
          subjectName: { $ifNull: ["$subjectDoc.subjectName", { $ifNull: ["$subjectDoc.name", "General"] }] },
          subjectCode: { $ifNull: ["$subjectDoc.subjectCode", { $ifNull: ["$subjectDoc.code", ""] }] },
          total: 1,
          present: 1,
          late: 1,
          absent: 1,
          leave: 1,
          attended: { $add: ["$present", "$late"] },
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: [{ $add: ["$present", "$late"] }, "$total"] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { subjectName: 1 } },
    ]),

    // Monthly attendance
    AttendanceRecord.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),

    // Exam Results for student
    ExamResult.find({ studentId })
      .populate("examId", "title code startDate term examType resultPublicationDate status")
      .sort({ createdAt: -1 })
      .lean(),

    // Registrations
    ExamRegistration.find({ studentId })
      .populate("examId", "title code fee examFee startDate endDate")
      .populate("paymentId", "amount status transactionId")
      .lean(),

    // Upcoming exams where student's class is eligible
    Exam.find({
      status: { $in: ["SCHEDULED", "PUBLISHED"] },
      ...(classId ? { eligibleClassIds: classId } : {}),
      startDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select("title code startDate endDate fee examFee registrationStartDate registrationEndDate")
      .lean(),
  ]);

  // Overall attendance calculations
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "LATE").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "ABSENT").length;
  const leaveCount = attendanceRecords.filter((r) => ["LEAVE", "EXCUSED"].includes(r.status)).length;
  const attendedCount = presentCount + lateCount;
  const overallAttendancePct = totalRecords > 0
    ? Number(((attendedCount / totalRecords) * 100).toFixed(1))
    : 100;

  // Academic Results summary (respecting resultPublicationDate)
  let totalMarksScored = 0;
  let totalMaxPossible = 0;
  let totalPassedSubjects = 0;
  let totalFailedSubjects = 0;

  const now = new Date();
  const publishedExamResults = (examResults || []).filter((res) => {
    const ex = res.examId;
    if (!ex) return false;
    if (ex.resultPublicationDate) {
      return now.getTime() >= new Date(ex.resultPublicationDate).getTime();
    }
    return true;
  });

  const examPerformanceList = publishedExamResults.map((res) => {
    totalMarksScored += res.totalMarksObtained || 0;
    totalMaxPossible += res.totalMaxMarks || 0;

    if (res.subjectResults) {
      for (const s of res.subjectResults) {
        if (s.resultStatus === "PASSED") totalPassedSubjects += 1;
        else totalFailedSubjects += 1;
      }
    }

    return {
      examId: res.examId?._id,
      examTitle: res.examId?.title || "Examination",
      examCode: res.examId?.code || "",
      percentage: res.percentage,
      grade: res.grade,
      resultStatus: res.resultStatus,
      totalMarksObtained: res.totalMarksObtained,
      totalMaxMarks: res.totalMaxMarks,
      subjects: res.subjectResults || [],
    };
  });

  const cumulativePercentage = totalMaxPossible > 0
    ? Number(((totalMarksScored / totalMaxPossible) * 100).toFixed(1))
    : (publishedExamResults.length > 0 ? publishedExamResults[0].percentage : 0);

  // Status badges
  const attendanceStatus = overallAttendancePct >= 75 ? "GOOD_STANDING" : "CRITICAL_ATTENDANCE_ALERT";

  return {
    studentProfile: {
      studentId: student._id,
      name: student.nameEnglish,
      registrationNumber: student.registrationNumber,
      className: student.classId?.name || "Class",
      classCode: student.classId?.code || "N/A",
      academicYear: student.academicYearId?.yearCode || "Current Year",
      house: student.house || "GENERAL",
    },
    attendance: {
      percentage: overallAttendancePct,
      status: attendanceStatus,
      isAtRisk: overallAttendancePct < 75,
      totalRecorded: totalRecords,
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      bySubject: subjectAttendanceAgg,
      monthlyTrend: monthlyAttendanceAgg.map((m) => ({
        month: m._id,
        total: m.total,
        percentage: m.total > 0 ? Number(((m.present / m.total) * 100).toFixed(1)) : 0,
      })),
    },
    academics: {
      cumulativePercentage,
      totalExamsTaken: examResults.length,
      passedSubjectsCount: totalPassedSubjects,
      failedSubjectsCount: totalFailedSubjects,
      examHistory: examPerformanceList,
    },
    actionable: {
      upcomingExams: upcomingExams.map((e) => {
        const reg = examRegistrations.find(
          (r) => r.examId && r.examId._id.toString() === e._id.toString()
        );
        return {
          examId: e._id,
          title: e.title,
          code: e.code,
          startDate: e.startDate,
          endDate: e.endDate,
          fee: e.fee || e.examFee || 0,
          isRegistered: Boolean(reg),
          rollNumber: reg?.rollNumber || null,
          hallTicketStatus: reg?.registrationStatus || "NOT_REGISTERED",
          paymentStatus: reg?.paymentId?.status || "UNPAID",
        };
      }),
      pendingPayments: examRegistrations
        .filter((r) => !r.paymentId || r.paymentId.status !== "SUCCESS")
        .map((r) => ({
          registrationId: r._id,
          examTitle: r.examId?.title || "Examination",
          rollNumber: r.rollNumber,
          fee: r.examId?.fee || r.examId?.examFee || 0,
        })),
    },
  };
};

/**
 * -------------------------------------------------------------
 * 4. PARENT ANALYTICS SERVICE
 * -------------------------------------------------------------
 */
const getParentAnalytics = async (parentUserId, requestedStudentId = null) => {
  const parent = await ParentProfile.findOne({
    userId: parentUserId,
    isDeleted: { $ne: true },
  })
    .populate({
      path: "studentIds",
      select: "nameEnglish registrationNumber classId admissionYear photo status house",
      populate: { path: "classId", select: "name code" },
    })
    .lean();

  if (!parent) {
    const error = new Error("Parent profile record not found");
    error.statusCode = 404;
    throw error;
  }

  const linkedChildren = parent.studentIds || [];
  if (linkedChildren.length === 0) {
    return {
      parentName: parent.name,
      children: [],
      selectedChild: null,
      message: "No student profiles linked to this parent guardian",
    };
  }

  // Resolve target child
  let selectedChild = linkedChildren[0];
  if (requestedStudentId && mongoose.Types.ObjectId.isValid(requestedStudentId)) {
    const found = linkedChildren.find((c) => c._id.toString() === requestedStudentId.toString());
    if (found) {
      selectedChild = found;
    }
  }

  const childStudentId = selectedChild._id;

  // Retrieve child's attendance and academic data
  const [attendanceRecords, subjectAttendanceAgg, examResults, examRegistrations] =
    await Promise.all([
      AttendanceRecord.find({ studentId: childStudentId }).sort({ date: -1 }).lean(),

      AttendanceRecord.aggregate([
        { $match: { studentId: new mongoose.Types.ObjectId(childStudentId) } },
        {
          $group: {
            _id: "$subjectId",
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "_id",
            as: "subjectDoc",
          },
        },
        { $unwind: { path: "$subjectDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            subjectName: { $ifNull: ["$subjectDoc.subjectName", { $ifNull: ["$subjectDoc.name", "Subject"] }] },
            total: 1,
            present: 1,
            late: 1,
            absent: 1,
            percentage: {
              $cond: [
                { $gt: ["$total", 0] },
                { $round: [{ $multiply: [{ $divide: [{ $add: ["$present", "$late"] }, "$total"] }, 100] }, 1] },
                0,
              ],
            },
          },
        },
      ]),

      ExamResult.find({ studentId: childStudentId })
        .populate("examId", "title code startDate resultPublicationDate status")
        .sort({ createdAt: -1 })
        .lean(),

      ExamRegistration.find({ studentId: childStudentId })
        .populate("examId", "title code fee examFee startDate")
        .populate("paymentId", "amount status")
        .lean(),
    ]);

  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "LATE").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "ABSENT").length;
  const leaveCount = attendanceRecords.filter((r) => ["LEAVE", "EXCUSED"].includes(r.status)).length;
  const attendedCount = presentCount + lateCount;
  const overallAttendancePct = totalRecords > 0
    ? Number(((attendedCount / totalRecords) * 100).toFixed(1))
    : 100;

  return {
    parentName: parent.name,
    children: linkedChildren.map((c) => ({
      _id: c._id,
      nameEnglish: c.nameEnglish,
      registrationNumber: c.registrationNumber,
      className: c.classId?.name || "Class",
    })),
    selectedChild: {
      _id: selectedChild._id,
      nameEnglish: selectedChild.nameEnglish,
      registrationNumber: selectedChild.registrationNumber,
      className: selectedChild.classId?.name || "Class",
      classCode: selectedChild.classId?.code || "N/A",
      house: selectedChild.house || "GENERAL",
      attendance: {
        percentage: overallAttendancePct,
        isAtRisk: overallAttendancePct < 75,
        totalSessions: totalRecords,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        leave: leaveCount,
        subjectBreakdown: subjectAttendanceAgg,
      },
      academics: {
        examResults: (examResults || [])
          .filter((r) => {
            const ex = r.examId;
            if (!ex) return false;
            if (ex.resultPublicationDate) {
              return new Date().getTime() >= new Date(ex.resultPublicationDate).getTime();
            }
            return true;
          })
          .map((r) => ({
            examTitle: r.examId?.title || "Examination",
            percentage: r.percentage,
            grade: r.grade,
            resultStatus: r.resultStatus,
            subjectResults: r.subjectResults || [],
          })),
        examRegistrations: examRegistrations.map((reg) => ({
          examTitle: reg.examId?.title || "Examination",
          rollNumber: reg.rollNumber,
          hallTicketStatus: reg.registrationStatus,
          paymentStatus: reg.paymentId?.status || "UNPAID",
          fee: reg.examId?.fee || reg.examId?.examFee || 0,
        })),
      },
      alerts: {
        lowAttendance: overallAttendancePct < 75,
        unpaidFees: examRegistrations.some(
          (reg) => !reg.paymentId || reg.paymentId.status !== "SUCCESS"
        ),
      },
    },
  };
};

/**
 * -------------------------------------------------------------
 * 5. EXPORT REPORT SERVICE (CSV / Tabular Data)
 * -------------------------------------------------------------
 */
const getExportReport = async (reportType, filters = {}, requestingUser) => {
  const { classId, academicYearId } = filters;

  if (reportType === "STUDENT_ATTENDANCE") {
    const studentMatch = { isDeleted: { $ne: true } };
    if (classId) studentMatch.classId = new mongoose.Types.ObjectId(classId);
    if (academicYearId) studentMatch.academicYearId = new mongoose.Types.ObjectId(academicYearId);

    const students = await StudentProfile.find(studentMatch)
      .populate("classId", "name code")
      .populate("academicYearId", "yearCode name")
      .sort({ registrationNumber: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    const attendanceAgg = await AttendanceRecord.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
        },
      },
    ]);

    const attMap = new Map(attendanceAgg.map((a) => [a._id.toString(), a]));

    const columns = [
      { key: "registrationNumber", label: "Roll / Reg Number" },
      { key: "name", label: "Student Name" },
      { key: "className", label: "Class" },
      { key: "totalSessions", label: "Total Sessions" },
      { key: "present", label: "Present" },
      { key: "late", label: "Late" },
      { key: "absent", label: "Absent" },
      { key: "percentage", label: "Attendance %" },
      { key: "status", label: "Standing Status" },
    ];

    const rows = students.map((s) => {
      const att = attMap.get(s._id.toString()) || { total: 0, present: 0, late: 0, absent: 0, leave: 0 };
      const attended = att.present + att.late;
      const pct = att.total > 0 ? Number(((attended / att.total) * 100).toFixed(1)) : 100;
      return {
        registrationNumber: s.registrationNumber,
        name: s.nameEnglish,
        className: s.classId?.name || "Class",
        totalSessions: att.total,
        present: att.present,
        late: att.late,
        absent: att.absent,
        percentage: `${pct}%`,
        status: pct >= 75 ? "Good" : "At Risk (<75%)",
      };
    });

    return { title: "Student Attendance Report", columns, rows };
  }

  if (reportType === "EXAM_REGISTRATIONS") {
    const regs = await ExamRegistration.find()
      .populate("examId", "title code fee examFee")
      .populate("studentId", "nameEnglish registrationNumber classId")
      .populate("paymentId", "status amount")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { key: "rollNumber", label: "Exam Roll Number" },
      { key: "studentName", label: "Student Name" },
      { key: "regNo", label: "Reg Number" },
      { key: "examTitle", label: "Examination" },
      { key: "registrationStatus", label: "Status" },
      { key: "paymentStatus", label: "Fee Status" },
      { key: "amount", label: "Fee (INR)" },
    ];

    const rows = regs.map((r) => ({
      rollNumber: r.rollNumber,
      studentName: r.studentId?.nameEnglish || "Student",
      regNo: r.studentId?.registrationNumber || "N/A",
      examTitle: r.examId?.title || "Exam",
      registrationStatus: r.registrationStatus,
      paymentStatus: r.paymentId?.status || "UNPAID",
      amount: r.examId?.fee || r.examId?.examFee || 0,
    }));

    return { title: "Exam Registration & Fee Report", columns, rows };
  }

  // Default fallback: Student Directory summary
  const students = await StudentProfile.find({ isDeleted: { $ne: true } })
    .populate("classId", "name code")
    .select("registrationNumber nameEnglish classId status house admissionYear")
    .lean();

  const columns = [
    { key: "registrationNumber", label: "Registration No" },
    { key: "nameEnglish", label: "Name" },
    { key: "className", label: "Class" },
    { key: "status", label: "Status" },
    { key: "house", label: "House" },
    { key: "admissionYear", label: "Admission Year" },
  ];

  const rows = students.map((s) => ({
    registrationNumber: s.registrationNumber,
    nameEnglish: s.nameEnglish,
    className: s.classId?.name || "Class",
    status: s.status,
    house: s.house || "N/A",
    admissionYear: s.admissionYear || "N/A",
  }));

  return { title: "Student Roster Report", columns, rows };
};

module.exports = {
  getAdminAnalytics,
  getFacultyAnalytics,
  getStudentAnalytics,
  getParentAnalytics,
  getExportReport,
};
