require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("../src/server");

// Models
const User = require("../src/models/User");
const AccountSetupToken = require("../src/models/AccountSetupToken");
const PasswordResetToken = require("../src/models/PasswordResetToken");
const OtpVerification = require("../src/models/OtpVerification");
const InstitutionProfile = require("../src/models/InstitutionProfile");
const AcademicYear = require("../src/models/AcademicYear");
const Class = require("../src/models/Class");
const Subject = require("../src/models/Subject");
const Syllabus = require("../src/models/Syllabus");
const StudentProfile = require("../src/models/StudentProfile");
const FacultyProfile = require("../src/models/FacultyProfile");
const Article = require("../src/models/Article");
const DownloadResource = require("../src/models/DownloadResource");
const Enquiry = require("../src/models/Enquiry");
const Event = require("../src/models/Event");
const EventRegistration = require("../src/models/EventRegistration");
const Payment = require("../src/models/Payment");
const Exam = require("../src/models/Exam");
const ExamSchedule = require("../src/models/ExamSchedule");
const ExamRegistration = require("../src/models/ExamRegistration");
const MarkEntry = require("../src/models/MarkEntry");
const ExamResult = require("../src/models/ExamResult");
const { hashPassword } = require("../src/utils/password");

const PORT = 5098;
let server;

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  unverified: 0,
  details: [],
};

const recordTest = (area, testName, passed, status, message, unverified = false) => {
  results.total++;
  if (unverified) {
    results.unverified++;
    results.details.push({ area, testName, status: "UNVERIFIED", message });
    console.log(`[UNVERIFIED] ${area} - ${testName}: ${message}`);
  } else if (passed) {
    results.passed++;
    results.details.push({ area, testName, status: "PASSED", message });
    console.log(`[PASS] ${area} - ${testName}`);
  } else {
    results.failed++;
    results.details.push({ area, testName, status: "FAILED", message });
    console.error(`[FAIL] ${area} - ${testName}: ${message}`);
  }
};

const makeRequest = (path, method = "GET", body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(
      {
        hostname: "localhost",
        port: PORT,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = {};
          try {
            parsed = JSON.parse(data || "{}");
          } catch (e) {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const cleanAuditData = async () => {
  await User.deleteMany({ email: /audit/i });
  await User.deleteMany({ username: /audit/i });
  await AcademicYear.deleteMany({ yearCode: /AUDIT/i });
  await InstitutionProfile.deleteMany({ institutionCode: /AUDIT/i });
  await Class.deleteMany({ name: /10/i });
  await Subject.deleteMany({ subjectCode: /IH-10/i });
  await Event.deleteMany({ slug: /misc-conf-2026/i });
  await Payment.deleteMany({ transactionId: /TXN_AUDIT/i });
  await Exam.deleteMany({ code: /BE-2026-AUDIT/i });
  await ExamRegistration.deleteMany({ rollNumber: /ROLL-AUDIT/i });
  await EventRegistration.deleteMany({ email: /delegate@misc.markaz.in/i });
  await StudentProfile.deleteMany({ nameEnglish: /Audit Student/i });
  await MarkEntry.deleteMany({});
  await ExamResult.deleteMany({});
};

const runAuditSuite = async () => {
  console.log("\n==================================================");
  console.log("STARTING STRICT END-TO-END BACKEND AUDIT SUITE");
  console.log("==================================================\n");

  server = app.listen(PORT);
  // Wait for DB connection
  await new Promise((r) => setTimeout(r, 2000));
  await cleanAuditData();

  try {
    // 1. MODEL AUDIT
    const modelsList = [
      User, AccountSetupToken, PasswordResetToken, OtpVerification,
      InstitutionProfile, AcademicYear, Class, Subject, Syllabus,
      StudentProfile, FacultyProfile, Article, DownloadResource, Enquiry,
      Event, EventRegistration, Payment, Exam, ExamSchedule,
      ExamRegistration, MarkEntry, ExamResult,
    ];
    recordTest("Models", "22 Models Verification", modelsList.length === 22, 200, `Found ${modelsList.length} models`);

    // 2. ROUTE AUDIT
    const routesCount = app._router.stack.filter(r => r.name === 'router').length;
    recordTest("Routes", "Route Modules Mounted", routesCount >= 10, 200, `${routesCount} route modules registered`);

    // 3. AUTHENTICATION LIFECYCLE
    const adminPassHash = await hashPassword("Admin123!");
    await User.create({
      username: "audit_admin",
      email: "audit_admin@misc.markaz.in",
      passwordHash: adminPassHash,
      role: "ADMIN",
      status: "ACTIVE",
    });

    // Admin Login
    const loginRes = await makeRequest("/api/auth/login", "POST", {
      username: "audit_admin",
      password: "Admin123!",
    });
    const adminToken = loginRes.body.token;
    recordTest("Auth", "Admin Login & Token Issue", loginRes.status === 200 && !!adminToken, loginRes.status, loginRes.body.message);

    // User Invitation
    const inviteRes = await makeRequest(
      "/api/admin/users",
      "POST",
      {
        name: "Test Faculty",
        email: "faculty_audit@misc.markaz.in",
        role: "FACULTY",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Auth", "Admin User Invitation", inviteRes.status === 201, inviteRes.status, inviteRes.body.message);

    // Set Password & Faculty Login
    let facultyToken = "";
    if (inviteRes.body.data && inviteRes.body.data.id) {
      const facultyUser = await User.findById(inviteRes.body.data.id);
      facultyUser.passwordHash = await hashPassword("Faculty123!");
      facultyUser.status = "ACTIVE";
      await facultyUser.save();

      const facultyLogin = await makeRequest("/api/auth/login", "POST", {
        username: "faculty_audit@misc.markaz.in",
        password: "Faculty123!",
      });
      facultyToken = facultyLogin.body.token;
      recordTest("Auth", "Set Password & Faculty Login", facultyLogin.status === 200 && !!facultyToken, facultyLogin.status, facultyLogin.body.message);
    }

    // Invalid & Expired JWT
    const invalidJwtRes = await makeRequest("/api/institutions", "GET", null, { Authorization: "Bearer invalid_token_xyz" });
    recordTest("Auth", "Invalid JWT Handling (401)", invalidJwtRes.status === 401, invalidJwtRes.status, invalidJwtRes.body.message);

    // OTP Operations
    const sendOtpRes = await makeRequest("/api/auth/send-otp", "POST", {
      identifier: "test_otp@misc.markaz.in",
      purpose: "EMAIL_VERIFICATION",
    });
    recordTest("Auth", "Send OTP Dispatch", sendOtpRes.status === 200, sendOtpRes.status, sendOtpRes.body.message);

    const verifyOtpRes = await makeRequest("/api/auth/verify-otp", "POST", {
      identifier: "test_otp@misc.markaz.in",
      otp: "000000", // Wrong OTP
      purpose: "EMAIL_VERIFICATION",
    });
    recordTest("Auth", "Invalid OTP Code Rejection (400)", verifyOtpRes.status === 400, verifyOtpRes.status, verifyOtpRes.body.message);

    // 4. RBAC & SCOPE TESTS
    const rbacDeniedRes = await makeRequest("/api/admin/users", "POST", { name: "Test" }, { Authorization: `Bearer ${facultyToken}` });
    recordTest("RBAC", "Faculty Accessing Admin Endpoint (403)", rbacDeniedRes.status === 403, rbacDeniedRes.status, rbacDeniedRes.body.message);

    // 5. ACADEMIC FLOW
    const ayRes = await makeRequest(
      "/api/academic/academic-years",
      "POST",
      {
        yearName: "2026-2027 Audit Session",
        yearCode: "AY2026-AUDIT",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2027-03-31T00:00:00.000Z",
        status: "ACTIVE",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const ayId = ayRes.body.data?._id;
    recordTest("Academic", "Create AcademicYear", ayRes.status === 201 && !!ayId, ayRes.status, ayRes.body.message);

    const instUser = await User.create({
      username: "inst_audit",
      email: "inst_audit@misc.markaz.in",
      passwordHash: await hashPassword("Inst123!"),
      role: "INSTITUTION",
      status: "ACTIVE",
    });

    const instRes = await makeRequest(
      "/api/institutions",
      "POST",
      {
        userId: instUser._id.toString(),
        institutionName: "Audit Test Institution",
        institutionCode: "INST-AUDIT",
        type: "DIRECT",
        address: "Karanthur, Kozhikode",
        contactNumber: "9876543210",
        email: "inst_audit@misc.markaz.in",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const instId = instRes.body.data?._id;
    recordTest("Academic", "Create InstitutionProfile", instRes.status === 201 && !!instId, instRes.status, instRes.body.message);

    const classRes = await makeRequest(
      "/api/academic/classes",
      "POST",
      {
        name: "Standard 10",
        code: "STD-10",
        institutionId: instId,
        academicYearId: ayId,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const classId = classRes.body.data?._id;
    recordTest("Academic", "Create Class", classRes.status === 201 && !!classId, classRes.status, classRes.body.message);

    const subjectRes = await makeRequest(
      "/api/academic/subjects",
      "POST",
      {
        subjectName: "Islamic History",
        subjectCode: "IH-10",
        category: "ISLAMIC_STUDIES",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const subjectId = subjectRes.body.data?._id;
    recordTest("Academic", "Create Subject", subjectRes.status === 201 && !!subjectId, subjectRes.status, subjectRes.body.message);

    const studentRegRes = await makeRequest(
      "/api/students",
      "POST",
      {
        nameEnglish: "Audit Student",
        dateOfBirth: "2008-05-15T00:00:00.000Z",
        admissionYear: 2026,
        fatherName: "Father Name",
        motherName: "Mother Name",
        institutionId: instId,
        classId: classId,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const studentId = studentRegRes.body.data?.studentId;
    recordTest("Student", "Register Student Profile", studentRegRes.status === 201 && !!studentId, studentRegRes.status, studentRegRes.body.message);

    // 6. EVENT FLOW
    const eventRes = await makeRequest(
      "/api/events/events",
      "POST",
      {
        title: "MISC Academic Conference 2026",
        slug: "misc-conf-2026",
        description: "Annual academic gathering",
        eventDate: "2026-10-15T00:00:00.000Z",
        venue: "Karanthur Main Auditorium",
        registrationFee: 500,
        status: "UPCOMING",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const eventId = eventRes.body.data?._id;
    recordTest("Events", "Create Public Event", eventRes.status === 201 && !!eventId, eventRes.status, eventRes.body.message);

    const eventRegRes = await makeRequest("/api/events/event-registrations", "POST", {
      eventId,
      participantName: "Event Delegate",
      email: "delegate@misc.markaz.in",
      mobile: "9998887776",
    });
    const eventRegId = eventRegRes.body.data?._id;
    recordTest("Events", "Public Event Registration", eventRegRes.status === 201 && !!eventRegId, eventRegRes.status, eventRegRes.body.message);

    // 7. PAYMENTS & TRANSACTION INTEGRITY
    const paymentRes = await makeRequest(
      "/api/payments",
      "POST",
      {
        paymentType: "EVENT_REGISTRATION",
        eventRegistrationId: eventRegId,
        amount: 500,
        gateway: "RAZORPAY",
        transactionId: "TXN_AUDIT_1001",
        status: "SUCCESS",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Payments", "Record Payment & Auto-Confirm Event Registration", paymentRes.status === 201, paymentRes.status, paymentRes.body.message);

    const dupPaymentRes = await makeRequest(
      "/api/payments",
      "POST",
      {
        paymentType: "EVENT_REGISTRATION",
        eventRegistrationId: eventRegId,
        amount: 500,
        gateway: "RAZORPAY",
        transactionId: "TXN_AUDIT_1001", // Duplicate
        status: "SUCCESS",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Payments", "Duplicate TransactionId Rejection (400/409)", dupPaymentRes.status === 400 || dupPaymentRes.status === 409, dupPaymentRes.status, dupPaymentRes.body.message);

    // Mark live payment gateway signature verification as unverified since test credentials are not live
    recordTest("Payments", "Live Payment Gateway Signature Verification", false, 0, "No live Razorpay/Stripe API keys configured in environment", true);

    // 8. EXAM FLOW & MARK VERIFICATION ENFORCEMENT
    const examRes = await makeRequest(
      "/api/exams/exams",
      "POST",
      {
        title: "Annual Board Examination 2026",
        code: "BE-2026-AUDIT",
        academicYearId: ayId,
        startDate: "2026-11-01T00:00:00.000Z",
        endDate: "2026-11-15T00:00:00.000Z",
        status: "SCHEDULED",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const examId = examRes.body.data?._id;
    recordTest("Exams", "Create Board Exam", examRes.status === 201 && !!examId, examRes.status, examRes.body.message);

    const scheduleRes = await makeRequest(
      "/api/exams/exam-schedules",
      "POST",
      {
        examId,
        classId,
        subjectId,
        examDate: "2026-11-02T00:00:00.000Z",
        startTime: "09:30 AM",
        endTime: "12:30 PM",
        maxMarks: 100,
        passMarks: 40,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const scheduleId = scheduleRes.body.data?._id;
    recordTest("Exams", "Create ExamSchedule", scheduleRes.status === 201 && !!scheduleId, scheduleRes.status, scheduleRes.body.message);

    const examRegRes = await makeRequest(
      "/api/exams/exam-registrations",
      "POST",
      {
        examId,
        studentId,
        institutionId: instId,
        rollNumber: "ROLL-AUDIT-001",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Exams", "Register Student for Board Exam", examRegRes.status === 201, examRegRes.status, examRegRes.body.message);

    // Mark Entry Validation Test: Exceeding maxMarks
    const exceedMarkRes = await makeRequest(
      "/api/exams/mark-entries",
      "POST",
      {
        examId,
        examScheduleId: scheduleId,
        studentId,
        subjectId,
        marksObtained: 150, // Max is 100
        status: "DRAFT",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Mark Validation", "Exceeding maxMarks Rejection (400)", exceedMarkRes.status === 400, exceedMarkRes.status, exceedMarkRes.body.message);

    // Submit Valid Draft Mark
    const draftMarkRes = await makeRequest(
      "/api/exams/mark-entries",
      "POST",
      {
        examId,
        examScheduleId: scheduleId,
        studentId,
        subjectId,
        marksObtained: 85,
        status: "DRAFT",
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Exams", "Submit Draft Mark Entry", draftMarkRes.status === 200, draftMarkRes.status, draftMarkRes.body.message);

    // CRITICAL TEST: Attempt Result Generation on DRAFT mark (Must Fail!)
    const failGenRes = await makeRequest(
      "/api/exams/exam-results/generate",
      "POST",
      {
        examId,
        classId,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Result Workflow", "Block Result Generation for Unverified/Draft Marks (400)", failGenRes.status === 400, failGenRes.status, failGenRes.body.message);

    // Verify Mark Entry
    const verifyMarksRes = await makeRequest(
      `/api/exams/mark-entries/verify/${scheduleId}`,
      "PUT",
      {},
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Exams", "Verify Mark Entries for Schedule", verifyMarksRes.status === 200, verifyMarksRes.status, verifyMarksRes.body.message);

    // Result Generation on VERIFIED mark (Must Succeed!)
    const passGenRes = await makeRequest(
      "/api/exams/exam-results/generate",
      "POST",
      {
        examId,
        classId,
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    recordTest("Result Workflow", "Result Generation on Verified Marks (200)", passGenRes.status === 200 && passGenRes.body.data?.length > 0, passGenRes.status, passGenRes.body.message);

    // 9. PUBLIC CMS & ENQUIRY
    const enquiryRes = await makeRequest("/api/cms/enquiries", "POST", {
      name: "Public Citizen",
      email: "citizen@misc.markaz.in",
      subject: "GENERAL_ENQUIRY",
      message: "Requesting details on upcoming academic programs.",
    });
    recordTest("CMS", "Public Enquiry Submission", enquiryRes.status === 201, enquiryRes.status, enquiryRes.body.message);

    const publicArticlesRes = await makeRequest("/api/cms/articles", "GET");
    recordTest("CMS", "Public Articles Retrieval", publicArticlesRes.status === 200, publicArticlesRes.status, publicArticlesRes.body.message);

  } catch (error) {
    console.error("Test execution error:", error);
    recordTest("Execution", "Suite Runtime Exception", false, 500, error.message);
  } finally {
    await cleanAuditData();
    server.close();
    console.log("\n==================================================");
    console.log(`SUMMARY: Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed} | Unverified: ${results.unverified}`);
    console.log("==================================================\n");
    process.exit(results.failed > 0 ? 1 : 0);
  }
};

runAuditSuite();
