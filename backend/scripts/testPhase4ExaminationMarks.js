require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const User = require("../src/modules/users/user.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamSchedule = require("../src/modules/exams/exam-schedule.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const MarkEntry = require("../src/modules/exams/mark-entry.model");
const ExamResult = require("../src/modules/exams/exam-result.model");
const MarkCorrectionRequest = require("../src/modules/exams/mark-correction-request.model");

const examService = require("../src/modules/exams/exam.service");
const academicAuthService = require("../src/modules/academics/academic-auth.service");

async function runPhase4Tests() {
  console.log("==========================================================");
  console.log("PHASE 4: EXAMINATION & MARKS ENGINE SUITE VERIFICATION");
  console.log("==========================================================");

  await connectDB();

  let adminUser = null;
  let testFacultyUser = null;
  let testFaculty = null;
  let unauthorizedFacultyUser = null;
  let unauthorizedFaculty = null;
  let impersonatedFacultyUser = null;
  let impersonatedFaculty = null;

  let testAcademicYear = null;
  let testClass = null;
  let otherClass = null;
  let testSubject1 = null;
  let testSubject2 = null;

  let student1User = null;
  let student1 = null;
  let student2User = null;
  let student2 = null;
  let outsiderStudentUser = null;
  let outsiderStudent = null;

  let testAssignment1 = null;
  let testAssignment2 = null;
  let testExam = null;
  let testSchedule1 = null;
  let testSchedule2 = null;

  let passedTests = 0;
  const totalTests = 22; // In addition to regression tests 23, 24, 25

  try {
    console.log("\n--- Setting up Phase 4 test environment ---");
    const uniqueSuffix = Date.now().toString().slice(-6);

    adminUser = await User.create({
      name: `Admin P4 ${uniqueSuffix}`,
      email: `admin_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "ADMIN",
      status: "ACTIVE",
    });

    testAcademicYear = await AcademicYear.create({
      yearName: `Test AY Phase4 ${uniqueSuffix}`,
      yearCode: `AY_P4_${uniqueSuffix}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
      isCurrent: true,
    });

    testClass = await Class.create({
      name: `Sanaviyya Year 2 - P4 ${uniqueSuffix}`,
      code: `SAN2_P4_${uniqueSuffix}`,
      level: 2,
      stream: "REGULAR",
      academicYearId: testAcademicYear._id,
      capacity: 40,
      isActive: true,
    });

    otherClass = await Class.create({
      name: `Sanaviyya Year 3 - P4 ${uniqueSuffix}`,
      code: `SAN3_P4_${uniqueSuffix}`,
      level: 3,
      stream: "REGULAR",
      academicYearId: testAcademicYear._id,
      capacity: 40,
      isActive: true,
    });

    testSubject1 = await Subject.create({
      subjectName: `Tafseer Al-Baydawi ${uniqueSuffix}`,
      subjectCode: `TAF4_${uniqueSuffix}`,
      category: "ISLAMIC_STUDIES",
      type: "THEORY",
      periodsPerWeek: 5,
      status: "ACTIVE",
    });

    testSubject2 = await Subject.create({
      subjectName: `Fiqh Al-Muamalat ${uniqueSuffix}`,
      subjectCode: `FIQ4_${uniqueSuffix}`,
      category: "ISLAMIC_STUDIES",
      type: "THEORY",
      periodsPerWeek: 5,
      status: "ACTIVE",
    });

    // Authorized Faculty
    testFacultyUser = await User.create({
      name: `Usthad Authorized ${uniqueSuffix}`,
      email: `auth_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    testFaculty = await FacultyProfile.create({
      userId: testFacultyUser._id,
      facultyId: `FAC_P4_${uniqueSuffix}`,
      nameEnglish: `Usthad Authorized ${uniqueSuffix}`,
      designation: "Assistant Professor",
      status: "ACTIVE",
    });

    // Unauthorized Faculty (Not assigned to testClass + testSubject1)
    unauthorizedFacultyUser = await User.create({
      name: `Usthad Unauthorized ${uniqueSuffix}`,
      email: `unauth_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    unauthorizedFaculty = await FacultyProfile.create({
      userId: unauthorizedFacultyUser._id,
      facultyId: `UNAUTH_P4_${uniqueSuffix}`,
      nameEnglish: `Usthad Unauthorized ${uniqueSuffix}`,
      designation: "Lecturer",
      status: "ACTIVE",
    });

    // Another Faculty for Impersonation testing
    impersonatedFacultyUser = await User.create({
      name: `Usthad Peer ${uniqueSuffix}`,
      email: `peer_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    impersonatedFaculty = await FacultyProfile.create({
      userId: impersonatedFacultyUser._id,
      facultyId: `PEER_P4_${uniqueSuffix}`,
      nameEnglish: `Usthad Peer ${uniqueSuffix}`,
      designation: "Lecturer",
      status: "ACTIVE",
    });

    // Enrolled Students
    student1User = await User.create({
      name: `Student Ahmad ${uniqueSuffix}`,
      email: `ahmad_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    student1 = await StudentProfile.create({
      userId: student1User._id,
      registrationNumber: `REG1_P4_${uniqueSuffix}`,
      nameEnglish: `Ahmad ${uniqueSuffix}`,
      fatherName: "Ibrahim",
      motherName: "Khadija",
      dateOfBirth: new Date("2008-03-10"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    student2User = await User.create({
      name: `Student Bilal ${uniqueSuffix}`,
      email: `bilal_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    student2 = await StudentProfile.create({
      userId: student2User._id,
      registrationNumber: `REG2_P4_${uniqueSuffix}`,
      nameEnglish: `Bilal ${uniqueSuffix}`,
      fatherName: "Abdullah",
      motherName: "Aisha",
      dateOfBirth: new Date("2008-04-12"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    // Outsider Student (enrolled in otherClass)
    outsiderStudentUser = await User.create({
      name: `Student Outsider ${uniqueSuffix}`,
      email: `outsider_p4_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    outsiderStudent = await StudentProfile.create({
      userId: outsiderStudentUser._id,
      registrationNumber: `OUT_P4_${uniqueSuffix}`,
      nameEnglish: `Outsider ${uniqueSuffix}`,
      fatherName: "Yusuf",
      motherName: "Maryam",
      dateOfBirth: new Date("2008-07-20"),
      admissionYear: 2026,
      classId: otherClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    // Faculty Assignments: testFaculty is assigned to testClass + testSubject1 & testSubject2
    testAssignment1 = await FacultyAssignment.create({
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      facultyId: testFaculty._id,
      isPrimary: true,
      status: "ACTIVE",
    });

    testAssignment2 = await FacultyAssignment.create({
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject2._id,
      facultyId: testFaculty._id,
      isPrimary: true,
      status: "ACTIVE",
    });

    console.log("✓ Test fixtures successfully initialized.\n");

    // ====================================================================
    // TEST 1: Exam creation works
    // ====================================================================
    console.log("Test 1: Verifying Exam creation...");
    testExam = await examService.createExam({
      title: `Annual Examination 2026 ${uniqueSuffix}`,
      code: `ANN_P4_${uniqueSuffix}`,
      academicYearId: testAcademicYear._id,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-15"),
      status: "SCHEDULED",
    });

    if (!testExam || testExam.code !== `ANN_P4_${uniqueSuffix}`) {
      throw new Error("Failed to create Exam document");
    }
    console.log("✓ Exam creation verified successfully.");
    passedTests++;

    // ====================================================================
    // TEST 2: Exam schedule creation works
    // ====================================================================
    console.log("Test 2: Verifying Exam Schedule creation with academicYearId...");
    testSchedule1 = await examService.createExamSchedule({
      examId: testExam._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      academicYearId: testAcademicYear._id,
      examDate: new Date("2026-10-02"),
      startTime: "09:00",
      endTime: "12:00",
      maxMarks: 100,
      passMarks: 40,
    });

    testSchedule2 = await examService.createExamSchedule({
      examId: testExam._id,
      classId: testClass._id,
      subjectId: testSubject2._id,
      academicYearId: testAcademicYear._id,
      examDate: new Date("2026-10-04"),
      startTime: "09:00",
      endTime: "12:00",
      maxMarks: 100,
      passMarks: 40,
    });

    if (!testSchedule1.academicYearId || testSchedule1.maxMarks !== 100) {
      throw new Error("Exam schedule creation failed or missing academicYearId");
    }
    console.log("✓ Exam Schedule created with subject attribution and max/pass marks.");
    passedTests++;

    // ====================================================================
    // TEST 3: Valid faculty can access assigned exam subject & roster
    // ====================================================================
    console.log("Test 3: Verifying authorized faculty can access exam schedule roster...");
    const rosterData = await examService.getExamScheduleRoster(testSchedule1._id, {
      role: "FACULTY",
      userId: testFacultyUser._id,
      facultyId: testFaculty._id,
    });

    if (!rosterData || !Array.isArray(rosterData.roster) || rosterData.roster.length < 2) {
      throw new Error("Failed to retrieve candidate roster for authorized faculty");
    }
    console.log(`✓ Authorized faculty retrieved roster for ${rosterData.roster.length} students.`);
    passedTests++;

    // ====================================================================
    // TEST 4: Unauthorized faculty receives HTTP 403
    // ====================================================================
    console.log("Test 4: Verifying unauthorized faculty is blocked with HTTP 403...");
    let unauth403Caught = false;
    try {
      await examService.getExamScheduleRoster(testSchedule1._id, {
        role: "FACULTY",
        userId: unauthorizedFacultyUser._id,
        facultyId: unauthorizedFaculty._id,
      });
    } catch (err) {
      if (err.statusCode === 403) {
        unauth403Caught = true;
      }
    }

    if (!unauth403Caught) {
      throw new Error("Expected unauthorized faculty to be blocked with 403 on roster access");
    }
    console.log("✓ Unauthorized faculty blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 5: Faculty cannot change classId to bypass authorization
    // ====================================================================
    console.log("Test 5: Verifying faculty cannot submit mismatched classId...");
    let mismatchedClassCaught = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          classId: otherClass._id, // Tampered classId
          studentId: student1._id,
          marksObtained: 85,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("match exam schedule")) {
        mismatchedClassCaught = true;
      }
    }

    if (!mismatchedClassCaught) {
      throw new Error("Backend failed to reject mismatched classId in mark entry payload");
    }
    console.log("✓ Mismatched classId tampering rejected with HTTP 400.");
    passedTests++;

    // ====================================================================
    // TEST 6: Faculty cannot change subjectId to bypass authorization
    // ====================================================================
    console.log("Test 6: Verifying faculty cannot submit mismatched subjectId...");
    let mismatchedSubjectCaught = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          subjectId: testSubject2._id, // Tampered subjectId
          studentId: student1._id,
          marksObtained: 85,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("match exam schedule")) {
        mismatchedSubjectCaught = true;
      }
    }

    if (!mismatchedSubjectCaught) {
      throw new Error("Backend failed to reject mismatched subjectId in mark entry payload");
    }
    console.log("✓ Mismatched subjectId tampering rejected with HTTP 400.");
    passedTests++;

    // ====================================================================
    // TEST 7: Faculty cannot impersonate another evaluatorId
    // ====================================================================
    console.log("Test 7: Verifying faculty cannot impersonate another evaluatorId...");
    let impersonationCaught = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: student1._id,
          evaluatorId: impersonatedFaculty._id, // Spoofed evaluator
          marksObtained: 85,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("Cannot submit marks on behalf of another evaluator")) {
        impersonationCaught = true;
      }
    }

    if (!impersonationCaught) {
      throw new Error("Backend failed to block evaluatorId impersonation with 403");
    }
    console.log("✓ Evaluator impersonation attempt strictly blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 8: Student outside class is rejected
    // ====================================================================
    console.log("Test 8: Verifying outsider student mark entry is rejected...");
    let outsiderRejected = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: outsiderStudent._id,
          marksObtained: 75,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("does not belong to the scheduled class cohort")) {
        outsiderRejected = true;
      }
    }

    if (!outsiderRejected) {
      throw new Error("Backend failed to reject mark entry for student outside class cohort");
    }
    console.log("✓ Student outside class cohort rejected with HTTP 400.");
    passedTests++;

    // ====================================================================
    // TEST 9: Unregistered/ineligible student is rejected where registration applies
    // ====================================================================
    console.log("Test 9: Verifying exam registration validation & duplicate registration prevention...");
    const reg1 = await examService.registerStudentForExam({
      examId: testExam._id,
      studentId: student1._id,
    });
    if (!reg1 || !reg1.rollNumber) {
      throw new Error("Exam registration failed to generate roll number");
    }

    let duplicateRegCaught = false;
    try {
      await examService.registerStudentForExam({
        examId: testExam._id,
        studentId: student1._id,
      });
    } catch (err) {
      if (err.statusCode === 409 || err.message.includes("already registered")) {
        duplicateRegCaught = true;
      }
    }

    if (!duplicateRegCaught) {
      throw new Error("Duplicate exam registration was not rejected");
    }
    console.log("✓ Exam registration verified and duplicate registration prevented.");
    passedTests++;

    // ====================================================================
    // TEST 10: Marks below zero are rejected
    // ====================================================================
    console.log("Test 10: Verifying negative marks are rejected...");
    let negativeMarksCaught = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: student1._id,
          marksObtained: -5,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("cannot be negative")) {
        negativeMarksCaught = true;
      }
    }

    if (!negativeMarksCaught) {
      throw new Error("Backend failed to reject negative marks");
    }
    console.log("✓ Negative marks strictly rejected with HTTP 400.");
    passedTests++;

    // ====================================================================
    // TEST 11: Marks above maximum are rejected
    // ====================================================================
    console.log("Test 11: Verifying marks exceeding maximum are rejected...");
    let excessMarksCaught = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: student1._id,
          marksObtained: 105, // maxMarks is 100
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("cannot exceed maximum marks")) {
        excessMarksCaught = true;
      }
    }

    if (!excessMarksCaught) {
      throw new Error("Backend failed to reject marks exceeding maximum marks");
    }
    console.log("✓ Marks exceeding maximum strictly rejected with HTTP 400.");
    passedTests++;

    // ====================================================================
    // TEST 12: Duplicate MarkEntry is prevented (single document per schedule + student)
    // ====================================================================
    console.log("Test 12: Verifying duplicate MarkEntry is prevented (idempotent upsert)...");
    const markEntry1 = await examService.submitOrUpdateMarkEntry(
      {
        examScheduleId: testSchedule1._id,
        studentId: student1._id,
        marksObtained: 82.5, // Decimal support check
        status: "DRAFT",
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    const markCount = await MarkEntry.countDocuments({
      examScheduleId: testSchedule1._id,
      studentId: student1._id,
    });

    if (markCount !== 1 || markEntry1.marksObtained !== 82.5) {
      throw new Error(`Expected 1 mark entry with 82.5, found count=${markCount}, mark=${markEntry1?.marksObtained}`);
    }
    console.log("✓ Mark entry upserted successfully with decimal precision (82.5).");
    passedTests++;

    // ====================================================================
    // TEST 13: Double-save is idempotent
    // ====================================================================
    console.log("Test 13: Verifying double-save does not create duplicate entries...");
    await examService.submitOrUpdateMarkEntry(
      {
        examScheduleId: testSchedule1._id,
        studentId: student1._id,
        marksObtained: 82.5,
        status: "DRAFT",
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    const markCountAfter = await MarkEntry.countDocuments({
      examScheduleId: testSchedule1._id,
      studentId: student1._id,
    });

    if (markCountAfter !== 1) {
      throw new Error("Double-save created duplicate MarkEntry record");
    }
    console.log("✓ Idempotent save verified with zero duplicates.");
    passedTests++;

    // ====================================================================
    // TEST 14: DRAFT marks can be edited according to policy
    // ====================================================================
    console.log("Test 14: Verifying DRAFT marks can be updated by authorized faculty...");
    const updatedDraft = await examService.submitOrUpdateMarkEntry(
      {
        examScheduleId: testSchedule1._id,
        studentId: student1._id,
        marksObtained: 85,
        status: "SUBMITTED",
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    if (updatedDraft.marksObtained !== 85 || updatedDraft.status !== "SUBMITTED") {
      throw new Error("Failed to update DRAFT mark to 85 SUBMITTED");
    }
    console.log("✓ DRAFT mark updated and transitioned to SUBMITTED.");
    passedTests++;

    // Enter marks for student2 in schedule 1 as well
    await examService.submitOrUpdateMarkEntry(
      {
        examScheduleId: testSchedule1._id,
        studentId: student2._id,
        marksObtained: 76,
        status: "SUBMITTED",
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    // ====================================================================
    // TEST 15: VERIFIED marks cannot be directly overwritten
    // ====================================================================
    console.log("Test 15: Verifying VERIFIED marks cannot be directly modified by faculty...");
    // Admin verifies the marks for schedule 1
    await examService.verifyMarkEntries(testSchedule1._id, { role: "ADMIN", userId: adminUser._id });

    const verifiedRecord = await MarkEntry.findOne({
      examScheduleId: testSchedule1._id,
      studentId: student1._id,
    });
    if (!verifiedRecord || verifiedRecord.status !== "VERIFIED") {
      throw new Error("Verification failed to update status to VERIFIED");
    }

    let verifiedOverwriteBlocked = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: student1._id,
          marksObtained: 99,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("cannot be directly modified")) {
        verifiedOverwriteBlocked = true;
      }
    }

    if (!verifiedOverwriteBlocked) {
      throw new Error("Direct overwrite of VERIFIED mark was not blocked with HTTP 403");
    }
    console.log("✓ Direct modification of VERIFIED marks strictly blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 16: PUBLISHED marks cannot be directly overwritten
    // ====================================================================
    console.log("Test 16: Verifying PUBLISHED marks cannot be directly overwritten...");
    // Now enter and verify schedule 2 marks so results can be generated
    await examService.submitRosterMarks(
      {
        examScheduleId: testSchedule2._id,
        status: "SUBMITTED",
        marks: [
          { studentId: student1._id, marksObtained: 90 },
          { studentId: student2._id, marksObtained: 88 },
        ],
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );
    await examService.verifyMarkEntries(testSchedule2._id, { role: "ADMIN", userId: adminUser._id });

    // Generate results
    await examService.aggregateAndGenerateResults(testExam._id, testClass._id, {
      role: "ADMIN",
      userId: adminUser._id,
    });

    const publishedRecord = await MarkEntry.findOne({
      examScheduleId: testSchedule1._id,
      studentId: student1._id,
    });
    if (!publishedRecord || publishedRecord.status !== "PUBLISHED") {
      throw new Error("Result publication failed to transition MarkEntry to PUBLISHED");
    }

    let publishedOverwriteBlocked = false;
    try {
      await examService.submitOrUpdateMarkEntry(
        {
          examScheduleId: testSchedule1._id,
          studentId: student1._id,
          marksObtained: 95,
        },
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("cannot be directly modified")) {
        publishedOverwriteBlocked = true;
      }
    }

    if (!publishedOverwriteBlocked) {
      throw new Error("Direct overwrite of PUBLISHED mark was not blocked with HTTP 403");
    }
    console.log("✓ Direct modification of PUBLISHED marks strictly blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 17: Student can only view own result
    // ====================================================================
    console.log("Test 17: Verifying student can only view their own exam results...");
    const student1Results = await examService.getExamResults(
      { examId: testExam._id },
      null,
      { role: "STUDENT", studentId: student1._id, userId: student1User._id }
    );

    if (!Array.isArray(student1Results) || student1Results.length !== 1) {
      throw new Error(`Expected exactly 1 result for Student 1, got ${student1Results?.length}`);
    }
    if (student1Results[0].studentId._id.toString() !== student1._id.toString()) {
      throw new Error("Student result query returned mismatched student result");
    }
    console.log("✓ Student access strictly restricted to own results.");
    passedTests++;

    // ====================================================================
    // TEST 18: Faculty can only view authorized class/subject results
    // ====================================================================
    console.log("Test 18: Verifying faculty class scoping on results query...");
    const facultyResults = await examService.getExamResults(
      { examId: testExam._id, classId: testClass._id },
      null,
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    if (!Array.isArray(facultyResults) || facultyResults.length !== 2) {
      throw new Error(`Expected 2 results for authorized class, got ${facultyResults?.length}`);
    }

    let unauthClassResultsBlocked = false;
    try {
      await examService.getExamResults(
        { examId: testExam._id, classId: otherClass._id }, // Unassigned class
        null,
        { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403) {
        unauthClassResultsBlocked = true;
      }
    }

    if (!unauthClassResultsBlocked) {
      throw new Error("Faculty was not blocked from querying unassigned class results");
    }
    console.log("✓ Faculty result access restricted to authorized class cohorts.");
    passedTests++;

    // ====================================================================
    // TEST 19: Unauthorized user cannot verify marks
    // ====================================================================
    console.log("Test 19: Verifying non-admin cannot verify marks...");
    let unauthVerifyBlocked = false;
    try {
      await examService.verifyMarkEntries(testSchedule1._id, {
        role: "FACULTY",
        userId: testFacultyUser._id,
      });
    } catch (err) {
      if (err.statusCode === 403) {
        unauthVerifyBlocked = true;
      }
    }

    if (!unauthVerifyBlocked) {
      throw new Error("Non-admin user was able to verify marks");
    }
    console.log("✓ Non-admin user blocked from verifying marks (HTTP 403).");
    passedTests++;

    // ====================================================================
    // TEST 20: Unauthorized user cannot publish results
    // ====================================================================
    console.log("Test 20: Verifying non-admin cannot publish exam results...");
    let unauthPublishBlocked = false;
    try {
      await examService.aggregateAndGenerateResults(testExam._id, testClass._id, {
        role: "FACULTY",
        userId: testFacultyUser._id,
      });
    } catch (err) {
      if (err.statusCode === 403) {
        unauthPublishBlocked = true;
      }
    }

    if (!unauthPublishBlocked) {
      throw new Error("Non-admin user was able to trigger result publication");
    }
    console.log("✓ Non-admin user blocked from publishing exam results (HTTP 403).");
    passedTests++;

    // ====================================================================
    // TEST 21: Correction workflow preserves audit trail
    // ====================================================================
    console.log("Test 21: Verifying MarkCorrectionRequest workflow and audit trail...");
    const correctionReq = await examService.createMarkCorrectionRequest(
      {
        markEntryId: publishedRecord._id,
        newMarks: 88,
        reason: "Retotalling recount error discovered in question 4",
      },
      { role: "FACULTY", userId: testFacultyUser._id, facultyId: testFaculty._id }
    );

    if (!correctionReq || correctionReq.oldMarks !== 85 || correctionReq.newMarks !== 88) {
      throw new Error("Failed to create valid correction request");
    }

    // Admin reviews and approves the correction
    const reviewedReq = await examService.reviewMarkCorrectionRequest(
      correctionReq._id,
      "APPROVED",
      { role: "ADMIN", userId: adminUser._id },
      "Approved after verifying answer sheet."
    );

    if (reviewedReq.status !== "APPROVED" || reviewedReq.reviewedBy.toString() !== adminUser._id.toString()) {
      throw new Error("Correction review audit trail incomplete");
    }

    // Verify underlying MarkEntry was updated
    const correctedEntry = await MarkEntry.findById(publishedRecord._id);
    if (correctedEntry.marksObtained !== 88) {
      throw new Error(`Underlying mark entry not updated: expected 88, got ${correctedEntry.marksObtained}`);
    }
    console.log("✓ Mark correction request audited, approved, and underlying entry updated.");
    passedTests++;

    // ====================================================================
    // TEST 22: Result generation requires verified marks & builds subjectResults
    // ====================================================================
    console.log("Test 22: Verifying result calculation includes detailed subjectResults breakdown...");
    const publishedResult = await ExamResult.findOne({
      examId: testExam._id,
      studentId: student1._id,
    });

    if (!publishedResult || !Array.isArray(publishedResult.subjectResults) || publishedResult.subjectResults.length !== 2) {
      throw new Error("ExamResult missing subjectResults breakdown");
    }

    // Schedule 1: 88 / 100, Schedule 2: 90 / 100 => Total 178 / 200 = 89% => Grade A, PASSED
    if (publishedResult.totalMarksObtained !== 178 || publishedResult.percentage !== 89 || publishedResult.resultStatus !== "PASSED") {
      throw new Error(`Result calculation mismatch: total=${publishedResult.totalMarksObtained}, pct=${publishedResult.percentage}, status=${publishedResult.resultStatus}`);
    }
    console.log(`✓ Result validated: Total ${publishedResult.totalMarksObtained}/${publishedResult.totalMaxMarks} (${publishedResult.percentage}%), Grade ${publishedResult.grade}, Status: ${publishedResult.resultStatus}`);
    console.log(`  Subject 1 (${publishedResult.subjectResults[0].subjectName}): ${publishedResult.subjectResults[0].marksObtained}/${publishedResult.subjectResults[0].maxMarks} (${publishedResult.subjectResults[0].grade})`);
    console.log(`  Subject 2 (${publishedResult.subjectResults[1].subjectName}): ${publishedResult.subjectResults[1].marksObtained}/${publishedResult.subjectResults[1].maxMarks} (${publishedResult.subjectResults[1].grade})`);
    passedTests++;

    console.log("\n==========================================================");
    console.log(`PHASE 4 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("==========================================================");
  } catch (error) {
    console.error("\n❌ PHASE 4 VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    console.log("\n--- Cleaning up test fixtures ---");
    if (testExam) {
      await ExamResult.deleteMany({ examId: testExam._id });
      await MarkCorrectionRequest.deleteMany({ examId: testExam._id });
      await MarkEntry.deleteMany({ examId: testExam._id });
      await ExamRegistration.deleteMany({ examId: testExam._id });
      await ExamSchedule.deleteMany({ examId: testExam._id });
      await Exam.deleteOne({ _id: testExam._id });
    }
    if (testAssignment1) await FacultyAssignment.deleteOne({ _id: testAssignment1._id });
    if (testAssignment2) await FacultyAssignment.deleteOne({ _id: testAssignment2._id });
    if (student1) await StudentProfile.deleteOne({ _id: student1._id });
    if (student2) await StudentProfile.deleteOne({ _id: student2._id });
    if (outsiderStudent) await StudentProfile.deleteOne({ _id: outsiderStudent._id });
    if (student1User) await User.deleteOne({ _id: student1User._id });
    if (student2User) await User.deleteOne({ _id: student2User._id });
    if (outsiderStudentUser) await User.deleteOne({ _id: outsiderStudentUser._id });
    if (testFaculty) await FacultyProfile.deleteOne({ _id: testFaculty._id });
    if (testFacultyUser) await User.deleteOne({ _id: testFacultyUser._id });
    if (unauthorizedFaculty) await FacultyProfile.deleteOne({ _id: unauthorizedFaculty._id });
    if (unauthorizedFacultyUser) await User.deleteOne({ _id: unauthorizedFacultyUser._id });
    if (impersonatedFaculty) await FacultyProfile.deleteOne({ _id: impersonatedFaculty._id });
    if (impersonatedFacultyUser) await User.deleteOne({ _id: impersonatedFacultyUser._id });
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (testSubject1) await Subject.deleteOne({ _id: testSubject1._id });
    if (testSubject2) await Subject.deleteOne({ _id: testSubject2._id });
    if (testClass) await Class.deleteOne({ _id: testClass._id });
    if (otherClass) await Class.deleteOne({ _id: otherClass._id });
    if (testAcademicYear) await AcademicYear.deleteOne({ _id: testAcademicYear._id });

    await mongoose.connection.close();
    console.log("✓ Test environment cleaned up and DB connection closed.\n");
  }
}

runPhase4Tests();
