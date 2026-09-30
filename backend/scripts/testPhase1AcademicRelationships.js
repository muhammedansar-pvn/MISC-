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
const facultyAssignmentService = require("../src/modules/academics/faculty-assignment.service");
const academicAuthService = require("../src/modules/academics/academic-auth.service");
const studentService = require("../src/modules/students/student.service");

async function runPhase1Tests() {
  console.log("=================================================");
  console.log("PHASE 1: ACADEMIC CORE RELATIONSHIPS VERIFICATION");
  console.log("=================================================");

  await connectDB();

  let testUser = null;
  let testFaculty = null;
  let testAcademicYear = null;
  let testClass = null;
  let testSubject = null;
  let testStudentUser = null;
  let testStudent = null;
  let createdAssignment = null;

  try {
    // 1. Setup Test Academic Year
    console.log("\n[Test 1] Setting up Test Academic Year...");
    const yearCode = `TEST_AY_${Date.now()}`;
    testAcademicYear = await AcademicYear.create({
      yearName: "Test Academic Year 2026-2027",
      yearCode,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
      isCurrent: false,
    });
    console.log(`✓ Academic Year created: ${testAcademicYear._id} (${testAcademicYear.yearCode})`);

    // 2. Setup Test Class
    console.log("\n[Test 2] Setting up Test Class with Department...");
    testClass = await Class.create({
      name: "Sanaviyya Year 2 - Section A",
      code: `SAN2_${Date.now().toString().slice(-4)}`,
      academicYearId: testAcademicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });
    console.log(`✓ Class created: ${testClass._id} (${testClass.name}, Department: ${testClass.department})`);

    // 3. Setup Test Subject
    console.log("\n[Test 3] Setting up Test Subject...");
    testSubject = await Subject.create({
      name: "Tafseer al-Baydawi",
      subjectName: "Tafseer al-Baydawi",
      code: `TAF_${Date.now().toString().slice(-4)}`,
      subjectCode: `TAF_${Date.now().toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      type: "THEORY",
      credits: 4,
      status: "ACTIVE",
    });
    console.log(`✓ Subject created: ${testSubject._id} (${testSubject.name})`);

    // 4. Setup Test Faculty
    console.log("\n[Test 4] Setting up Test Faculty...");
    testUser = await User.create({
      name: "Usthad Ahmad Sanavi",
      email: `usthad_test_${Date.now()}@markaz.edu`,
      username: `usthad_${Date.now()}`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    testFaculty = await FacultyProfile.create({
      userId: testUser._id,
      facultyId: `FAC_TEST_${Date.now().toString().slice(-4)}`,
      nameEnglish: "Usthad Ahmad Sanavi",
      designation: "Senior Professor of Tafseer",
      department: "Sanaviyya",
      status: "ACTIVE",
    });
    console.log(`✓ Faculty created: ${testFaculty._id} (Name: ${testFaculty.nameEnglish})`);

    // 5. Setup Test Student
    console.log("\n[Test 5] Setting up Test Student enrolled in Class...");
    testStudentUser = await User.create({
      name: "Student Bilal",
      email: `bilal_test_${Date.now()}@markaz.edu`,
      username: `student_${Date.now()}`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    testStudent = await StudentProfile.create({
      userId: testStudentUser._id,
      registrationNumber: `MISC_TEST_${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Bilal",
      fatherName: "Abdullah",
      motherName: "Fatima",
      dateOfBirth: new Date("2008-05-15"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });
    console.log(`✓ Student created: ${testStudent._id} (Enrolled in Class: ${testClass.name})`);

    // 6. Create Faculty Assignment
    console.log("\n[Test 6] Testing Faculty Assignment Creation via Service...");
    createdAssignment = await facultyAssignmentService.createAssignment({
      facultyId: testFaculty._id,
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      notes: "Primary Usthad for Tafseer",
      status: "ACTIVE",
      assignedBy: testUser._id,
    });

    if (!createdAssignment || !createdAssignment._id) {
      throw new Error("Failed to create faculty assignment!");
    }
    console.log(`✓ FacultyAssignment successfully created: ${createdAssignment._id}`);
    console.log(`  Faculty: ${createdAssignment.facultyId.nameEnglish}`);
    console.log(`  Class:   ${createdAssignment.classId.name}`);
    console.log(`  Subject: ${createdAssignment.subjectId.name}`);

    // Verify backward-compatible cache sync in FacultyProfile
    const refreshedFaculty = await FacultyProfile.findById(testFaculty._id);
    const hasClassInCache = refreshedFaculty.assignedClasses.some(
      (c) => c.toString() === testClass._id.toString()
    );
    const hasSubjectInCache = refreshedFaculty.assignedSubjects.some(
      (s) => s.toString() === testSubject._id.toString()
    );
    if (!hasClassInCache || !hasSubjectInCache) {
      throw new Error("FacultyProfile cache synchronization failed!");
    }
    console.log("✓ FacultyProfile backward-compatible cache synced successfully.");

    // 7. Test Duplicate Prevention (Unique Constraint)
    console.log("\n[Test 7] Testing Duplicate Assignment Rejection...");
    let duplicateCaught = false;
    try {
      await facultyAssignmentService.createAssignment({
        facultyId: testFaculty._id,
        academicYearId: testAcademicYear._id,
        classId: testClass._id,
        subjectId: testSubject._id,
        status: "ACTIVE",
      });
    } catch (dupErr) {
      duplicateCaught = true;
      console.log(`✓ Duplicate rejected correctly with status ${dupErr.statusCode}: "${dupErr.message}"`);
    }
    if (!duplicateCaught) {
      throw new Error("Duplicate assignment was unexpectedly allowed!");
    }

    // 8. Test Academic Authorization Helpers
    console.log("\n[Test 8] Testing Academic Authorization Helper Functions...");
    const isAssignedPos = await academicAuthService.isFacultyAssigned({
      facultyId: testUser._id, // Test using user._id
      classId: testClass._id,
      subjectId: testSubject._id,
    });
    if (!isAssignedPos) {
      throw new Error("isFacultyAssigned returned false for an authorized faculty member!");
    }
    console.log("✓ isFacultyAssigned correctly verified positive assignment.");

    const isAssignedNeg = await academicAuthService.isFacultyAssigned({
      facultyId: testUser._id,
      classId: new mongoose.Types.ObjectId(), // Unassigned class
    });
    if (isAssignedNeg) {
      throw new Error("isFacultyAssigned returned true for an unassigned class!");
    }
    console.log("✓ isFacultyAssigned correctly rejected unassigned class.");

    // Test getFacultyAuthorizedClasses
    const authClasses = await academicAuthService.getFacultyAuthorizedClasses(testUser._id);
    if (authClasses.length !== 1 || authClasses[0]._id.toString() !== testClass._id.toString()) {
      throw new Error("getFacultyAuthorizedClasses failed to return the exact assigned class!");
    }
    console.log(`✓ getFacultyAuthorizedClasses returned ${authClasses.length} authorized class: "${authClasses[0].name}"`);

    // Test getFacultyAuthorizedStudents
    const authStudents = await academicAuthService.getFacultyAuthorizedStudents(testUser._id, testClass._id);
    if (authStudents.length !== 1 || authStudents[0]._id.toString() !== testStudent._id.toString()) {
      throw new Error("getFacultyAuthorizedStudents failed to return enrolled student!");
    }
    console.log(`✓ getFacultyAuthorizedStudents returned ${authStudents.length} student: "${authStudents[0].nameEnglish}"`);

    // 9. Test Faculty "My Classes" Grouped Query
    console.log("\n[Test 9] Testing Faculty 'My Classes' Query...");
    const myClasses = await facultyAssignmentService.getFacultyMyClasses(testUser._id);
    if (myClasses.length !== 1) {
      throw new Error(`getFacultyMyClasses expected 1 class, got ${myClasses.length}`);
    }
    const myClass = myClasses[0];
    console.log(`✓ Faculty My Classes: "${myClass.name}" (Students Enrolled: ${myClass.studentCount})`);
    console.log(`  Subjects taught: ${myClass.subjects.map((s) => s.name).join(", ")}`);
    if (myClass.studentCount !== 1) {
      throw new Error(`Expected studentCount 1, got ${myClass.studentCount}`);
    }
    if (myClass.subjects.length !== 1 || myClass.subjects[0]._id.toString() !== testSubject._id.toString()) {
      throw new Error("Subject missing in getFacultyMyClasses output!");
    }

    // 10. Test Student "My Teachers" Query
    console.log("\n[Test 10] Testing Student 'My Teachers' Query...");
    const studentTeachers = await studentService.getStudentTeachers(testClass._id);
    console.log(`✓ Student Teachers returned ${studentTeachers.length} entries.`);
    if (studentTeachers.length === 0) {
      throw new Error("getStudentTeachers returned empty list!");
    }
    const firstSubject = studentTeachers[0];
    console.log(`  Subject: "${firstSubject.subjectName}" -> Teacher: "${firstSubject.teacher?.nameEnglish}" (${firstSubject.teacher?.designation})`);
    if (!firstSubject.teacher || firstSubject.teacher.nameEnglish !== testFaculty.nameEnglish) {
      throw new Error("Teacher in getStudentTeachers does not match assigned faculty member!");
    }

    // 11. Test Deletion / Unassign
    console.log("\n[Test 11] Testing Unassign / Delete Faculty Assignment...");
    await facultyAssignmentService.deleteAssignment(createdAssignment._id);
    const afterDelete = await FacultyAssignment.findById(createdAssignment._id);
    if (afterDelete) {
      throw new Error("Assignment was not deleted!");
    }
    console.log("✓ Faculty assignment deleted successfully.");

    // Verify authorization helper immediately denies access
    const isAssignedAfterDelete = await academicAuthService.isFacultyAssigned({
      facultyId: testUser._id,
      classId: testClass._id,
      subjectId: testSubject._id,
    });
    if (isAssignedAfterDelete) {
      throw new Error("Faculty is still authorized after assignment was deleted!");
    }
    console.log("✓ Authorization helper immediately denies access after assignment deletion.");

    console.log("\n=================================================");
    console.log("ALL 11 PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY! ✓");
    console.log("=================================================\n");
  } catch (err) {
    console.error("\n❌ PHASE 1 TEST FAILED:", err);
    throw err;
  } finally {
    // Cleanup test artifacts
    console.log("Cleaning up test records...");
    if (createdAssignment) await FacultyAssignment.findByIdAndDelete(createdAssignment._id).catch(() => {});
    if (testStudent) await StudentProfile.findByIdAndDelete(testStudent._id).catch(() => {});
    if (testStudentUser) await User.findByIdAndDelete(testStudentUser._id).catch(() => {});
    if (testFaculty) await FacultyProfile.findByIdAndDelete(testFaculty._id).catch(() => {});
    if (testUser) await User.findByIdAndDelete(testUser._id).catch(() => {});
    if (testClass) await Class.findByIdAndDelete(testClass._id).catch(() => {});
    if (testSubject) await Subject.findByIdAndDelete(testSubject._id).catch(() => {});
    if (testAcademicYear) await AcademicYear.findByIdAndDelete(testAcademicYear._id).catch(() => {});
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

if (require.main === module) {
  runPhase1Tests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runPhase1Tests;
