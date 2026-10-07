const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Subject = require("../src/modules/academics/subject.model");
const Syllabus = require("../src/modules/academics/syllabus.model");
const Institution = require("../src/modules/institutions/institution.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamResult = require("../src/modules/exams/exam-result.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runE2EPhase5Tests() {
  console.log("==================================================================");
  console.log("PHASE 5 END-TO-END VERIFICATION: SYLLABUS + PARENT PORTAL IMPROVEMENTS");
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
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupSubjectIds = [];
  const cleanupSyllabusIds = [];
  const cleanupInstitutionIds = [];
  const cleanupExamIds = [];
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
    // SETUP TEST FIXTURES
    // -------------------------------------------------------------
    console.log("\n--- Seeding Test Fixtures ---");

    // 1. Institution
    const instUser = await User.create({
      name: `Institution User ${timestamp}`,
      email: `inst_p5_${timestamp}@markaz.in`,
      passwordHash: "dummyhash",
      role: "INSTITUTION",
      status: "ACTIVE",
    });
    cleanupUserIds.push(instUser._id);

    const testInstitution = await Institution.create({
      userId: instUser._id,
      institutionName: `Phase 5 Test Institution ${timestamp}`,
      institutionCode: `P5INST${Date.now().toString().slice(-4)}`,
      type: "DIRECT",
      address: "Main Campus Road, Karanthur, Kozhikode, Kerala 673570",
      contactNumber: "9876543210",
      email: `inst_p5_${timestamp}@markaz.in`,
      status: "ACTIVE",
    });
    cleanupInstitutionIds.push(testInstitution._id);

    // 2. Academic Year
    const testYear = await AcademicYear.create({
      yearName: `2026-2027-${timestamp}`,
      yearCode: `AY-${timestamp}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(testYear._id);

    // 3. Classes
    const classA = await Class.create({
      name: `Class 10A-${timestamp}`,
      code: `C10A-${timestamp}`,
      academicYearId: testYear._id,
      institutionId: testInstitution._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classA._id);

    const classB = await Class.create({
      name: `Class 10B-${timestamp}`,
      code: `C10B-${timestamp}`,
      academicYearId: testYear._id,
      institutionId: testInstitution._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classB._id);

    const classC = await Class.create({
      name: `Class 10C (Unlinked)-${timestamp}`,
      code: `C10C-${timestamp}`,
      academicYearId: testYear._id,
      institutionId: testInstitution._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classC._id);

    // 4. Subjects
    const subjectA = await Subject.create({
      subjectName: `Fiqh Studies-${timestamp}`,
      subjectCode: `FIQH-${timestamp}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subjectA._id);

    const subjectB = await Subject.create({
      subjectName: `Hadith Literature-${timestamp}`,
      subjectCode: `HADITH-${timestamp}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subjectB._id);

    // 5. Admin User
    const adminUser = await User.create({
      name: `Admin P5 ${timestamp}`,
      email: `admin_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // 6. Student 1 (assigned to Class A)
    const student1User = await User.create({
      name: `Student One P5 ${timestamp}`,
      email: `student1_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(student1User._id);

    const student1Profile = await StudentProfile.create({
      userId: student1User._id,
      nameEnglish: `Student One P5 ${timestamp}`,
      registrationNumber: `REG1-${timestamp}`,
      admissionNumber: `ADM1-${timestamp.toString().slice(-4)}`,
      fatherName: "Father One",
      motherName: "Mother One",
      dateOfBirth: new Date("2008-01-01"),
      classId: classA._id,
      institutionId: testInstitution._id,
      admissionYear: 2026,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(student1Profile._id);

    const student1Token = generateToken({
      userId: student1User._id.toString(),
      email: student1User.email,
      role: student1User.role,
      studentId: student1Profile._id.toString(),
    });

    // 7. Student 2 (assigned to Class B)
    const student2User = await User.create({
      name: `Student Two P5 ${timestamp}`,
      email: `student2_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(student2User._id);

    const student2Profile = await StudentProfile.create({
      userId: student2User._id,
      nameEnglish: `Student Two P5 ${timestamp}`,
      registrationNumber: `REG2-${timestamp}`,
      admissionNumber: `ADM2-${timestamp.toString().slice(-4)}`,
      fatherName: "Father Two",
      motherName: "Mother Two",
      dateOfBirth: new Date("2008-02-02"),
      classId: classB._id,
      institutionId: testInstitution._id,
      admissionYear: 2026,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(student2Profile._id);

    const student2Token = generateToken({
      userId: student2User._id.toString(),
      email: student2User.email,
      role: student2User.role,
      studentId: student2Profile._id.toString(),
    });

    // 8. Student 3 (unlinked, assigned to Class C)
    const student3User = await User.create({
      name: `Student Three Unlinked ${timestamp}`,
      email: `student3_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(student3User._id);

    const student3Profile = await StudentProfile.create({
      userId: student3User._id,
      nameEnglish: `Student Three Unlinked ${timestamp}`,
      registrationNumber: `REG3-${timestamp}`,
      admissionNumber: `ADM3-${timestamp.toString().slice(-4)}`,
      fatherName: "Father Three",
      motherName: "Mother Three",
      dateOfBirth: new Date("2008-03-03"),
      classId: classC._id,
      institutionId: testInstitution._id,
      admissionYear: 2026,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(student3Profile._id);

    // 9. Parent 1 (linked to Student 1 & Student 2)
    const parent1User = await User.create({
      name: `Parent One Guardian ${timestamp}`,
      email: `parent1_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parent1User._id);

    const parent1Profile = await ParentProfile.create({
      userId: parent1User._id,
      name: `Parent One Guardian ${timestamp}`,
      relationType: "FATHER",
      studentIds: [student1Profile._id, student2Profile._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parent1Profile._id);

    const parent1Token = generateToken({
      userId: parent1User._id.toString(),
      email: parent1User.email,
      role: parent1User.role,
      parentId: parent1Profile._id.toString(),
      parentStudentIds: [student1Profile._id.toString(), student2Profile._id.toString()],
    });

    // 10. Parent 2 (linked only to Student 3)
    const parent2User = await User.create({
      name: `Parent Two Other ${timestamp}`,
      email: `parent2_p5_${timestamp}@test.edu`,
      passwordHash: "dummyhash",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parent2User._id);

    const parent2Profile = await ParentProfile.create({
      userId: parent2User._id,
      name: `Parent Two Other ${timestamp}`,
      relationType: "MOTHER",
      studentIds: [student3Profile._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parent2Profile._id);

    const parent2Token = generateToken({
      userId: parent2User._id.toString(),
      email: parent2User.email,
      role: parent2User.role,
      parentId: parent2Profile._id.toString(),
      parentStudentIds: [student3Profile._id.toString()],
    });

    console.log("Seeding complete. Beginning Test Executions...\n");

    let syllabusA1Id = null;
    let syllabusA2Id = null;
    let syllabusBId = null;
    let syllabusCId = null;

    // -------------------------------------------------------------
    // PART 1: ADMIN SYLLABUS MANAGEMENT & VALIDATION
    // -------------------------------------------------------------
    console.log("--- Part 1: Admin Syllabus Management & Uniqueness ---");

    // TC-1: Admin creates syllabus for Class A, Subject A (ANNUAL)
    const createRes1 = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Fathul Mueen - Tahara & Salah",
        title: "Fathul Mueen - Tahara & Salah",
        description: "Comprehensive jurisprudence curriculum",
        classId: classA._id.toString(),
        subjectId: subjectA._id.toString(),
        academicYearId: testYear._id.toString(),
        institutionId: testInstitution._id.toString(),
        examType: "ANNUAL",
        units: [
          {
            unitNumber: 1,
            title: "Kitab At-Tahara",
            order: 1,
            plannedHours: 24,
            topics: [
              { title: "Purification Fundamentals", isCompleted: false },
              { title: "Ablution Nullifiers", isCompleted: false },
            ],
          },
          {
            unitNumber: 2,
            title: "Kitab As-Salah",
            order: 2,
            plannedHours: 36,
            topics: [
              { title: "Prayer Timings & Pillars", isCompleted: false },
            ],
          },
        ],
        status: "PUBLISHED",
      }),
    });
    const createData1 = await createRes1.json();
    if (createRes1.status !== 201) {
      console.log("TC-1 Failed with status:", createRes1.status, createData1);
    }
    syllabusA1Id = createData1.data?._id;
    if (syllabusA1Id) cleanupSyllabusIds.push(syllabusA1Id);

    assert(
      createRes1.status === 201 && createData1.success && createData1.data?.kitabName === "Fathul Mueen - Tahara & Salah",
      "Admin successfully creates syllabus for Class A / Subject A (ANNUAL)"
    );

    // TC-2: Duplicate syllabus rejection (409 Conflict)
    const dupRes = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Duplicate Fathul Mueen",
        classId: classA._id.toString(),
        subjectId: subjectA._id.toString(),
        academicYearId: testYear._id.toString(),
        examType: "ANNUAL",
      }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 409 && !dupData.success,
      "Duplicate syllabus creation for same (class, subject, year, examType) is rejected with 409 Conflict"
    );

    // TC-3: Different examType (HALF_YEARLY) for same class & subject succeeds
    const createRes2 = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Fathul Mueen - Mid-term Portions",
        classId: classA._id.toString(),
        subjectId: subjectA._id.toString(),
        academicYearId: testYear._id.toString(),
        examType: "HALF_YEARLY",
        units: [{ unitNumber: 1, title: "Half-Yearly Units", order: 1, plannedHours: 20 }],
        status: "PUBLISHED",
      }),
    });
    const createData2 = await createRes2.json();
    syllabusA2Id = createData2.data?._id;
    if (syllabusA2Id) cleanupSyllabusIds.push(syllabusA2Id);
    assert(
      createRes2.status === 201 && createData2.data?.examType === "HALF_YEARLY",
      "Admin successfully creates HALF_YEARLY syllabus for same class & subject"
    );

    // TC-4: Admin creates syllabus for Class B, Subject B (ANNUAL)
    const createRes3 = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Bulugh al-Maram - Hadith Principles",
        classId: classB._id.toString(),
        subjectId: subjectB._id.toString(),
        academicYearId: testYear._id.toString(),
        examType: "ANNUAL",
        units: [{ unitNumber: 1, title: "Kitab al-Jana'iz", order: 1, plannedHours: 15 }],
        status: "PUBLISHED",
      }),
    });
    const createData3 = await createRes3.json();
    syllabusBId = createData3.data?._id;
    if (syllabusBId) cleanupSyllabusIds.push(syllabusBId);
    assert(
      createRes3.status === 201 && createData3.data?.kitabName.includes("Bulugh al-Maram"),
      "Admin creates syllabus for Class B / Subject B (ANNUAL)"
    );

    // TC-5: Admin creates syllabus for Class C (Unlinked class)
    const createRes4 = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Class C Exclusive Kitab",
        classId: classC._id.toString(),
        subjectId: subjectA._id.toString(),
        academicYearId: testYear._id.toString(),
        examType: "ANNUAL",
        units: [{ unitNumber: 1, title: "Class C Unit", order: 1 }],
        status: "PUBLISHED",
      }),
    });
    const createData4 = await createRes4.json();
    syllabusCId = createData4.data?._id;
    if (syllabusCId) cleanupSyllabusIds.push(syllabusCId);
    assert(
      createRes4.status === 201 && createData4.data?._id,
      "Admin creates syllabus for Class C (Unlinked student class)"
    );

    // TC-6: Admin lists syllabuses with query filter (classId)
    const listRes = await fetch(`${baseUrl}/academics/syllabuses?classId=${classA._id.toString()}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    const classASyllabuses = listData.data || [];
    assert(
      listRes.status === 200 &&
        classASyllabuses.length === 2 &&
        classASyllabuses.every((s) => s.classId?._id?.toString() === classA._id.toString()),
      "Admin lists syllabuses filtered by classId accurately"
    );

    // TC-7: Admin updates syllabus units & completion
    const updateRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        kitabName: "Fathul Mueen - Updated Edition",
        units: [
          {
            unitNumber: 1,
            title: "Kitab At-Tahara (Updated)",
            order: 1,
            plannedHours: 30,
            topics: [{ title: "Purification Fundamentals", isCompleted: true }],
          },
        ],
      }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
        updateData.data?.kitabName === "Fathul Mueen - Updated Edition" &&
        updateData.data?.completionPercentage === 100,
      "Admin updates syllabus units and auto-computes completion percentage"
    );

    // TC-8: Admin update conflict rejection (409)
    // Try updating syllabusA2Id (HALF_YEARLY) to ANNUAL, which would conflict with syllabusA1Id (ANNUAL)
    const conflictUpdateRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA2Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        examType: "ANNUAL",
      }),
    });
    const conflictUpdateData = await conflictUpdateRes.json();
    assert(
      conflictUpdateRes.status === 409 && !conflictUpdateData.success,
      "Admin updating syllabus to conflict with an existing entry is rejected with 409 Conflict"
    );

    // TC-9: Soft-delete / Deactivate syllabus
    const deleteRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA2Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json();
    assert(
      deleteRes.status === 200 && deleteData.success,
      "Admin soft-deactivates syllabus successfully"
    );

    // TC-10: Inactive/deleted syllabus excluded from active list
    const activeListRes = await fetch(`${baseUrl}/academics/syllabuses?classId=${classA._id.toString()}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const activeListData = await activeListRes.json();
    const activeList = activeListData.data || [];
    assert(
      !activeList.some((s) => s._id.toString() === syllabusA2Id.toString()),
      "Soft-deleted syllabus is filtered out and absent from active listings"
    );

    // -------------------------------------------------------------
    // PART 2: STUDENT SYLLABUS SCOPING & MUTATION GUARDS
    // -------------------------------------------------------------
    console.log("\n--- Part 2: Student Syllabus Scoping & Security ---");

    // TC-11: Student 1 views syllabus for own assigned Class A
    const s1ListRes = await fetch(`${baseUrl}/academics/syllabuses`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1ListData = await s1ListRes.json();
    const s1Syllabuses = s1ListData.data || [];
    assert(
      s1ListRes.status === 200 &&
        s1Syllabuses.length > 0 &&
        s1Syllabuses.every((s) => s.classId?._id?.toString() === classA._id.toString()),
      "Student 1 automatically receives syllabuses scoped strictly to their assigned class"
    );

    // TC-12: Student 1 cannot query another class (Class B)
    const s1QueryClassBRes = await fetch(`${baseUrl}/academics/syllabuses?classId=${classB._id.toString()}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      s1QueryClassBRes.status === 403,
      "Student 1 querying syllabus for unassigned Class B is blocked with 403 Forbidden"
    );

    // TC-13: Student 1 cannot view syllabus details of Class B by ID
    const s1GetSylBRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusBId}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      s1GetSylBRes.status === 403,
      "Student 1 accessing syllabus of another class directly by ID is blocked with 403 Forbidden"
    );

    // TC-14: Student role cannot mutate syllabuses (POST/PUT/DELETE)
    const s1CreateRes = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({
        kitabName: "Hacked Syllabus",
        classId: classA._id.toString(),
      }),
    });
    const s1UpdateRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({ kitabName: "Hacked Title" }),
    });
    const s1DeleteRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      s1CreateRes.status === 403 && s1UpdateRes.status === 403 && s1DeleteRes.status === 403,
      "Student mutation attempts (POST, PUT, DELETE) are all blocked with 403 Forbidden"
    );

    // -------------------------------------------------------------
    // PART 3: PARENT SYLLABUS & PORTAL IMPROVEMENTS
    // -------------------------------------------------------------
    console.log("\n--- Part 3: Parent Syllabus & Portal Improvements ---");

    // TC-15: Parent 1 loads linked students list
    const parentStudentsRes = await fetch(`${baseUrl}/parents/students`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const parentStudentsData = await parentStudentsRes.json();
    const p1Students = parentStudentsData.students || [];
    assert(
      parentStudentsRes.status === 200 &&
        p1Students.length === 2 &&
        p1Students.some((s) => s._id.toString() === student1Profile._id.toString()) &&
        p1Students.some((s) => s._id.toString() === student2Profile._id.toString()),
      "Parent 1 successfully retrieves list of all linked children with class profiles"
    );

    // TC-16: Parent 1 views syllabus for linked Child 1 (Class A)
    const p1SylChild1Res = await fetch(`${baseUrl}/parents/students/${student1Profile._id.toString()}/syllabus`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const p1SylChild1Data = await p1SylChild1Res.json();
    const p1Child1List = p1SylChild1Data.syllabuses || [];
    assert(
      p1SylChild1Res.status === 200 &&
        p1Child1List.length > 0 &&
        p1Child1List.every((s) => s.classId?._id?.toString() === classA._id.toString()),
      "Parent 1 views syllabus for linked Child 1 scoped accurately to Class A"
    );

    // TC-17: Parent 1 views syllabus for linked Child 2 (Class B)
    const p1SylChild2Res = await fetch(`${baseUrl}/parents/students/${student2Profile._id.toString()}/syllabus`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const p1SylChild2Data = await p1SylChild2Res.json();
    const p1Child2List = p1SylChild2Data.syllabuses || [];
    assert(
      p1SylChild2Res.status === 200 &&
        p1Child2List.length > 0 &&
        p1Child2List.every((s) => s.classId?._id?.toString() === classB._id.toString()),
      "Parent 1 views distinct syllabus for linked Child 2 scoped accurately to Class B"
    );

    // TC-18: Parent IDOR Prevention: Parent 1 cannot view syllabus of unlinked Child 3
    const p1SylChild3Res = await fetch(`${baseUrl}/parents/students/${student3Profile._id.toString()}/syllabus`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const p1SylChild3Data = await p1SylChild3Res.json();
    assert(
      p1SylChild3Res.status === 403 && !p1SylChild3Data.success,
      "Parent 1 attempting to view unlinked student's syllabus via /parents/students/:id/syllabus is blocked (403)"
    );

    // TC-19: Parent IDOR Prevention: Parent 1 querying unlinked Class C via academic endpoint is blocked
    const p1QueryClassCRes = await fetch(`${baseUrl}/academics/syllabuses?classId=${classC._id.toString()}`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    assert(
      p1QueryClassCRes.status === 403,
      "Parent 1 querying syllabus for unassociated Class C via academic API is blocked (403)"
    );

    // TC-20: Parent IDOR Prevention: Parent 1 accessing unlinked Class C syllabus by ID is blocked
    const p1GetSylCRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusCId}`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    assert(
      p1GetSylCRes.status === 403,
      "Parent 1 requesting unlinked syllabus by ID directly is blocked (403 Forbidden)"
    );

    // TC-21: Parent role cannot mutate syllabus (POST/PUT/DELETE)
    const p1CreateRes = await fetch(`${baseUrl}/academics/syllabuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${parent1Token}`,
      },
      body: JSON.stringify({ kitabName: "Parent Injected", classId: classA._id.toString() }),
    });
    const p1UpdateRes = await fetch(`${baseUrl}/academics/syllabuses/${syllabusA1Id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${parent1Token}`,
      },
      body: JSON.stringify({ kitabName: "Parent Altered" }),
    });
    assert(
      p1CreateRes.status === 403 && p1UpdateRes.status === 403,
      "Parent role mutation attempts (POST, PUT) are blocked with 403 Forbidden"
    );

    // -------------------------------------------------------------
    // PART 4: PHASE 2 RESULT PUBLICATION & GLOBAL SECURITY PRESERVATION
    // -------------------------------------------------------------
    console.log("\n--- Part 4: Phase 2 Result Scheduling Preservation & Auth Guards ---");

    // TC-22: Parent Exam Results: Unscheduled / Future results remain strictly hidden
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
    const scheduledExam = await Exam.create({
      name: `Scheduled Exam ${timestamp}`,
      code: `SCH-EXAM-${timestamp}`,
      academicYearId: testYear._id,
      institutionId: testInstitution._id,
      startDate: new Date(),
      endDate: new Date(),
      registrationStartDate: new Date(),
      registrationEndDate: new Date(),
      resultPublicationDate: futureDate,
      isResultPublished: true,
      status: "PUBLISHED",
    });
    cleanupExamIds.push(scheduledExam._id);

    const futureResult = await ExamResult.create({
      examId: scheduledExam._id,
      studentId: student1Profile._id,
      classId: classA._id,
      academicYearId: testYear._id,
      institutionId: testInstitution._id,
      subjectResults: [
        {
          subjectId: subjectA._id,
          subjectName: "Fiqh Studies",
          subjectCode: "FIQH",
          marksObtained: 95,
          maxMarks: 100,
          passMarks: 40,
          grade: "A+",
          resultStatus: "PASSED",
        },
      ],
      totalMarksObtained: 95,
      totalMaxMarks: 100,
      percentage: 95,
      grade: "A+",
      resultStatus: "PASSED",
      status: "PUBLISHED",
      publishedAt: futureDate,
    });
    cleanupResultIds.push(futureResult._id);

    // Parent queries exam results
    const parentExamRes = await fetch(`${baseUrl}/exams/exam-results?studentId=${student1Profile._id.toString()}`, {
      headers: { Authorization: `Bearer ${parent1Token}` },
    });
    const parentExamData = await parentExamRes.json();
    const parentVisibleResults = parentExamData.data || [];
    assert(
      !parentVisibleResults.some((r) => r.examId?._id?.toString() === scheduledExam._id.toString()),
      "Phase 2 Preservation: Results scheduled for the future remain hidden from parent before publication date"
    );

    // TC-23: Unauthenticated access blocked (401 Unauthorized)
    const anonRes = await fetch(`${baseUrl}/academics/syllabuses`);
    const anonParentRes = await fetch(`${baseUrl}/parents/students`);
    assert(
      anonRes.status === 401 && anonParentRes.status === 401,
      "Unauthenticated requests without JWT bearer token are rejected with 401 Unauthorized"
    );

    console.log("\n==================================================================");
    console.log(`ALL PHASE 5 TESTS PASSED: ${testPassedCount}/${testTotalCount} assertions successful.`);
    console.log("==================================================================\n");

  } finally {
    console.log("Cleaning up test resources...");
    try {
      if (cleanupResultIds.length) await ExamResult.deleteMany({ _id: { $in: cleanupResultIds } });
      if (cleanupExamIds.length) await Exam.deleteMany({ _id: { $in: cleanupExamIds } });
      if (cleanupSyllabusIds.length) await Syllabus.deleteMany({ _id: { $in: cleanupSyllabusIds } });
      if (cleanupSubjectIds.length) await Subject.deleteMany({ _id: { $in: cleanupSubjectIds } });
      if (cleanupClassIds.length) await Class.deleteMany({ _id: { $in: cleanupClassIds } });
      if (cleanupYearIds.length) await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
      if (cleanupInstitutionIds.length) await Institution.deleteMany({ _id: { $in: cleanupInstitutionIds } });
      if (cleanupParentIds.length) await ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } });
      if (cleanupProfileIds.length) await StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } });
      if (cleanupUserIds.length) await User.deleteMany({ _id: { $in: cleanupUserIds } });
      console.log("Cleanup completed.");
    } catch (cleanErr) {
      console.error("Cleanup error:", cleanErr);
    }

    server.close();
    await mongoose.disconnect();
  }
}

runE2EPhase5Tests().catch((err) => {
  console.error("Phase 5 E2E Test Suite Error:", err);
  process.exit(1);
});
