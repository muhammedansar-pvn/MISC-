const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const academicService = require("../src/modules/academics/academic.service");
const facultyAssignmentService = require("../src/modules/academics/faculty-assignment.service");
const timetableService = require("../src/modules/academics/timetable.service");
const examService = require("../src/modules/exams/exam.service");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const Exam = require("../src/modules/exams/exam.model");
const User = require("../src/modules/users/user.model");
const ExamSchedule = require("../src/modules/exams/exam-schedule.model");
const Timetable = require("../src/modules/academics/timetable.model");

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE SUBJECT & CLASS ARCHITECTURE VERIFICATION ===");
  await mongoose.connect(process.env.MONGODB_URI);

  let createdSubjectId = null;
  let testClassA = null;
  let testClassB = null;
  let activeYear = null;
  let activeFaculty = null;
  let testUser = null;
  let activeExam = null;

  try {
    // 1. Fetch real test entities
    activeYear = await AcademicYear.findOne({ status: "ACTIVE" });
    if (!activeYear) activeYear = await AcademicYear.findOne();
    console.log(`[PASS] Academic Year resolved: ${activeYear.yearName} (${activeYear._id})`);

    const classes = await Class.find({ academicYearId: activeYear._id }).limit(2);
    if (classes.length < 2) {
      throw new Error("Need at least 2 classes in the academic year for testing");
    }
    testClassA = classes[0];
    testClassB = classes[1];
    console.log(`[PASS] Test Class A (Target): ${testClassA.name} (${testClassA._id})`);
    console.log(`[PASS] Test Class B (Initially Unassigned): ${testClassB.name} (${testClassB._id})`);

    testUser = await User.create({
      fullName: "Test Faculty Usthad",
      email: `testfaculty_${Date.now()}@example.com`,
      role: "FACULTY",
      status: "ACTIVE",
      isDeleted: false,
    });
    activeFaculty = await FacultyProfile.create({
      userId: testUser._id,
      nameEnglish: "Test Faculty Usthad",
      facultyId: `FAC-${Date.now().toString().slice(-4)}`,
      designation: "Assistant Professor",
      status: "ACTIVE",
      isDeleted: false,
    });
    console.log(`[PASS] Test Faculty Usthad created: ${activeFaculty.nameEnglish} (${activeFaculty._id})`);

    activeExam = await Exam.findOne();
    if (!activeExam) {
      activeExam = await Exam.create({
        title: "Test Exam Suite",
        code: "TEST-EX-01",
        academicYearId: activeYear._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 864000000),
      });
    }
    console.log(`[PASS] Test Exam: ${activeExam.title} (${activeExam._id})`);

    // ==========================================
    // TEST 1: Reject Nonexistent Class ID
    // ==========================================
    console.log("\n--- TEST 1: Reject Nonexistent Class ID ---");
    const fakeClassId = new mongoose.Types.ObjectId().toString();
    try {
      await academicService.createSubject({
        subjectName: "Invalid Subject Test",
        subjectCode: "INV-999",
        category: "GENERAL",
        classes: [fakeClassId],
      });
      throw new Error("FAILED: createSubject should have thrown error for nonexistent class ID");
    } catch (err) {
      if (err.message.includes("do not exist")) {
        console.log(`[PASS] Correctly rejected invalid class ID: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // ==========================================
    // TEST 2: Create Subject Assigned to Only Class A
    // ==========================================
    console.log("\n--- TEST 2: Create Subject Assigned to Class A ---");
    const uniqueCode = "ARB-TEST-" + Date.now().toString().slice(-4);
    const created = await academicService.createSubject({
      subjectName: "Arabic Grammar Advanced",
      subjectCode: uniqueCode,
      category: "ISLAMIC_STUDIES",
      description: "Classical Nahw curriculum",
      classes: [testClassA._id.toString()],
    });
    createdSubjectId = created._id;
    console.log(`[PASS] Created Subject: "${created.subjectName}" (${created.subjectCode})`);
    console.log(`[PASS] Assigned Classes Count: ${created.classes.length} (Only Class A)`);
    if (created.classes.length !== 1) throw new Error("Expected 1 assigned class");

    // ==========================================
    // TEST 3: Filtering by Class
    // ==========================================
    console.log("\n--- TEST 3: Filter Subjects by Class ---");
    const forClassA = await academicService.getSubjects({ classes: testClassA._id });
    const hasSubInA = forClassA.some((s) => s._id.toString() === createdSubjectId.toString());
    if (!hasSubInA) throw new Error("Expected created subject to appear for Class A");
    console.log(`[PASS] Subject appears in Class A filtered list (Total: ${forClassA.length})`);

    const forClassB = await academicService.getSubjects({ classes: testClassB._id });
    const hasSubInB = forClassB.some((s) => s._id.toString() === createdSubjectId.toString());
    if (hasSubInB) throw new Error("Subject should NOT appear in unassigned Class B filtered list");
    console.log(`[PASS] Subject correctly excluded from unassigned Class B filtered list`);

    // ==========================================
    // TEST 4: Negative Downstream Enforcement on Unassigned Class B
    // ==========================================
    console.log("\n--- TEST 4: Downstream Enforcement on Unassigned Class B ---");
    
    // 4A: Faculty Assignment to Class B must be rejected
    try {
      await facultyAssignmentService.createAssignment({
        facultyId: activeFaculty._id,
        academicYearId: activeYear._id,
        classId: testClassB._id,
        subjectId: createdSubjectId,
      });
      throw new Error("FAILED: Faculty assignment should reject unassigned class-subject combination");
    } catch (err) {
      if (err.message.includes("is not assigned to class")) {
        console.log(`[PASS] Faculty Assignment rejected for Class B: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // 4B: Timetable entry for Class B must be rejected
    try {
      await timetableService.createTimetableEntry({
        classId: testClassB._id,
        academicYearId: activeYear._id,
        dayOfWeek: "MONDAY",
        periodNumber: 6,
        startTime: "12:00",
        endTime: "12:45",
        subjectId: createdSubjectId,
        facultyId: activeFaculty._id,
      });
      throw new Error("FAILED: Timetable should reject unassigned class-subject combination");
    } catch (err) {
      if (err.message.includes("is not assigned to class")) {
        console.log(`[PASS] Timetable entry rejected for Class B: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // 4C: Syllabus for Class B must be rejected
    try {
      await academicService.createSyllabus({
        kitabName: "Al-Ajrumiyyah Test",
        subjectId: createdSubjectId,
        classId: testClassB._id,
        academicYearId: activeYear._id,
        examType: "HALF_YEARLY",
      });
      throw new Error("FAILED: Syllabus should reject unassigned class-subject combination");
    } catch (err) {
      if (err.message.includes("Subject is not assigned to the selected class")) {
        console.log(`[PASS] Syllabus creation rejected for Class B: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // 4D: Exam Schedule for Class B must be rejected
    try {
      await examService.createExamSchedule({
        examId: activeExam._id,
        classId: testClassB._id,
        subjectId: createdSubjectId,
        examDate: new Date(),
        startTime: "09:30",
        endTime: "12:30",
        maxMarks: 100,
        passMarks: 40,
      });
      throw new Error("FAILED: ExamSchedule should reject unassigned class-subject combination");
    } catch (err) {
      if (err.message.includes("Subject is not assigned to the selected class")) {
        console.log(`[PASS] Exam Schedule creation rejected for Class B: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // ==========================================
    // TEST 5: Update Subject to Add Class B (Multi-Class Assignment)
    // ==========================================
    console.log("\n--- TEST 5: Update Subject to Include Class B ---");
    const updatedSub = await academicService.updateSubject(createdSubjectId, {
      classes: [testClassA._id.toString(), testClassB._id.toString()],
    });
    console.log(`[PASS] Updated Subject classes count: ${updatedSub.classes.length}`);
    if (updatedSub.classes.length !== 2) throw new Error("Expected 2 assigned classes after update");

    const forClassBAfterUpdate = await academicService.getSubjects({ classes: testClassB._id });
    const hasSubInBNow = forClassBAfterUpdate.some((s) => s._id.toString() === createdSubjectId.toString());
    if (!hasSubInBNow) throw new Error("Expected subject to now appear in Class B filtered list");
    console.log(`[PASS] Subject now appears in Class B filtered list after assignment update`);

    // ==========================================
    // TEST 6: Successful Downstream Creation for Both Classes
    // ==========================================
    console.log("\n--- TEST 6: Successful Downstream Creation for Assigned Classes ---");

    // 6A: Valid Faculty Assignment for Class B
    const validAssignment = await facultyAssignmentService.createAssignment({
      facultyId: activeFaculty._id,
      academicYearId: activeYear._id,
      classId: testClassB._id,
      subjectId: createdSubjectId,
      notes: "Test valid assignment for Class B",
    });
    console.log(`[PASS] Faculty Assignment created for Class B: ${validAssignment._id}`);
    await facultyAssignmentService.deleteAssignment(validAssignment._id);

    // 6B: Valid Timetable Entry for Class B
    const validTimetable = await timetableService.createTimetableEntry({
      classId: testClassB._id,
      academicYearId: activeYear._id,
      dayOfWeek: "MONDAY",
      periodNumber: 6,
      startTime: "12:00",
      endTime: "12:45",
      subjectId: createdSubjectId,
      facultyId: activeFaculty._id,
    });
    console.log(`[PASS] Timetable entry created for Class B: ${validTimetable._id}`);
    await Timetable.findByIdAndDelete(validTimetable._id);

    // 6C: Valid Syllabus for Class B
    const validSyllabus = await academicService.createSyllabus({
      kitabName: "Al-Ajrumiyyah Test",
      subjectId: createdSubjectId,
      classId: testClassB._id,
      academicYearId: activeYear._id,
      examType: "HALF_YEARLY",
      units: [{ unitNumber: 1, title: "Al-Muqaddimah" }],
    });
    console.log(`[PASS] Syllabus created for Class B: ${validSyllabus._id}`);
    await academicService.deleteSyllabus(validSyllabus._id, true);

    // 6D: Valid Exam Schedule for Class B
    const validSchedule = await examService.createExamSchedule({
      examId: activeExam._id,
      classId: testClassB._id,
      subjectId: createdSubjectId,
      examDate: new Date(),
      startTime: "09:30",
      endTime: "12:30",
      maxMarks: 100,
      passMarks: 40,
    });
    console.log(`[PASS] Exam Schedule created for Class B: ${validSchedule._id}`);
    await ExamSchedule.findByIdAndDelete(validSchedule._id);

    console.log("\n=== ALL ARCHITECTURAL TESTS PASSED COMPLETELY & ACCURATELY ===");
  } catch (error) {
    console.error("Test run error:", error);
    process.exitCode = 1;
  } finally {
    if (createdSubjectId) {
      await Subject.findByIdAndDelete(createdSubjectId);
      console.log(`[CLEANUP] Deleted test subject ${createdSubjectId}`);
    }
    if (activeFaculty) {
      await FacultyProfile.findByIdAndDelete(activeFaculty._id);
      if (activeFaculty.userId) {
        await User.findByIdAndDelete(activeFaculty.userId);
      }
      console.log(`[CLEANUP] Deleted test faculty profile and user`);
    }
    await mongoose.disconnect();
  }
}

runTests();
