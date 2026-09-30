/**
 * testItem5BulkStudentClassAssignment.js
 * Verification test suite for Item 5: Bulk Student Class Assignment
 *
 * Verifies:
 * 1. Role guards: Unauthenticated (401), Non-admin (Faculty/Student: 403)
 * 2. Class validation: Invalid ID format (400), Non-existent class (404), Inactive class (400)
 * 3. Mixed batch partial success with proper categorisation:
 *    - INVALID_ID: Malformed ObjectId string
 *    - NOT_FOUND: Non-existent profile
 *    - DELETED: Soft-deleted profile
 *    - ALREADY_IN_CLASS: Profile already in target class
 *    - Deduplication: Duplicates in input array deduped
 *    - Valid students updated atomically in single updateMany
 * 4. Institution consistency: If class has institutionId, student.institutionId is synchronized
 */

require("dotenv").config({ path: "backend/.env" });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const InstitutionProfile = require("../src/modules/institutions/institution.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const makeRequest = (port, options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, ...options }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("==================================================================");
  console.log("ITEM 5 VERIFICATION: BULK STUDENT CLASS ASSIGNMENT");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const tag = `test_i5_${Date.now()}`;
  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupInstIds = [];

  try {
    // 0. Academic Year & Institution
    const academicYear = await AcademicYear.create({
      yearName: `AY ${tag}`,
      yearCode: `Y${Date.now().toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const instUser = await User.create({
      name: `Inst Admin ${tag}`,
      email: `inst.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "INSTITUTION",
      status: "ACTIVE",
    });
    cleanupUserIds.push(instUser._id);

    const institution = await InstitutionProfile.create({
      userId: instUser._id,
      institutionName: `Institution ${tag}`,
      institutionCode: `INS${Date.now().toString().slice(-4)}`,
      type: "DIRECT",
      address: "Main Campus Road, Karanthur, Kozhikode, Kerala 673570",
      contactNumber: "9876543210",
      email: `inst.${tag}@markaz.in`,
      status: "ACTIVE",
    });
    cleanupInstIds.push(institution._id);



    // 1. Classes: Class A (Source), Class B (Target Active), Class C (Target Inactive)
    const classA = await Class.create({
      name: `Class A ${tag}`,
      code: `CA-${Date.now().toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    const classB = await Class.create({
      name: `Class B ${tag}`,
      code: `CB-${Date.now().toString().slice(-4)}`,
      academicYearId: academicYear._id,
      institutionId: institution._id, // Has institution
      status: "ACTIVE",
    });
    const classCInactive = await Class.create({
      name: `Class C Inactive ${tag}`,
      code: `CC-${Date.now().toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "INACTIVE",
    });
    cleanupClassIds.push(classA._id, classB._id, classCInactive._id);

    // 2. Users & Profiles
    const adminUser = await User.create({
      name: "Admin User",
      email: `admin.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "ADMIN",
      status: "ACTIVE",
    });
    const facultyUser = await User.create({
      name: "Faculty User",
      email: `faculty.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    const studentUser = await User.create({
      name: "Student User",
      email: `student.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id, facultyUser._id, studentUser._id);

    const tokenAdmin = createToken(adminUser.toObject());
    const tokenFaculty = createToken(facultyUser.toObject());
    const tokenStudent = createToken(studentUser.toObject());

    // Student 1 (in Class A)
    const sUser1 = await User.create({
      name: "Student 1",
      email: `s1.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const student1 = await StudentProfile.create({
      userId: sUser1._id,
      registrationNumber: `REG-S1-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student One",
      admissionYear: 2026,
      classId: classA._id,
      fatherName: "Father 1",
      motherName: "Mother 1",
      dateOfBirth: new Date("2008-01-01"),
    });

    // Student 2 (in Class A)
    const sUser2 = await User.create({
      name: "Student 2",
      email: `s2.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const student2 = await StudentProfile.create({
      userId: sUser2._id,
      registrationNumber: `REG-S2-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Two",
      admissionYear: 2026,
      classId: classA._id,
      fatherName: "Father 2",
      motherName: "Mother 2",
      dateOfBirth: new Date("2008-02-02"),
    });

    // Student 3 (ALREADY in Class B)
    const sUser3 = await User.create({
      name: "Student 3",
      email: `s3.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const student3 = await StudentProfile.create({
      userId: sUser3._id,
      registrationNumber: `REG-S3-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Three",
      admissionYear: 2026,
      classId: classB._id, // Already in Class B!
      fatherName: "Father 3",
      motherName: "Mother 3",
      dateOfBirth: new Date("2008-03-03"),
    });

    // Student 4 (DELETED)
    const sUser4 = await User.create({
      name: "Student 4 Deleted",
      email: `s4.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const student4 = await StudentProfile.create({
      userId: sUser4._id,
      registrationNumber: `REG-S4-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Four Deleted",
      admissionYear: 2026,
      classId: classA._id,
      isDeleted: true, // DELETED
      fatherName: "Father 4",
      motherName: "Mother 4",
      dateOfBirth: new Date("2008-04-04"),
    });

    cleanupUserIds.push(sUser1._id, sUser2._id, sUser3._id, sUser4._id);
    cleanupProfileIds.push(student1._id, student2._id, student3._id, student4._id);

    console.log("[3/5] Test domain fixtures established.");

    // --- TEST 1: Role Guards ---
    console.log("\n--- TEST 1: Role Guard on POST /api/admin/students/bulk-assign ---");
    const resNoAuth = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: { "Content-Type": "application/json" },
    }, { classId: classB._id.toString(), studentIds: [student1._id.toString()] });
    console.log(`Unauthenticated -> HTTP Status: ${resNoAuth.status}`);
    if (resNoAuth.status !== 401) throw new Error("Expected 401 for unauthenticated request");

    const resStudent = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStudent}`,
      },
    }, { classId: classB._id.toString(), studentIds: [student1._id.toString()] });
    console.log(`Student role -> HTTP Status: ${resStudent.status}`);
    if (resStudent.status !== 403) throw new Error("Expected 403 for student role");

    const resFaculty = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFaculty}`,
      },
    }, { classId: classB._id.toString(), studentIds: [student1._id.toString()] });
    console.log(`Faculty role -> HTTP Status: ${resFaculty.status}`);
    if (resFaculty.status !== 403) throw new Error("Expected 403 for faculty role");
    console.log("Test 1 Result: PASSED (Strict ADMIN role guard enforced)");

    // --- TEST 2: Class Validation ---
    console.log("\n--- TEST 2: Class Validation (Invalid, Non-existent, Inactive) ---");
    // 2a. Invalid classId format
    const resInvalidClass = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
    }, { classId: "invalid-id-123", studentIds: [student1._id.toString()] });
    console.log(`Invalid classId format -> HTTP Status: ${resInvalidClass.status}`);
    if (resInvalidClass.status !== 400) throw new Error("Expected 400 for invalid classId format");

    // 2b. Non-existent classId
    const fakeClassId = new mongoose.Types.ObjectId().toString();
    const resNotFoundClass = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
    }, { classId: fakeClassId, studentIds: [student1._id.toString()] });
    console.log(`Non-existent classId -> HTTP Status: ${resNotFoundClass.status}`);
    if (resNotFoundClass.status !== 404) throw new Error("Expected 404 for non-existent class");

    // 2c. Inactive class
    const resInactiveClass = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
    }, { classId: classCInactive._id.toString(), studentIds: [student1._id.toString()] });
    console.log(`Inactive class -> HTTP Status: ${resInactiveClass.status}:`, resInactiveClass.body?.message || resInactiveClass.body);
    if (resInactiveClass.status !== 400) throw new Error("Expected 400 for inactive class");
    console.log("Test 2 Result: PASSED (Class validation strictly verified)");

    // --- TEST 3: Mixed Batch Partial Success & Deduplication ---
    console.log("\n--- TEST 3: Mixed Batch Partial Success & Deduplication ---");
    const nonExistentStudentId = new mongoose.Types.ObjectId().toString();
    const malformedId = "bad-id-xyz";

    const payload = {
      classId: classB._id.toString(),
      studentIds: [
        student1._id.toString(), // Valid -> will be updated to Class B
        student1._id.toString(), // Duplicate of student1 -> should be deduped!
        student2._id.toString(), // Valid -> will be updated to Class B
        student3._id.toString(), // ALREADY_IN_CLASS (already in Class B)
        student4._id.toString(), // DELETED (isDeleted=true)
        nonExistentStudentId,    // NOT_FOUND
        malformedId,             // INVALID_ID
      ],
    };

    const resBulk = await makeRequest(port, {
      method: "POST",
      path: "/api/admin/students/bulk-assign",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
    }, payload);

    console.log(`Bulk assign response -> HTTP Status: ${resBulk.status}:`, JSON.stringify(resBulk.body, null, 2));
    if (resBulk.status !== 200 || !resBulk.body.success) {
      throw new Error("Expected 200 OK for mixed batch partial success");
    }

    const { updatedCount, skipped } = resBulk.body.data;
    console.log(`Asserting updatedCount: ${updatedCount} (expected: 2)`);
    if (updatedCount !== 2) throw new Error(`Expected updatedCount=2, got ${updatedCount}`);

    // Verify skipped list
    console.log(`Asserting skipped entries count: ${skipped.length} (expected: 4)`);
    if (skipped.length !== 4) throw new Error(`Expected 4 skipped entries, got ${skipped.length}`);

    const skippedReasons = {};
    skipped.forEach((s) => (skippedReasons[s.studentId] = s.reason));

    if (skippedReasons[student3._id.toString()] !== "ALREADY_IN_CLASS") {
      throw new Error(`Expected ALREADY_IN_CLASS for student 3, got: ${skippedReasons[student3._id.toString()]}`);
    }
    if (skippedReasons[student4._id.toString()] !== "DELETED") {
      throw new Error(`Expected DELETED for student 4, got: ${skippedReasons[student4._id.toString()]}`);
    }
    if (skippedReasons[nonExistentStudentId] !== "NOT_FOUND") {
      throw new Error(`Expected NOT_FOUND for nonExistentStudentId, got: ${skippedReasons[nonExistentStudentId]}`);
    }
    if (skippedReasons[malformedId] !== "INVALID_ID") {
      throw new Error(`Expected INVALID_ID for malformedId, got: ${skippedReasons[malformedId]}`);
    }
    console.log("Test 3 Result: PASSED (All skip reasons properly identified, duplicates deduped)");

    // --- TEST 4: Database State & Institution Consistency Verification ---
    console.log("\n--- TEST 4: Verify DB records updated & institution synchronized ---");
    const updatedS1 = await StudentProfile.findById(student1._id);
    const updatedS2 = await StudentProfile.findById(student2._id);
    const untouchedS3 = await StudentProfile.findById(student3._id);

    if (updatedS1.classId.toString() !== classB._id.toString()) {
      throw new Error(`Student 1 classId mismatch: ${updatedS1.classId}`);
    }
    if (updatedS2.classId.toString() !== classB._id.toString()) {
      throw new Error(`Student 2 classId mismatch: ${updatedS2.classId}`);
    }
    if (updatedS1.institutionId.toString() !== institution._id.toString()) {
      throw new Error(`Student 1 institutionId not synchronized with Class B institution: ${updatedS1.institutionId}`);
    }
    if (updatedS2.institutionId.toString() !== institution._id.toString()) {
      throw new Error(`Student 2 institutionId not synchronized with Class B institution: ${updatedS2.institutionId}`);
    }
    if (untouchedS3.classId.toString() !== classB._id.toString()) {
      throw new Error(`Student 3 was unexpectedly altered: ${untouchedS3.classId}`);
    }

    console.log("Test 4 Result: PASSED (Database records updated atomically and institution synchronized)");

    console.log("\n==================================================================");
    console.log("ALL ITEM 5 BULK STUDENT CLASS ASSIGNMENT TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      Class.deleteMany({ _id: { $in: cleanupClassIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } }),
      InstitutionProfile.deleteMany({ _id: { $in: cleanupInstIds } }),
    ]);
    console.log("[5/5] Cleanup complete. Server closed.");
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
