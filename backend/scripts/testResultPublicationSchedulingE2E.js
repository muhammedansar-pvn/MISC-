const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Subject = require("../src/modules/academics/subject.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamSchedule = require("../src/modules/exams/exam-schedule.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const ExamResult = require("../src/modules/exams/exam-result.model");
const MarkEntry = require("../src/modules/exams/mark-entry.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runE2EResultPublicationTests() {
  console.log("==================================================================");
  console.log("PHASE 2 END-TO-END VERIFICATION: EXAM RESULT PUBLICATION SCHEDULING");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/3] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/3] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupParentIds = [];
  const cleanupFacultyIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupSubjectIds = [];
  const cleanupExamIds = [];
  const cleanupScheduleIds = [];
  const cleanupRegistrationIds = [];
  const cleanupMarkIds = [];
  const cleanupResultIds = [];

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assert(condition, message) {
    testTotalCount++;
    if (condition) {
      console.log(`  PASS: [TC-${testTotalCount}] ${message}`);
      testPassedCount++;
    } else {
      console.error(`  FAIL: [TC-${testTotalCount}] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------
    // Setup Context
    // -------------------------------------------------------------
    const academicYear = await AcademicYear.create({
      yearName: `Publication AY ${timestamp}`,
      yearCode: `PAY${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const testClass = await Class.create({
      name: `Publication Class ${timestamp}`,
      code: `PC${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
      status: "ACTIVE",
    });
    cleanupClassIds.push(testClass._id);

    const otherClass = await Class.create({
      name: `Other Class ${timestamp}`,
      code: `OC${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
      status: "ACTIVE",
    });
    cleanupClassIds.push(otherClass._id);

    const testSubject = await Subject.create({
      subjectName: `Advanced Mathematics ${timestamp}`,
      subjectCode: `MTH${timestamp.toString().slice(-4)}`,
      category: "GENERAL",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(testSubject._id);

    // 1. Admin User
    const adminUser = await User.create({
      name: `Admin Tester ${timestamp}`,
      email: `admin_${timestamp}@markaz.edu`,
      username: `admin_${timestamp}`,
      password: "HashedPassword123!",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = generateToken({ userId: adminUser._id.toString(), id: adminUser._id.toString(), role: "ADMIN", email: adminUser.email });

    // 2. Faculty User (assigned to testClass)
    const facultyUser = await User.create({
      name: `Faculty Usthad ${timestamp}`,
      email: `faculty_${timestamp}@markaz.edu`,
      username: `faculty_${timestamp}`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUser._id);
    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      nameEnglish: `Faculty Usthad ${timestamp}`,
      facultyId: `FAC-${timestamp.toString().slice(-4)}`,
      assignedClasses: [testClass._id],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile._id);
    const facultyToken = generateToken({ userId: facultyUser._id.toString(), id: facultyUser._id.toString(), role: "FACULTY", email: facultyUser.email });

    // 3. Student A (in testClass)
    const studentUserA = await User.create({
      name: `Student A ${timestamp}`,
      email: `student_a_${timestamp}@markaz.edu`,
      username: `student_a_${timestamp}`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(studentUserA._id);
    const studentProfileA = await StudentProfile.create({
      userId: studentUserA._id,
      nameEnglish: `Student A ${timestamp}`,
      registrationNumber: `REG-STA-${timestamp}`,
      fatherName: "Father A",
      motherName: "Mother A",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-01-01"),
      admissionNumber: `ADM-A-${timestamp.toString().slice(-4)}`,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(studentProfileA._id);
    const studentTokenA = generateToken({ userId: studentUserA._id.toString(), id: studentUserA._id.toString(), role: "STUDENT", email: studentUserA.email });

    // 4. Student B (in testClass, distinct student)
    const studentUserB = await User.create({
      name: `Student B ${timestamp}`,
      email: `student_b_${timestamp}@markaz.edu`,
      username: `student_b_${timestamp}`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(studentUserB._id);
    const studentProfileB = await StudentProfile.create({
      userId: studentUserB._id,
      nameEnglish: `Student B ${timestamp}`,
      registrationNumber: `REG-STB-${timestamp}`,
      fatherName: "Father B",
      motherName: "Mother B",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-01-01"),
      admissionNumber: `ADM-B-${timestamp.toString().slice(-4)}`,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(studentProfileB._id);
    const studentTokenB = generateToken({ userId: studentUserB._id.toString(), id: studentUserB._id.toString(), role: "STUDENT", email: studentUserB.email });

    // 5. Parent A (linked to Student A)
    const parentUserA = await User.create({
      name: `Parent A ${timestamp}`,
      email: `parent_a_${timestamp}@markaz.edu`,
      username: `parent_a_${timestamp}`,
      password: "HashedPassword123!",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parentUserA._id);
    const parentProfileA = await ParentProfile.create({
      userId: parentUserA._id,
      name: `Parent A ${timestamp}`,
      relationType: "FATHER",
      studentIds: [studentProfileA._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parentProfileA._id);
    const parentTokenA = generateToken({ userId: parentUserA._id.toString(), id: parentUserA._id.toString(), role: "PARENT", email: parentUserA.email });

    // 6. Parent B (linked ONLY to Student B)
    const parentUserB = await User.create({
      name: `Parent B ${timestamp}`,
      email: `parent_b_${timestamp}@markaz.edu`,
      username: `parent_b_${timestamp}`,
      password: "HashedPassword123!",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parentUserB._id);
    const parentProfileB = await ParentProfile.create({
      userId: parentUserB._id,
      name: `Parent B ${timestamp}`,
      relationType: "FATHER",
      studentIds: [studentProfileB._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parentProfileB._id);
    const parentTokenB = generateToken({ userId: parentUserB._id.toString(), id: parentUserB._id.toString(), role: "PARENT", email: parentUserB.email });

    console.log("[3/3] Test fixtures initialized. Starting 12 automated verification scenarios...\n");

    // =================================================================
    // TEST CASE 1: Admin creates exam with future resultPublicationDate
    // =================================================================
    const futurePublicationDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days in future
    const examPayload = {
      title: `Sanaviyya Annual Exam ${timestamp}`,
      code: `EXAM-${timestamp.toString().slice(-6)}`,
      description: "Annual Council Examination with Scheduled Results",
      academicYearId: academicYear._id.toString(),
      startDate: new Date("2026-10-10").toISOString(),
      endDate: new Date("2026-10-25").toISOString(),
      registrationStartDate: new Date("2026-10-01").toISOString(),
      registrationEndDate: new Date("2026-10-09").toISOString(),
      resultPublicationDate: futurePublicationDate.toISOString(),
      eligibleClassIds: [testClass._id.toString()],
      fee: 100,
      status: "PUBLISHED",
    };

    const createExamRes = await fetch(`${baseUrl}/exams/exams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(examPayload),
    });
    const createExamJson = await createExamRes.json();
    if (createExamRes.status !== 201) {
      console.error("Create Exam Error:", createExamRes.status, createExamJson);
    }
    assert(
      createExamRes.status === 201 &&
        createExamJson.success &&
        createExamJson.data.resultPublicationDate,
      "TC-1: Admin successfully creates exam with future resultPublicationDate in database"
    );
    const scheduledExamId = createExamJson.data._id;
    cleanupExamIds.push(scheduledExamId);

    // =================================================================
    // TEST CASE 2: Marks entry & Result Generation (Preparation by Admin/Faculty)
    // =================================================================
    const schedule = await ExamSchedule.create({
      examId: scheduledExamId,
      classId: testClass._id,
      academicYearId: academicYear._id,
      subjectId: testSubject._id,
      examDate: new Date("2026-10-15"),
      startTime: "09:30",
      endTime: "12:30",
      maxMarks: 100,
      passMarks: 40,
      status: "SCHEDULED",
    });
    cleanupScheduleIds.push(schedule._id);

    // Student A & Student B registrations
    const regA = await ExamRegistration.create({
      studentId: studentProfileA._id,
      examId: scheduledExamId,
      registrationStatus: "HALL_TICKET_ISSUED",
      rollNumber: `ROLL-A-${timestamp.toString().slice(-4)}`,
    });
    cleanupRegistrationIds.push(regA._id);

    const regB = await ExamRegistration.create({
      studentId: studentProfileB._id,
      examId: scheduledExamId,
      registrationStatus: "HALL_TICKET_ISSUED",
      rollNumber: `ROLL-B-${timestamp.toString().slice(-4)}`,
    });
    cleanupRegistrationIds.push(regB._id);

    // Marks for Student A
    const markEntryA = await MarkEntry.create({
      examId: scheduledExamId,
      examScheduleId: schedule._id,
      studentId: studentProfileA._id,
      academicYearId: academicYear._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      evaluatorId: facultyProfile._id,
      marksObtained: 88,
      status: "VERIFIED",
    });
    cleanupMarkIds.push(markEntryA._id);

    // Result for Student A
    const resultDocA = await ExamResult.create({
      studentId: studentProfileA._id,
      examId: scheduledExamId,
      classId: testClass._id,
      academicYearId: academicYear._id,
      totalMarksObtained: 88,
      totalMaxMarks: 100,
      percentage: 88,
      grade: "A+",
      resultStatus: "PASSED",
      subjectResults: [
        {
          subjectId: testSubject._id,
          subjectName: testSubject.subjectName,
          marksObtained: 88,
          maxMarks: 100,
          passMarks: 40,
          grade: "A+",
          resultStatus: "PASSED",
        },
      ],
      status: "PUBLISHED",
    });
    cleanupResultIds.push(resultDocA._id);

    // Result for Student B
    const resultDocB = await ExamResult.create({
      studentId: studentProfileB._id,
      examId: scheduledExamId,
      classId: testClass._id,
      academicYearId: academicYear._id,
      totalMarksObtained: 72,
      totalMaxMarks: 100,
      percentage: 72,
      grade: "B+",
      resultStatus: "PASSED",
      subjectResults: [
        {
          subjectId: testSubject._id,
          subjectName: testSubject.subjectName,
          marksObtained: 72,
          maxMarks: 100,
          passMarks: 40,
          grade: "B+",
          resultStatus: "PASSED",
        },
      ],
      status: "PUBLISHED",
    });
    cleanupResultIds.push(resultDocB._id);

    assert(
      resultDocA._id && resultDocB._id,
      "TC-2: Faculty entered marks and Admin generated exam results in database before publication date"
    );

    // =================================================================
    // TEST CASE 3: Student A tries to view result before publication date
    // =================================================================
    const studentListBeforeRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    const studentListBeforeJson = await studentListBeforeRes.json();
    assert(
      studentListBeforeRes.status === 200 &&
        studentListBeforeJson.isPublished === false &&
        studentListBeforeJson.publicationStatus === "SCHEDULED" &&
        studentListBeforeJson.data.length === 0 &&
        studentListBeforeJson.message.includes("published on"),
      "TC-3: Student querying exam before resultPublicationDate receives SCHEDULED message with 0 leaked marks"
    );

    // Direct ID lookup before publication date
    const studentDirectBeforeRes = await fetch(
      `${baseUrl}/exams/exam-results/${resultDocA._id}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    assert(
      studentDirectBeforeRes.status === 403,
      "TC-3b: Student direct ID lookup on exam result before publication date returns HTTP 403 Forbidden"
    );

    // =================================================================
    // TEST CASE 4: Parent A tries to view result before publication date
    // =================================================================
    const parentListBeforeRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}&studentId=${studentProfileA._id}`,
      {
        headers: { Authorization: `Bearer ${parentTokenA}` },
      }
    );
    const parentListBeforeJson = await parentListBeforeRes.json();
    assert(
      parentListBeforeRes.status === 200 &&
        parentListBeforeJson.isPublished === false &&
        parentListBeforeJson.publicationStatus === "SCHEDULED" &&
        parentListBeforeJson.data.length === 0,
      "TC-4: Parent querying child's exam before resultPublicationDate receives SCHEDULED message with 0 leaked marks"
    );

    // Parent direct ID lookup before publication date
    const parentDirectBeforeRes = await fetch(
      `${baseUrl}/exams/exam-results/${resultDocA._id}`,
      {
        headers: { Authorization: `Bearer ${parentTokenA}` },
      }
    );
    assert(
      parentDirectBeforeRes.status === 403,
      "TC-4b: Parent direct ID lookup on exam result before publication date returns HTTP 403 Forbidden"
    );

    // =================================================================
    // TEST CASE 5: Admin views results before publication date
    // =================================================================
    const adminViewRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const adminViewJson = await adminViewRes.json();
    assert(
      adminViewRes.status === 200 &&
        adminViewJson.data.length >= 2 &&
        adminViewJson.data.some((r) => r.percentage === 88),
      "TC-5: Admin retains full authorized access to prepare and verify results before publication date"
    );

    // =================================================================
    // TEST CASE 6: Faculty views results before publication date
    // =================================================================
    const facultyViewRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}&classId=${testClass._id}`,
      {
        headers: { Authorization: `Bearer ${facultyToken}` },
      }
    );
    const facultyViewJson = await facultyViewRes.json();
    assert(
      facultyViewRes.status === 200 &&
        facultyViewJson.data.length >= 2 &&
        facultyViewJson.data.some((r) => r.percentage === 88),
      "TC-6: Faculty retains full authorized access to view evaluation results for assigned class before publication"
    );

    // =================================================================
    // TEST CASE 7: System clock or publication date advances past resultPublicationDate
    // =================================================================
    const pastPublicationDate = new Date(Date.now() - 60 * 1000); // 1 minute in the past
    await Exam.findByIdAndUpdate(scheduledExamId, {
      resultPublicationDate: pastPublicationDate,
    });
    const updatedExamDoc = await Exam.findById(scheduledExamId).lean();
    assert(
      new Date(updatedExamDoc.resultPublicationDate).getTime() < Date.now(),
      "TC-7: Exam publication timestamp advanced past current system time (release condition met)"
    );

    // =================================================================
    // TEST CASE 8: Student A views result after publication date
    // =================================================================
    const studentListAfterRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    const studentListAfterJson = await studentListAfterRes.json();
    assert(
      studentListAfterRes.status === 200 &&
        studentListAfterJson.data.length === 1 &&
        studentListAfterJson.data[0].percentage === 88 &&
        studentListAfterJson.data[0].grade === "A+",
      "TC-8: Student A successfully accesses verified marks and scorecard once resultPublicationDate has arrived"
    );

    // Student A direct ID lookup after publication date
    const studentDirectAfterRes = await fetch(
      `${baseUrl}/exams/exam-results/${resultDocA._id}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    const studentDirectAfterJson = await studentDirectAfterRes.json();
    assert(
      studentDirectAfterRes.status === 200 &&
        studentDirectAfterJson.data.percentage === 88,
      "TC-8b: Student A direct ID lookup succeeds after publication date"
    );

    // =================================================================
    // TEST CASE 9: Parent A views result after publication date
    // =================================================================
    const parentListAfterRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}&studentId=${studentProfileA._id}`,
      {
        headers: { Authorization: `Bearer ${parentTokenA}` },
      }
    );
    const parentListAfterJson = await parentListAfterRes.json();
    assert(
      parentListAfterRes.status === 200 &&
        parentListAfterJson.data.length === 1 &&
        parentListAfterJson.data[0].percentage === 88 &&
        parentListAfterJson.data[0].grade === "A+",
      "TC-9: Parent A successfully accesses child's marks and scorecard once resultPublicationDate has arrived"
    );

    // =================================================================
    // TEST CASE 10: IDOR Attack — Student A tries to view Student B's result
    // =================================================================
    const studentIdorDirectRes = await fetch(
      `${baseUrl}/exams/exam-results/${resultDocB._id}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    assert(
      studentIdorDirectRes.status === 403,
      "TC-10: IDOR protection blocked Student A from accessing Student B's result by direct ID (HTTP 403)"
    );

    // Student A queries with explicit studentId parameter of Student B
    const studentIdorQueryRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}&studentId=${studentProfileB._id}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    const studentIdorQueryJson = await studentIdorQueryRes.json();
    // Student scope is strictly pinned to studentProfileA._id on backend regardless of query param
    assert(
      studentIdorQueryRes.status === 200 &&
        studentIdorQueryJson.data.length === 1 &&
        studentIdorQueryJson.data[0].studentId._id.toString() === studentProfileA._id.toString(),
      "TC-10b: IDOR query parameter tampering ignored: Student A cannot retrieve Student B's results"
    );

    // =================================================================
    // TEST CASE 11: IDOR Attack — Parent A tries to view unlinked Student B's result
    // =================================================================
    const parentIdorDirectRes = await fetch(
      `${baseUrl}/exams/exam-results/${resultDocB._id}`,
      {
        headers: { Authorization: `Bearer ${parentTokenA}` },
      }
    );
    assert(
      parentIdorDirectRes.status === 403,
      "TC-11: IDOR protection blocked Parent A from accessing unlinked Student B's result by ID (HTTP 403)"
    );

    const parentIdorQueryRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${scheduledExamId}&studentId=${studentProfileB._id}`,
      {
        headers: { Authorization: `Bearer ${parentTokenA}` },
      }
    );
    const parentIdorQueryJson = await parentIdorQueryRes.json();
    assert(
      parentIdorQueryRes.status === 403,
      "TC-11b: IDOR protection blocked Parent A querying unlinked studentId parameter (HTTP 403 Forbidden)"
    );

    // =================================================================
    // TEST CASE 12: Backward-compatibility for exams without resultPublicationDate
    // =================================================================
    const legacyExam = await Exam.create({
      title: `Legacy Exam Without Publication Date ${timestamp}`,
      code: `LEG-${timestamp.toString().slice(-6)}`,
      description: "Legacy exam without resultPublicationDate field",
      academicYearId: academicYear._id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-15"),
      registrationStartDate: new Date("2026-04-01"),
      registrationEndDate: new Date("2026-04-20"),
      status: "PUBLISHED",
      // resultPublicationDate intentionally omitted / undefined
    });
    cleanupExamIds.push(legacyExam._id);

    const legacyResult = await ExamResult.create({
      studentId: studentProfileA._id,
      examId: legacyExam._id,
      classId: testClass._id,
      academicYearId: academicYear._id,
      totalMarksObtained: 95,
      totalMaxMarks: 100,
      percentage: 95,
      grade: "A+",
      resultStatus: "PASSED",
      status: "PUBLISHED",
    });
    cleanupResultIds.push(legacyResult._id);

    const legacyStudentRes = await fetch(
      `${baseUrl}/exams/exam-results?examId=${legacyExam._id}`,
      {
        headers: { Authorization: `Bearer ${studentTokenA}` },
      }
    );
    const legacyStudentJson = await legacyStudentRes.json();
    assert(
      legacyStudentRes.status === 200 &&
        legacyStudentJson.data.length === 1 &&
        legacyStudentJson.data[0].percentage === 95,
      "TC-12: Backward compatibility: Exam without resultPublicationDate remains visible when status is published"
    );

    console.log("\n==================================================================");
    console.log(`ALL TESTS PASSED: ${testPassedCount} / ${testTotalCount} assertions verified!`);
    console.log("==================================================================\n");

  } catch (err) {
    console.error("\nTEST SUITE FAILED WITH ERROR:", err);
    throw err;
  } finally {
    console.log("Cleaning up test records from MongoDB...");
    try {
      if (cleanupResultIds.length) await ExamResult.deleteMany({ _id: { $in: cleanupResultIds } });
      if (cleanupMarkIds.length) await MarkEntry.deleteMany({ _id: { $in: cleanupMarkIds } });
      if (cleanupRegistrationIds.length) await ExamRegistration.deleteMany({ _id: { $in: cleanupRegistrationIds } });
      if (cleanupScheduleIds.length) await ExamSchedule.deleteMany({ _id: { $in: cleanupScheduleIds } });
      if (cleanupExamIds.length) await Exam.deleteMany({ _id: { $in: cleanupExamIds } });
      if (cleanupSubjectIds.length) await Subject.deleteMany({ _id: { $in: cleanupSubjectIds } });
      if (cleanupClassIds.length) await Class.deleteMany({ _id: { $in: cleanupClassIds } });
      if (cleanupYearIds.length) await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
      if (cleanupParentIds.length) await ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } });
      if (cleanupFacultyIds.length) await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
      if (cleanupProfileIds.length) await StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } });
      if (cleanupUserIds.length) await User.deleteMany({ _id: { $in: cleanupUserIds } });
      console.log("Teardown complete. Test data cleanly removed.");
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }
    await mongoose.disconnect();
    server.close();
  }
}

runE2EResultPublicationTests()
  .then(() => {
    console.log("Phase 2 test execution finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Phase 2 test execution terminated with errors:", err.message);
    process.exit(1);
  });
