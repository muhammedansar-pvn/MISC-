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
const Assignment = require("../src/modules/assignments/assignment.model");
const AssignmentSubmission = require("../src/modules/assignments/assignment-submission.model");
const StudyMaterial = require("../src/modules/study-materials/study-material.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("PHASE 1 VERIFICATION: ASSIGNMENT & STUDY MATERIAL ARCHITECTURE");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();

  // Create Fixtures: AcademicYear, Class, Subject, Faculty 1, Faculty 2, Student 1, Admin
  const academicYear = await AcademicYear.create({
    yearName: `Academic Year ${timestamp}`,
    yearCode: `AY-${timestamp.toString().slice(-4)}`,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2027-03-31"),
    isCurrent: true,
    status: "ACTIVE",
  });

  const testClass = await Class.create({
    name: `Class 10-${timestamp}`,
    code: `C10-${timestamp.toString().slice(-4)}`,
    academicYearId: academicYear._id,
    status: "ACTIVE",
  });

  const testSubject = await Subject.create({
    subjectName: `Fiqh Studies ${timestamp}`,
    subjectCode: `FIQH-${timestamp.toString().slice(-4)}`,
    category: "ISLAMIC_STUDIES",
    status: "ACTIVE",
  });

  // Faculty 1
  const facultyUser1 = await User.create({
    name: "Usthad Ahmad",
    email: `usthad.ahmad.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "FACULTY",
    status: "ACTIVE",
  });
  const facultyProfile1 = await FacultyProfile.create({
    userId: facultyUser1._id,
    facultyId: `FAC-A-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Usthad Ahmad",
    department: "Shariah",
    designation: "Usthad",
    assignedClasses: [testClass._id],
    assignedSubjects: [testSubject._id],
  });

  // Faculty 2 (Unrelated)
  const facultyUser2 = await User.create({
    name: "Usthad Bilal",
    email: `usthad.bilal.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "FACULTY",
    status: "ACTIVE",
  });
  const facultyProfile2 = await FacultyProfile.create({
    userId: facultyUser2._id,
    facultyId: `FAC-B-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Usthad Bilal",
    department: "Languages",
    designation: "Usthad",
    assignedClasses: [],
    assignedSubjects: [],
  });

  // Student 1
  const studentUser1 = await User.create({
    name: "Zaid Student",
    email: `zaid.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "STUDENT",
    status: "ACTIVE",
  });
  const studentProfile1 = await StudentProfile.create({
    userId: studentUser1._id,
    registrationNumber: `REG-Z-${timestamp.toString().slice(-4)}`,
    nameEnglish: "Zaid Student",
    classId: testClass._id,
    fatherName: "Father of Zaid",
    motherName: "Mother of Zaid",
    dateOfBirth: new Date("2010-01-01"),
    admissionYear: 2026,
    status: "ACTIVE",
  });

  // Admin
  const adminUser = await User.create({
    name: "Principal Admin",
    email: `admin.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "ADMIN",
    status: "ACTIVE",
  });

  const facultyToken1 = generateToken({ userId: facultyUser1._id.toString(), role: "FACULTY" });
  const facultyToken2 = generateToken({ userId: facultyUser2._id.toString(), role: "FACULTY" });
  const studentToken1 = generateToken({ userId: studentUser1._id.toString(), role: "STUDENT" });
  const adminToken = generateToken({ userId: adminUser._id.toString(), role: "ADMIN" });

  console.log("[3/5] Test domain fixtures established.");

  const uploadedFilesToCleanup = [];

  try {
    // -------------------------------------------------------------
    // TEST 1: Security Test - Multer blocks dangerous extensions
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Multer rejects dangerous file types (.exe) ---");
    const boundary = "---------------------------testBoundary12345";
    const dangerousBody = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Malicious Test",
      `--${boundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      testClass._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      testSubject._id.toString(),
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="payload.exe"`,
      "Content-Type: application/x-msdownload",
      "",
      "MZ9000000000000",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    let res = await fetch(`${baseUrl}/study-materials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: dangerousBody,
    });
    let data = await res.json();
    console.log("Upload dangerous .exe -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("blocked for security")) {
      throw new Error("Security check failed: .exe was not blocked with 400!");
    }
    console.log("Test 1 Result: PASSED (Dangerous extension safely blocked)");

    // -------------------------------------------------------------
    // TEST 2: Assignment Workflow (Create -> List -> Submit -> Submissions -> Delete)
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Assignment Workflow ---");
    const validPdfContent = "%PDF-1.4 sample assignment document content";
    const assignmentBoundary = "---------------------------assignmentBoundary12345";
    const assignmentBody = [
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Fiqh Mid-Term Assignment on Taharah",
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="description"`,
      "",
      "Complete exercises 1 to 5 from chapter 2.",
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      testClass._id.toString(),
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      testSubject._id.toString(),
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="dueDate"`,
      "",
      new Date(Date.now() + 7 * 86400000).toISOString(),
      `--${assignmentBoundary}`,
      `Content-Disposition: form-data; name="attachments"; filename="guidelines.pdf"`,
      "Content-Type: application/pdf",
      "",
      validPdfContent,
      `--${assignmentBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": `multipart/form-data; boundary=${assignmentBoundary}`,
      },
      body: assignmentBody,
    });
    data = await res.json();
    console.log("2a. POST /assignments -> HTTP Status:", res.status, "Title:", data.data?.title);
    if (res.status !== 201 || !data.data?._id) {
      throw new Error(`Failed to create assignment: ${JSON.stringify(data)}`);
    }
    const createdAssignment = data.data;
    if (createdAssignment.attachments?.[0]?.fileUrl) {
      uploadedFilesToCleanup.push(createdAssignment.attachments[0].fileUrl);
    }

    // 2b. List assignments by class and subject
    res = await fetch(`${baseUrl}/assignments?classId=${testClass._id}&subjectId=${testSubject._id}`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("2b. GET /assignments -> HTTP Status:", res.status, "Count:", data.count, "Total:", data.total);
    if (res.status !== 200 || data.data?.length === 0) {
      throw new Error(`Failed to list assignments: ${JSON.stringify(data)}`);
    }

    // 2c. Student submits assignment with file (First time)
    const submissionBoundary = "---------------------------submissionBoundary12345";
    const submissionBody = [
      `--${submissionBoundary}`,
      `Content-Disposition: form-data; name="file"; filename="zaid_fiqh_answer.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 Zaid student homework answer",
      `--${submissionBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${submissionBoundary}`,
      },
      body: submissionBody,
    });
    data = await res.json();
    console.log("2c. POST /assignments/:id/submit (1st submission) -> HTTP Status:", res.status, "Status:", data.data?.status);
    if (res.status !== 200 || data.data?.status !== "SUBMITTED") {
      throw new Error(`Failed to submit assignment: ${JSON.stringify(data)}`);
    }

    // 2c-bis: Student calls /submit a SECOND time to correct a mistake before grading
    const updateBoundary = "---------------------------updateBoundary12345";
    const updateBody = [
      `--${updateBoundary}`,
      `Content-Disposition: form-data; name="file"; filename="zaid_fiqh_corrected.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 Zaid corrected homework answer",
      `--${updateBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${updateBoundary}`,
      },
      body: updateBody,
    });
    data = await res.json();
    console.log("2c2. POST /assignments/:id/submit (2nd submission/correction) -> HTTP Status:", res.status, "File:", data.data?.submittedFile?.fileName);
    if (res.status !== 200 || data.data?.submittedFile?.fileName !== "zaid_fiqh_corrected.pdf") {
      throw new Error("Resubmission failed to update the existing record");
    }
    if (data.data?.submittedFile?.fileUrl) {
      uploadedFilesToCleanup.push(data.data.submittedFile.fileUrl);
    }

    // 2d. Student gets their own submission
    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}/my-submission`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("2d. GET /assignments/:id/my-submission -> HTTP Status:", res.status, "SubmittedFile:", data.data?.submittedFile?.fileName);
    if (res.status !== 200 || data.data?.submittedFile?.fileName !== "zaid_fiqh_corrected.pdf") {
      throw new Error("Student could not retrieve updated submission");
    }

    // 2d-bis: Teacher grades the submission
    await AssignmentSubmission.updateOne(
      { assignmentId: createdAssignment._id, studentId: studentProfile1._id },
      { $set: { status: "GRADED", marks: 95, feedback: "Excellent analysis" } }
    );
    console.log("2d-bis: Teacher marked submission as GRADED");

    // 2d-ter: Student attempts to resubmit after grading (MUST be blocked with HTTP 400)
    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        "Content-Type": `multipart/form-data; boundary=${updateBoundary}`,
      },
      body: updateBody,
    });
    data = await res.json();
    console.log("2d-ter: POST /submit after GRADED -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400 || !data.message.includes("already been evaluated and graded")) {
      throw new Error(`Expected 400 rejection for graded submission overwrite, got ${res.status}`);
    }

    // 2e. Faculty 1 views submissions
    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}/submissions`, {
      headers: { Authorization: `Bearer ${facultyToken1}` },
    });
    data = await res.json();
    console.log("2e. GET /assignments/:id/submissions -> HTTP Status:", res.status, "Count:", data.data?.length);
    if (res.status !== 200 || data.data?.length !== 1) {
      throw new Error("Faculty could not list assignment submissions");
    }

    // 2f. Faculty 2 (Unrelated) attempts to delete Faculty 1's assignment (Must be HTTP 403)
    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${facultyToken2}` },
    });
    data = await res.json();
    console.log("2f. DELETE /assignments/:id by Unrelated Faculty -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unrelated faculty delete, got ${res.status}`);
    }

    // 2g. Faculty 1 (Owner) deletes assignment
    res = await fetch(`${baseUrl}/assignments/${createdAssignment._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${facultyToken1}` },
    });
    data = await res.json();
    console.log("2g. DELETE /assignments/:id by Owner Faculty -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 200 || !data.success) {
      throw new Error("Owner faculty failed to delete assignment");
    }
    console.log("Test 2 Result: PASSED (Full Assignment CRUD & Submission lifecycle verified)");

    // -------------------------------------------------------------
    // TEST 3: Study Material Workflow (Create -> List -> Get -> Delete)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Study Material Workflow ---");
    const materialBoundary = "---------------------------materialBoundary12345";
    const materialBody = [
      `--${materialBoundary}`,
      `Content-Disposition: form-data; name="title"`,
      "",
      "Chapter 1: Foundations of Shariah",
      `--${materialBoundary}`,
      `Content-Disposition: form-data; name="chapter"`,
      "",
      "Chapter 1",
      `--${materialBoundary}`,
      `Content-Disposition: form-data; name="classId"`,
      "",
      testClass._id.toString(),
      `--${materialBoundary}`,
      `Content-Disposition: form-data; name="subjectId"`,
      "",
      testSubject._id.toString(),
      `--${materialBoundary}`,
      `Content-Disposition: form-data; name="file"; filename="shariah_notes.pdf"`,
      "Content-Type: application/pdf",
      "",
      "%PDF-1.4 Shariah lecture notes for students",
      `--${materialBoundary}--`,
      "",
    ].join("\r\n");

    res = await fetch(`${baseUrl}/study-materials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${facultyToken1}`,
        "Content-Type": `multipart/form-data; boundary=${materialBoundary}`,
      },
      body: materialBody,
    });
    data = await res.json();
    console.log("3a. POST /study-materials -> HTTP Status:", res.status, "Title:", data.data?.title);
    if (res.status !== 201 || !data.data?._id) {
      throw new Error(`Failed to create study material: ${JSON.stringify(data)}`);
    }
    const createdMaterial = data.data;
    if (createdMaterial.fileUrl) {
      uploadedFilesToCleanup.push(createdMaterial.fileUrl);
    }

    // 3b. List study materials by class and chapter
    res = await fetch(`${baseUrl}/study-materials?classId=${testClass._id}&chapter=Chapter%201`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("3b. GET /study-materials -> HTTP Status:", res.status, "Count:", data.count, "Total:", data.total);
    if (res.status !== 200 || data.data?.length === 0) {
      throw new Error(`Failed to query study materials: ${JSON.stringify(data)}`);
    }

    // 3c. Get single study material
    res = await fetch(`${baseUrl}/study-materials/${createdMaterial._id}`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    data = await res.json();
    console.log("3c. GET /study-materials/:id -> HTTP Status:", res.status, "Title:", data.data?.title);
    if (res.status !== 200 || !data.data?.fileUrl) {
      throw new Error("Failed to get study material by ID");
    }

    // 3d. Faculty 2 (Unrelated) attempts to delete study material (Must be HTTP 403)
    res = await fetch(`${baseUrl}/study-materials/${createdMaterial._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${facultyToken2}` },
    });
    data = await res.json();
    console.log("3d. DELETE /study-materials/:id by Unrelated Faculty -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unrelated faculty delete, got ${res.status}`);
    }

    // 3e. Admin deletes study material
    res = await fetch(`${baseUrl}/study-materials/${createdMaterial._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log("3e. DELETE /study-materials/:id by Admin -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 200 || !data.success) {
      throw new Error("Admin failed to delete study material");
    }
    console.log("Test 3 Result: PASSED (Study Material CRUD, filtering & RBAC verified)");

    console.log("\n==================================================================");
    console.log("ALL ASSIGNMENT & STUDY MATERIAL VERIFICATIONS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database and uploads directory...");
    await AssignmentSubmission.deleteMany({ studentId: studentProfile1._id });
    await Assignment.deleteMany({ classId: testClass._id });
    await StudyMaterial.deleteMany({ classId: testClass._id });
    await StudentProfile.deleteOne({ _id: studentProfile1._id });
    await FacultyProfile.deleteMany({ _id: { $in: [facultyProfile1._id, facultyProfile2._id] } });
    await User.deleteMany({ _id: { $in: [facultyUser1._id, facultyUser2._id, studentUser1._id, adminUser._id] } });
    await Subject.deleteOne({ _id: testSubject._id });
    await Class.deleteOne({ _id: testClass._id });
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
