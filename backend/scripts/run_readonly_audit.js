const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function runReadOnlyAudit() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/misc";
  console.log("Connecting read-only to MongoDB:", uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const report = {
    collections: {},
    users: [],
    students: [],
    parents: [],
    faculty: [],
    institutions: [],
    academicYears: [],
    classes: [],
    subjects: [],
    facultyAssignments: [],
    timetables: [],
    exams: [],
    examSchedules: [],
    examRegistrations: [],
    leaves: [],
    attendanceRecords: [],
    payments: [],
    syllabuses: [],
    campuses: [],
    instituteSettings: [],
    notifications: [],
    emailevents: [],
    enquiries: [],
    issues: []
  };

  for (const c of collections) {
    const collName = c.name;
    if (collName.startsWith("system.")) continue;
    const coll = db.collection(collName);
    const count = await coll.countDocuments();
    const indexes = await coll.indexes();
    report.collections[collName] = {
      count,
      indexes: indexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique }))
    };
  }

  // Fetch all collections
  const users = await db.collection("users").find({}).toArray();
  const studentProfiles = await db.collection("studentProfiles").find({}).toArray();
  const parentProfiles = await db.collection("parentProfiles").find({}).toArray();
  const facultyProfiles = await db.collection("facultyProfiles").find({}).toArray();
  const institutionProfiles = await db.collection("institutionProfiles").find({}).toArray();
  const academicYears = await db.collection("academicYears").find({}).toArray();
  const classes = await db.collection("classes").find({}).toArray();
  const subjects = await db.collection("subjects").find({}).toArray();
  const facultyAssignments = await db.collection("facultyAssignments").find({}).toArray();
  const timetables = await db.collection("timetables").find({}).toArray();
  const exams = await db.collection("exams").find({}).toArray();
  const examSchedules = await db.collection("examSchedules").find({}).toArray();
  const examRegistrations = await db.collection("examRegistrations").find({}).toArray();
  const leaves = await db.collection("leaves").find({}).toArray();
  const attendanceRecords = await db.collection("attendanceRecords").find({}).toArray();
  const payments = await db.collection("payments").find({}).toArray();
  const syllabuses = await db.collection("syllabuses").find({}).toArray();
  const campuses = await db.collection("campuses").find({}).toArray();
  const instituteSettings = await db.collection("instituteSettings").find({}).toArray();
  const notifications = await db.collection("notifications").find({}).toArray();
  const emailevents = await db.collection("emailevents").find({}).toArray();
  const enquiries = await db.collection("enquiries").find({}).toArray();

  report.users = users.map(u => ({
    _id: u._id.toString(),
    username: u.username,
    email: u.email,
    role: u.role,
    status: u.status,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt
  }));

  report.students = studentProfiles.map(s => ({
    _id: s._id.toString(),
    userId: s.userId?.toString(),
    registrationNumber: s.registrationNumber,
    nameEnglish: s.nameEnglish,
    admissionYear: s.admissionYear,
    classId: s.classId?.toString(),
    institutionId: s.institutionId?.toString(),
    status: s.status,
    contactNumber: s.contactNumber,
    createdAt: s.createdAt
  }));

  report.parents = parentProfiles.map(p => ({
    _id: p._id.toString(),
    userId: p.userId?.toString(),
    fullName: p.fullName || p.name,
    parentEmail: p.parentEmail || p.email,
    mobile: p.mobile,
    children: (p.children || p.students || []).map(c => c?.toString ? c.toString() : c),
    studentId: p.studentId?.toString(),
    status: p.status,
    createdAt: p.createdAt
  }));

  report.faculty = facultyProfiles.map(f => ({
    _id: f._id.toString(),
    userId: f.userId?.toString(),
    facultyId: f.facultyId,
    nameEnglish: f.nameEnglish,
    designation: f.designation,
    institutionId: f.institutionId?.toString(),
    assignedClasses: (f.assignedClasses || []).map(c => c?.toString ? c.toString() : c),
    assignedSubjects: (f.assignedSubjects || []).map(s => s?.toString ? s.toString() : s),
    createdAt: f.createdAt
  }));

  report.institutions = institutionProfiles.map(i => ({
    _id: i._id.toString(),
    userId: i.userId?.toString(),
    institutionCode: i.institutionCode,
    institutionName: i.institutionName,
    type: i.type,
    email: i.email,
    contactNumber: i.contactNumber,
    status: i.status,
    createdAt: i.createdAt
  }));

  report.academicYears = academicYears.map(a => ({
    _id: a._id.toString(),
    yearCode: a.yearCode,
    yearName: a.yearName,
    startDate: a.startDate,
    endDate: a.endDate,
    isCurrent: a.isCurrent,
    status: a.status
  }));

  report.classes = classes.map(c => ({
    _id: c._id.toString(),
    code: c.code || c.classCode,
    className: c.className,
    academicYearId: c.academicYearId?.toString(),
    institutionId: c.institutionId?.toString(),
    workingDays: c.workingDays,
    status: c.status
  }));

  report.subjects = subjects.map(s => ({
    _id: s._id.toString(),
    subjectCode: s.subjectCode,
    subjectName: s.subjectName,
    category: s.category,
    status: s.status
  }));

  report.facultyAssignments = facultyAssignments.map(fa => ({
    _id: fa._id.toString(),
    facultyId: fa.facultyId?.toString(),
    classId: fa.classId?.toString(),
    subjectId: fa.subjectId?.toString(),
    academicYearId: fa.academicYearId?.toString()
  }));

  report.timetables = timetables.map(t => ({
    _id: t._id.toString(),
    dayOfWeek: t.dayOfWeek,
    classId: t.classId?.toString(),
    academicYearId: t.academicYearId?.toString(),
    periods: t.periods || []
  }));

  report.exams = exams.map(e => ({
    _id: e._id.toString(),
    examCode: e.examCode,
    examName: e.examName,
    academicYearId: e.academicYearId?.toString(),
    status: e.status
  }));

  report.examSchedules = examSchedules.map(es => ({
    _id: es._id.toString(),
    examId: es.examId?.toString(),
    classId: es.classId?.toString(),
    subjectId: es.subjectId?.toString(),
    examDate: es.examDate,
    startTime: es.startTime,
    endTime: es.endTime
  }));

  report.examRegistrations = examRegistrations.map(er => ({
    _id: er._id.toString(),
    studentId: er.studentId?.toString(),
    examId: er.examId?.toString(),
    registrationNumber: er.registrationNumber,
    status: er.status
  }));

  report.leaves = leaves.map(l => ({
    _id: l._id.toString(),
    studentId: l.studentId?.toString(),
    appliedBy: l.appliedBy?.toString(),
    applicantRole: l.applicantRole,
    leaveType: l.leaveType,
    status: l.status,
    dateRange: l.dateRange,
    reviewedBy: l.reviewedBy?.toString(),
    reviewedAt: l.reviewedAt,
    reason: l.reason
  }));

  report.attendanceRecords = attendanceRecords.map(a => ({
    _id: a._id.toString(),
    date: a.date,
    classId: a.classId?.toString(),
    recordsCount: Array.isArray(a.records) ? a.records.length : 0,
    academicYearId: a.academicYearId?.toString()
  }));

  report.payments = payments.map(p => ({
    _id: p._id.toString(),
    studentId: p.studentId?.toString(),
    amount: p.amount,
    currency: p.currency,
    status: p.status || p.paymentStatus,
    paymentMethod: p.paymentMethod,
    purpose: p.purpose || p.paymentType,
    createdAt: p.createdAt
  }));

  report.syllabuses = syllabuses.map(s => ({
    _id: s._id.toString(),
    classId: s.classId?.toString(),
    subjectId: s.subjectId?.toString(),
    academicYearId: s.academicYearId?.toString(),
    status: s.status
  }));

  report.notifications = notifications.map(n => ({
    _id: n._id.toString(),
    userId: n.userId?.toString(),
    title: n.title,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt
  }));

  report.emailevents = emailevents.map(e => ({
    _id: e._id.toString(),
    recipientEmail: e.recipientEmail || e.recipient,
    eventType: e.eventType,
    subject: e.subject,
    status: e.status,
    createdAt: e.createdAt
  }));

  const outPath = path.resolve(__dirname, "audit_output.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log("Audit complete. Written to:", outPath);

  await mongoose.disconnect();
}

runReadOnlyAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
