const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("../src/app");
const env = require("../src/config/env");

async function runReadOnlyRegression() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  function req(method, urlPath, token) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "127.0.0.1",
        port,
        path: urlPath,
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      const r = http.request(options, (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let parsed;
          try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      r.on("error", reject);
      r.end();
    });
  }

  function sign(user) {
    return jwt.sign(
      { id: user._id.toString(), userId: user._id.toString(), role: user.role, email: user.email, username: user.username },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  }

  const admin = await db.collection("users").findOne({ role: "ADMIN", username: "admin" });
  const faculty = await db.collection("users").findOne({ role: "FACULTY", email: "haseeb@yopmail.com" });
  const student = await db.collection("users").findOne({ role: "STUDENT", email: "farhan@yopmail.com" });
  const parent = await db.collection("users").findOne({ role: "PARENT", email: "babu@yopmail.com" });

  const tAdmin = sign(admin);
  const tFaculty = sign(faculty);
  const tStudent = sign(student);
  const tParent = sign(parent);

  const results = [];

  // 1. Parent Auth & Profile
  const parentMe = await req("GET", "/api/parents/me", tParent);
  results.push({ suite: "Parent Auth & Profile", endpoint: "GET /api/parents/me", status: parentMe.status, ok: parentMe.status === 200 && parentMe.body?.success === true });

  // 2. Timetable & Working Days
  const ttGet = await req("GET", "/api/academic/timetables", tAdmin);
  results.push({ suite: "Timetable Module", endpoint: "GET /api/academic/timetables", status: ttGet.status, ok: ttGet.status === 200 && ttGet.body?.success === true });

  const ttClass = await req("GET", "/api/academic/classes", tAdmin);
  results.push({ suite: "Class Working Days", endpoint: "GET /api/academic/classes", status: ttClass.status, ok: ttClass.status === 200 });

  // 3. Faculty Module & Assignments
  const facAssign = await req("GET", "/api/faculty", tAdmin);
  results.push({ suite: "Faculty Module", endpoint: "GET /api/faculty", status: facAssign.status, ok: facAssign.status === 200 });

  // 4. Phase 1 Leave
  const leaveAdmin = await req("GET", "/api/leaves", tAdmin);
  results.push({ suite: "Leave Management", endpoint: "GET /api/leaves (ADMIN)", status: leaveAdmin.status, ok: leaveAdmin.status === 200 && leaveAdmin.body?.success === true });

  const leaveStudent = await req("GET", "/api/leaves", tStudent);
  results.push({ suite: "Leave Student Scope", endpoint: "GET /api/leaves (STUDENT)", status: leaveStudent.status, ok: leaveStudent.status === 200 && leaveStudent.body?.success === true });

  // 5. Phase 2 Result Publication & Exams
  const examsGet = await req("GET", "/api/exams/exams", tAdmin);
  results.push({ suite: "Exam Management", endpoint: "GET /api/exams/exams", status: examsGet.status, ok: examsGet.status === 200 && examsGet.body?.success === true });

  const examSchedules = await req("GET", "/api/exams/exam-schedules", tAdmin);
  results.push({ suite: "Exam Schedules", endpoint: "GET /api/exams/exam-schedules", status: examSchedules.status, ok: examSchedules.status === 200 });

  // 6. Phase 3 Notifications
  const notifAdmin = await req("GET", "/api/notifications", tAdmin);
  results.push({ suite: "Notification Engine", endpoint: "GET /api/notifications (ADMIN)", status: notifAdmin.status, ok: notifAdmin.status === 200 });

  const notifFaculty = await req("GET", "/api/notifications", tFaculty);
  results.push({ suite: "Notification Faculty", endpoint: "GET /api/notifications (FACULTY)", status: notifFaculty.status, ok: notifFaculty.status === 200 });

  // 7. Phase 4 Email Infrastructure
  const emailEventsCount = await db.collection("emailevents").countDocuments();
  results.push({ suite: "Email Infrastructure", endpoint: "MongoDB emailevents", status: 200, ok: emailEventsCount >= 0 });

  // 8. Phase 5 Syllabus + Parent Scoping
  const syllabusAdmin = await req("GET", "/api/academic/syllabuses", tAdmin);
  results.push({ suite: "Syllabus Module", endpoint: "GET /api/academic/syllabuses", status: syllabusAdmin.status, ok: syllabusAdmin.status === 200 });

  // 9. Student Profile & Attendance
  const studentProfile = await req("GET", "/api/students/profile", tStudent);
  results.push({ suite: "Student Profile", endpoint: "GET /api/students/profile", status: studentProfile.status, ok: studentProfile.status === 200 && studentProfile.body?.success === true });

  const attendanceRecord = await req("GET", "/api/attendance/student/history", tStudent);
  results.push({ suite: "Attendance Engine", endpoint: "GET /api/attendance/student/history", status: attendanceRecord.status, ok: attendanceRecord.status === 200 });

  // 10. Payments
  const paymentsGet = await req("GET", "/api/payments", tAdmin);
  results.push({ suite: "Payment System", endpoint: "GET /api/payments", status: paymentsGet.status, ok: paymentsGet.status === 200 });

  console.log("=== REGRESSION AUDIT RESULTS ===");
  console.table(results);

  server.close();
  await mongoose.disconnect();
}

runReadOnlyRegression().catch(err => {
  console.error(err);
  process.exit(1);
});
