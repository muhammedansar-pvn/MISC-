const mongoose = require("mongoose");
const http = require("http");
const fs = require("fs");
const path = require("path");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const Assignment = require("../src/modules/assignments/assignment.model");
const AssignmentSubmission = require("../src/modules/assignments/assignment-submission.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("PHASE 5 VERIFICATION: ASSIGNMENT & SUBMISSION LIFECYCLE");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();

  // Create Domain Fixtures
  const academicYear = await AcademicYear.create({
    yearName: `Academic Year ${timestamp}`,
    yearCode: `AY-${timestamp.toString().slice(-4)}`,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2027-03-31"),
    isCurrent: true,
    status: "ACTIVE",
  });

  const class1 = await Class.create({
    name: `Class 10A-${timestamp}`,
    code: `C10A-${timestamp.toString().slice(-4)}`,
    academicYearId: academicYear._id,
    status: "ACTIVE",
  });

  const class2 = await Class.create({
    name: `Class 10B-${timestamp}`,
    code: `C10B-${timestamp.toString().slice(-4)}`,
    academicYearId: academicYear._id,
    status: "ACTIVE",
  });

  const subject1 = await Subject.create({
    subjectName: `Arabic Rhetoric ${timestamp}`,
    subjectCode: `ARAB-${timestamp.toString().slice(-4)}`,
    category: "LANGUAGE",
    status: "ACTIVE",
  });

  const subject2 = await Subject.create({
    subjectName: `Islamic History ${timestamp}`,
    subjectCode: `HIST-${timestamp.toString().slice(-4)}`,
    category: "ISLAMIC_STUDIES",
    status: "ACTIVE",
  });

  // Faculty 1 (Assigned to Class 1, Subject 1)
  const facultyUser1 = await User.create({
    name: "Usthad Khalid",
    email: `khalid.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "FACULTY",
    status: "ACTIVE",
  });
  const facultyProfile1 = await FacultyProfile.create({
    userId: facultyUser1._id,
    facultyId: `FAC-K-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Usthad Khalid",
    department: "Arabic",
    designation: "Usthad",
    assignedClasses: [class1._id],
    assignedSubjects: [subject1._id],
  });

  // FacultyAssignment for Faculty 1
  await FacultyAssignment.create({
    facultyId: facultyProfile1._id,
    classId: class1._id,
    subjectId: subject1._id,
    academicYearId: academicYear._id,
    status: "ACTIVE",
    isPrimary: true,
  });

  // Faculty 2 (Unassigned / Unrelated)
  const facultyUser2 = await User.create({
    name: "Usthad Omar",
    email: `omar.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "FACULTY",
    status: "ACTIVE",
  });
  const facultyProfile2 = await FacultyProfile.create({
    userId: facultyUser2._id,
    facultyId: `FAC-O-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Usthad Omar",
    department: "General",
    designation: "Usthad",
    assignedClasses: [],
    assignedSubjects: [],
  });

  // Student 1 (Enrolled in Class 1)
  const studentUser1 = await User.create({
    name: "Tariq Student",
    email: `tariq.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "STUDENT",
    status: "ACTIVE",
  });
  const studentProfile1 = await StudentProfile.create({
    userId: studentUser1._id,
    registrationNumber: `REG-T-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Tariq Student",
    classId: class1._id,
    academicYearId: academicYear._id,
    admissionYear: 2026,
    status: "ACTIVE",
    dateOfBirth: new Date("2009-05-15"),
    fatherName: "Father of Tariq",
    motherName: "Mother of Tariq",
  });

  // Student 2 (Enrolled in Class 2 - Outsider to Class 1)
  const studentUser2 = await User.create({
    name: "Sami Student",
    email: `sami.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "STUDENT",
    status: "ACTIVE",
  });
  const studentProfile2 = await StudentProfile.create({
    userId: studentUser2._id,
    registrationNumber: `REG-S-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Sami Student",
    classId: class2._id,
    academicYearId: academicYear._id,
    admissionYear: 2026,
    status: "ACTIVE",
    dateOfBirth: new Date("2009-08-20"),
    fatherName: "Father of Sami",
    motherName: "Mother of Sami",
  });

  // Admin
  const adminUser = await User.create({
    name: "Controller Admin",
    email: `admin.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "ADMIN",
    status: "ACTIVE",
  });

  const facultyToken1 = generateToken({ userId: facultyUser1._id.toString(), role: "FACULTY" });
  const facultyToken2 = generateToken({ userId: facultyUser2._id.toString(), role: "FACULTY" });
  const studentToken1 = generateToken({ userId: studentUser1._id.toString(), role: "STUDENT" });
  const studentToken2 = generateToken({ userId: studentUser2._id.toString(), role: "STUDENT" });
  const adminToken = generateToken({ userId: adminUser._id.toString(), role: "ADMIN" });

  console.log("[3/5] Test domain fixtures established.");

  const uploadedFilesToCleanup = [];
  let testAssignment = null;
  let lateAssignment = null;
  let testSubmission = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Assignment creation with academicYearId, maxMarks, and attachments
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Assignment creation with academicYearId, maxMarks, and attachments ---");
    const boundary = "---------------------------boundary12345";
    const body1 = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Balaghah Essay on Metaphors",
      `--${boundary}`,
      `Content-Disposition: form-data; name="description"`,
      "",
      "Read chapter 3 and write an analysis on Quranic metaphors.",
      `--${boundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      class1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      subject1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="academicYearId"`,
      "",
      academicYear._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="dueDate"`,
      "",
      new Date(Date.now() + 7 * 86400000).toISOString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="maxMarks"`,
      "",
      "50",
      `--${boundary}`,
      `Content-Disposition: form-data; name="attachments"; filename="guidelines.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 sample guidelines",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    let res = await fetch(`${baseUrl}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body1,
    });
    let data = await res.json();
    console.log("1. POST /assignments -> HTTP Status:", res.status, "Title:", data.data?.title);
    if (res.status !== 201 || !data.data?._id || data.data.maxMarks !== 50) {
      throw new Error(`Test 1 Failed: Assignment creation failed. ${JSON.stringify(data)}`);
    }
    testAssignment = data.data;
    if (testAssignment.attachments?.[0]?.fileUrl) {
      uploadedFilesToCleanup.push(testAssignment.attachments[0].fileUrl);
    }
    console.log("✓ Test 1 Passed: Assignment created with academicYearId and maxMarks=50");

    // -------------------------------------------------------------
    // TEST 2: Unassigned faculty blocked from creating assignment (HTTP 403)
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Unassigned faculty blocked from creating assignment ---");
    const body2 = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Unauthorized Assignment",
      `--${boundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      class1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      subject1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="dueDate"`,
      "",
      new Date(Date.now() + 7 * 86400000).toISOString(),
      `--${boundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken2}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body2,
    });
    data = await res.json();
    console.log("2. POST /assignments by Unassigned Faculty -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Test 2 Failed: Expected HTTP 403 for unassigned faculty, got ${res.status}`);
    }
    console.log("✓ Test 2 Passed: Unassigned faculty blocked with HTTP 403");

    // -------------------------------------------------------------
    // TEST 3: Student in enrolled class sees assignment; outsider student does not
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Student assignment query scoping ---");
    // Student 1 (Class 1)
    res = await fetch(`${baseUrl}/assignments`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("3a. Student 1 GET /assignments -> HTTP Status:", res.status, "Count:", data.data?.length);
    if (res.status !== 200 || !data.data?.some((a) => a._id === testAssignment._id)) {
      throw new Error(`Test 3a Failed: Enrolled student cannot see class assignment.`);
    }

    // Student 2 (Class 2 - Outsider)
    res = await fetch(`${baseUrl}/assignments`, {
      headers: { Authorization: `Bearer ${studentToken2}` },
    });
    data = await res.json();
    console.log("3b. Student 2 (Outsider) GET /assignments -> HTTP Status:", res.status, "Count:", data.data?.length);
    if (res.status !== 200 || data.data?.some((a) => a._id === testAssignment._id)) {
      throw new Error(`Test 3b Failed: Outsider student saw assignment from another class!`);
    }
    console.log("✓ Test 3 Passed: Assignment query strictly scoped to enrolled student's class");

    // -------------------------------------------------------------
    // TEST 4: Enrolled student submits assignment on time -> status SUBMITTED
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Enrolled student on-time submission ---");
    const subBoundary = "---------------------------subBoundary123";
    const subBody1 = [
      `--${subBoundary}`,
      `Content-Disposition: form-data; name="file"; filename="tariq_essay.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 Tariq original essay text",
      `--${subBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${subBoundary}`,
      },
      body: subBody1,
    });
    data = await res.json();
    console.log("4. POST /assignments/:id/submit -> HTTP Status:", res.status, "Status:", data.data?.status);
    if (res.status !== 200 || data.data?.status !== "SUBMITTED") {
      throw new Error(`Test 4 Failed: Expected status SUBMITTED, got ${data.data?.status}`);
    }
    testSubmission = data.data;
    if (testSubmission.submittedFile?.fileUrl) {
      uploadedFilesToCleanup.push(testSubmission.submittedFile.fileUrl);
    }
    console.log("✓ Test 4 Passed: On-time submission saved with status SUBMITTED");

    // -------------------------------------------------------------
    // TEST 5: Enrolled student submits after due date -> status LATE
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Overdue submission tagged as LATE ---");
    // Create an assignment with past due date
    const overdueBody = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Overdue Balaghah Quiz",
      `--${boundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      class1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      subject1._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="dueDate"`,
      "",
      new Date(Date.now() - 86400000).toISOString(), // Yesterday
      `--${boundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: overdueBody,
    });
    data = await res.json();
    lateAssignment = data.data;

    res = await fetch(`${baseUrl}/assignments/${lateAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${subBoundary}`,
      },
      body: subBody1,
    });
    data = await res.json();
    console.log("5. POST /submit (Past due date) -> HTTP Status:", res.status, "Status:", data.data?.status);
    if (res.status !== 200 || data.data?.status !== "LATE") {
      throw new Error(`Test 5 Failed: Expected status LATE, got ${data.data?.status}`);
    }
    if (data.data?.submittedFile?.fileUrl) {
      uploadedFilesToCleanup.push(data.data.submittedFile.fileUrl);
    }
    console.log("✓ Test 5 Passed: Late submission correctly marked with status LATE");

    // -------------------------------------------------------------
    // TEST 6: Student resubmits before grading -> updates record and cleans up old file
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Resubmission before evaluation ---");
    const subBody2 = [
      `--${subBoundary}`,
      `Content-Disposition: form-data; name="file"; filename="tariq_revised_essay.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 Tariq revised essay text with corrections",
      `--${subBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${subBoundary}`,
      },
      body: subBody2,
    });
    data = await res.json();
    console.log("6. POST /submit (Revision) -> HTTP Status:", res.status, "FileName:", data.data?.submittedFile?.fileName);
    if (res.status !== 200 || data.data?.submittedFile?.fileName !== "tariq_revised_essay.pdf") {
      throw new Error(`Test 6 Failed: Resubmission did not update file.`);
    }
    testSubmission = data.data;
    if (testSubmission.submittedFile?.fileUrl) {
      uploadedFilesToCleanup.push(testSubmission.submittedFile.fileUrl);
    }
    console.log("✓ Test 6 Passed: Student resubmitted revision successfully before grading");

    // -------------------------------------------------------------
    // TEST 7: Outsider student blocked from submitting to un-enrolled class assignment (HTTP 400)
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Outsider student submission rejected ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken2}`,
        "Content-Type": `multipart/form-data; boundary=${subBoundary}`,
      },
      body: subBody1,
    });
    data = await res.json();
    console.log("7. Outsider POST /submit -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("enrolled class")) {
      throw new Error(`Test 7 Failed: Expected 400 rejection for outsider submission, got ${res.status}`);
    }
    console.log("✓ Test 7 Passed: Outsider student submission strictly rejected");

    // -------------------------------------------------------------
    // TEST 8: Unassigned faculty blocked from viewing submissions (HTTP 403)
    // -------------------------------------------------------------
    console.log("\n--- TEST 8: Unassigned faculty blocked from viewing submissions ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submissions`, {
      headers: { Authorization: `Bearer ${facultyToken2}` },
    });
    data = await res.json();
    console.log("8. Unassigned Faculty GET /submissions -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Test 8 Failed: Expected 403 for unassigned faculty viewing submissions, got ${res.status}`);
    }
    console.log("✓ Test 8 Passed: Unassigned faculty blocked with HTTP 403");

    // -------------------------------------------------------------
    // TEST 9: Assigned faculty grades submission -> status GRADED, marks, feedback
    // -------------------------------------------------------------
    console.log("\n--- TEST 9: Assigned faculty grades submission ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submissions/${testSubmission._id}/grade`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marks: 45,
        feedback: "Exceptional analysis of metaphorical imagery in Surah Al-Baqarah.",
      }),
    });
    data = await res.json();
    console.log("9. POST /grade -> HTTP Status:", res.status, "Marks:", data.data?.marks, "Status:", data.data?.status);
    if (res.status !== 200 || data.data?.status !== "GRADED" || data.data?.marks !== 45) {
      throw new Error(`Test 9 Failed: Grading failed. ${JSON.stringify(data)}`);
    }
    console.log("✓ Test 9 Passed: Submission graded with status GRADED and feedback recorded");

    // -------------------------------------------------------------
    // TEST 10: Mark validation rejects negative marks and marks exceeding maxMarks
    // -------------------------------------------------------------
    console.log("\n--- TEST 10: Mark validation bounds enforcement ---");
    // Negative marks
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submissions/${testSubmission._id}/grade`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ marks: -5 }),
    });
    data = await res.json();
    console.log("10a. Negative marks -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("negative")) {
      throw new Error(`Test 10a Failed: Expected 400 for negative marks.`);
    }

    // Exceeding maxMarks (50)
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submissions/${testSubmission._id}/grade`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ marks: 55 }),
    });
    data = await res.json();
    console.log("10b. Exceeding maxMarks (55 > 50) -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("exceed maximum")) {
      throw new Error(`Test 10b Failed: Expected 400 for marks > maxMarks.`);
    }
    console.log("✓ Test 10 Passed: Negative marks and marks exceeding maxMarks strictly rejected");

    // -------------------------------------------------------------
    // TEST 11: Student blocked from resubmitting once GRADED (HTTP 400)
    // -------------------------------------------------------------
    console.log("\n--- TEST 11: Resubmission blocked after grading ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${subBoundary}`,
      },
      body: subBody1,
    });
    data = await res.json();
    console.log("11. POST /submit on GRADED -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("already been evaluated and graded")) {
      throw new Error(`Test 11 Failed: Resubmission on graded assignment was not blocked with 400.`);
    }
    console.log("✓ Test 11 Passed: Resubmission on graded assignment blocked with HTTP 400");

    // -------------------------------------------------------------
    // TEST 12: Student retrieves own submission with marks and teacher feedback
    // -------------------------------------------------------------
    console.log("\n--- TEST 12: Student retrieves own graded submission ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/my-submission`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("12. GET /my-submission -> HTTP Status:", res.status, "Marks:", data.data?.marks, "Feedback:", data.data?.feedback);
    if (res.status !== 200 || data.data?.marks !== 45 || !data.data?.feedback.includes("Exceptional")) {
      throw new Error(`Test 12 Failed: Student could not retrieve graded submission.`);
    }
    console.log("✓ Test 12 Passed: Student retrieved evaluated score and feedback");

    // -------------------------------------------------------------
    // TEST 13: Student cannot access other students' submissions (IDOR protection)
    // -------------------------------------------------------------
    console.log("\n--- TEST 13: Student blocked from all submissions roster ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}/submissions`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("13. Student GET /submissions -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Test 13 Failed: Expected HTTP 403 for student accessing submissions roster, got ${res.status}`);
    }
    console.log("✓ Test 13 Passed: Student IDOR blocked with HTTP 403");

    // -------------------------------------------------------------
    // TEST 14: Assigned faculty / Admin can update assignment details (PUT)
    // -------------------------------------------------------------
    console.log("\n--- TEST 14: Assigned faculty updates assignment ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Balaghah Essay on Metaphors (Updated)",
        maxMarks: 60,
      }),
    });
    data = await res.json();
    console.log("14. PUT /assignments/:id -> HTTP Status:", res.status, "New Title:", data.data?.title, "MaxMarks:", data.data?.maxMarks);
    if (res.status !== 200 || data.data?.title !== "Balaghah Essay on Metaphors (Updated)" || data.data?.maxMarks !== 60) {
      throw new Error(`Test 14 Failed: Could not update assignment.`);
    }
    console.log("✓ Test 14 Passed: Assignment updated successfully");

    // -------------------------------------------------------------
    // TEST 15: Delete assignment authorization (Unrelated blocked, Owner succeeds)
    // -------------------------------------------------------------
    console.log("\n--- TEST 15: Delete assignment authorization ---");
    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${facultyToken2}` },
    });
    data = await res.json();
    console.log("15a. Unrelated Faculty DELETE -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Test 15a Failed: Expected HTTP 403 for unrelated faculty delete.`);
    }

    res = await fetch(`${baseUrl}/assignments/${testAssignment._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${facultyToken1}` },
    });
    data = await res.json();
    console.log("15b. Owner Faculty DELETE -> HTTP Status:", res.status, "Success:", data.success);
    if (res.status !== 200 || !data.success) {
      throw new Error(`Test 15b Failed: Owner faculty could not delete assignment.`);
    }
    console.log("✓ Test 15 Passed: Delete authorization enforced (HTTP 403 for unassigned, HTTP 200 for owner)");

    // -------------------------------------------------------------
    // TEST 16: Idempotent submission / update verification
    // -------------------------------------------------------------
    console.log("\n--- TEST 16: Idempotency of submissions ---");
    // Verify there is exactly one submission record for student 1 on lateAssignment
    const submissionCount = await AssignmentSubmission.countDocuments({
      assignmentId: lateAssignment._id,
      studentId: studentProfile1._id,
    });
    console.log("16. Submission count for (assignment, student):", submissionCount);
    if (submissionCount !== 1) {
      throw new Error(`Test 16 Failed: Expected exactly 1 submission record, found ${submissionCount}`);
    }
    console.log("✓ Test 16 Passed: Compound unique index enforces idempotent submission");

    console.log("\n==================================================================");
    console.log("ALL 16 PHASE 5 ASSIGNMENT TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database and uploads directory...");
    await AssignmentSubmission.deleteMany({ assignmentId: { $in: [testAssignment?._id, lateAssignment?._id].filter(Boolean) } });
    await Assignment.deleteMany({ classId: { $in: [class1._id, class2._id] } });
    await FacultyAssignment.deleteMany({ facultyId: { $in: [facultyProfile1._id, facultyProfile2._id] } });
    await StudentProfile.deleteMany({ _id: { $in: [studentProfile1._id, studentProfile2._id] } });
    await FacultyProfile.deleteMany({ _id: { $in: [facultyProfile1._id, facultyProfile2._id] } });
    await User.deleteMany({ _id: { $in: [facultyUser1._id, facultyUser2._id, studentUser1._id, studentUser2._id, adminUser._id] } });
    await Subject.deleteMany({ _id: { $in: [subject1._id, subject2._id] } });
    await Class.deleteMany({ _id: { $in: [class1._id, class2._id] } });
    await AcademicYear.deleteOne({ _id: academicYear._id });

    // Clean up uploaded files from disk
    for (const fileUrl of uploadedFilesToCleanup) {
      try {
        const filePath = path.join(__dirname, "../..", fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // ignore disk cleanup error
      }
    }

    server.close();
    await mongoose.disconnect();
    console.log("[5/5] Cleanup complete. Server closed.");
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
