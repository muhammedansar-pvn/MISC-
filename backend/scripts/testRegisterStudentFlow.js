const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const InstitutionProfile = require("../src/modules/institutions/institution.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const { registerStudentWithAccount } = require("../src/modules/students/student.service");

async function runTests() {
  console.log("===============================================================");
  console.log("Starting Verification Tests: Atomic Student Registration Flow");
  console.log("===============================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI not found in backend/.env");
    process.exit(1);
  }

  const isAtlas = mongoUri.includes(".mongodb.net") || mongoUri.startsWith("mongodb+srv://");
  console.log(`[Environment] MongoDB URI detected: ${isAtlas ? "MongoDB Atlas (Replica Set)" : "Local/Standalone Mongod"}`);
  console.log(`[Environment] Connecting to database...`);
  await mongoose.connect(mongoUri);
  console.log(`[Environment] Connected successfully.\n`);

  const createdUserIds = [];
  const createdProfileIds = [];
  const createdInstIds = [];
  const createdClassIds = [];

  try {
    // Setup test institution and class if needed
    let testInst = await InstitutionProfile.findOne();
    if (!testInst) {
      const dummyUser = await User.create({
        name: "Test Institution User",
        email: `test-inst-user-${Date.now()}@test.com`,
        role: "INSTITUTION",
        status: "ACTIVE",
      });
      createdUserIds.push(dummyUser._id);
      testInst = await InstitutionProfile.create({
        userId: dummyUser._id,
        institutionName: "MISC Test Academy",
        institutionCode: `TA${Date.now().toString().slice(-4)}`,
        type: "DIRECT",
        address: "Test Campus, Kozhikode",
        contactNumber: "+91 9999999999",
        email: "test@miscacademy.org",
        status: "ACTIVE",
      });
      createdInstIds.push(testInst._id);
    }

    let testClass = await Class.findOne();
    if (!testClass) {
      const testYear = await AcademicYear.create({
        yearLabel: "2026-2027",
        startYear: 2026,
        endYear: 2027,
        status: "ACTIVE",
      });
      testClass = await Class.create({
        name: "First Year Sharia",
        code: `CLS${Date.now().toString().slice(-3)}`,
        institutionId: testInst._id,
        academicYearId: testYear._id,
        status: "ACTIVE",
      });
      createdClassIds.push(testClass._id);
    }

    // -------------------------------------------------------------
    // TEST CASE 1: Successful Atomic Registration
    // -------------------------------------------------------------
    console.log("--- TEST CASE 1: Successful Atomic Registration ---");
    const timestamp = Date.now();
    const testEmail1 = `atomic-test-std-${timestamp}@example.com`;
    const payload1 = {
      email: testEmail1,
      nameEnglish: "Ahmad Ansar",
      nameArabic: "أحمد أنصار",
      placeEnglish: "Calicut",
      placeArabic: "كالیكوت",
      dateOfBirth: "2006-05-15",
      admissionYear: 2026,
      classId: testClass._id.toString(),
      institutionId: testInst._id.toString(),
      contactNumber: "+91 9876543210",
      fatherName: "Abdullah",
      motherName: "Fathima",
      mobile: "+91 9876543210",
    };

    const result1 = await registerStudentWithAccount(payload1, { role: "ADMIN" });

    if (!result1 || !result1.student || !result1.student._id) {
      throw new Error("Test 1 Failed: registerStudentWithAccount did not return student profile");
    }

    createdProfileIds.push(result1.student._id);
    if (result1.student.userId) {
      createdUserIds.push(result1.student.userId._id || result1.student.userId);
    }

    // Verify DB records
    const userInDb1 = await User.findOne({ email: testEmail1 }).lean();
    const profileInDb1 = await StudentProfile.findById(result1.student._id).lean();

    if (!userInDb1) throw new Error("Test 1 Failed: User record not found in database");
    if (!profileInDb1) throw new Error("Test 1 Failed: StudentProfile record not found in database");
    if (userInDb1.role !== "STUDENT") throw new Error(`Test 1 Failed: User role is ${userInDb1.role}, expected STUDENT`);
    if (userInDb1.status !== "PENDING_SETUP") throw new Error(`Test 1 Failed: User status is ${userInDb1.status}, expected PENDING_SETUP`);
    if (!profileInDb1.registrationNumber || !profileInDb1.registrationNumber.startsWith("MISC")) {
      throw new Error(`Test 1 Failed: Invalid registrationNumber: ${profileInDb1.registrationNumber}`);
    }
    if (String(profileInDb1.userId) !== String(userInDb1._id)) {
      throw new Error("Test 1 Failed: StudentProfile userId does not match User _id");
    }

    console.log(`[PASS] Test Case 1 Passed:`);
    console.log(`       - User Created: ID=${userInDb1._id}, Role=${userInDb1.role}, Status=${userInDb1.status}`);
    console.log(`       - Student Profile Created: ID=${profileInDb1._id}`);
    console.log(`       - Auto-Generated Registration Number: ${profileInDb1.registrationNumber}`);
    console.log(`       - Linked Correctly: profile.userId == user._id\n`);

    // -------------------------------------------------------------
    // TEST CASE 2: Duplicate Email Rollback (No Orphan Records)
    // -------------------------------------------------------------
    console.log("--- TEST CASE 2: Duplicate Email Rollback ---");
    let duplicateErrorThrown = false;
    const initialUserCount = await User.countDocuments({ email: testEmail1 });
    const initialProfileCount = await StudentProfile.countDocuments({ userId: userInDb1._id });

    try {
      // Attempt to register again with identical email
      await registerStudentWithAccount(
        {
          ...payload1,
          nameEnglish: "Duplicate Attempt",
        },
        { role: "ADMIN" }
      );
    } catch (err) {
      duplicateErrorThrown = true;
      if (err.statusCode !== 409 && err.code !== 11000) {
        throw new Error(`Test 2 Failed: Expected 409 Conflict error, got ${err.statusCode || err.code}: ${err.message}`);
      }
      console.log(`       - Caught expected conflict error: "${err.message}" (Status: ${err.statusCode || 409})`);
    }

    if (!duplicateErrorThrown) {
      throw new Error("Test 2 Failed: Duplicate registration did NOT throw error!");
    }

    const postUserCount = await User.countDocuments({ email: testEmail1 });
    const postProfileCount = await StudentProfile.countDocuments({ userId: userInDb1._id });

    if (postUserCount !== initialUserCount) {
      throw new Error(`Test 2 Failed: Duplicate user was created! Expected ${initialUserCount}, found ${postUserCount}`);
    }
    if (postProfileCount !== initialProfileCount) {
      throw new Error(`Test 2 Failed: Orphan student profile was created!`);
    }

    console.log(`[PASS] Test Case 2 Passed:`);
    console.log(`       - Duplicate email rejected with 409 Conflict.`);
    console.log(`       - Verified NO second User or orphan StudentProfile created.\n`);

    // -------------------------------------------------------------
    // TEST CASE 3: Transaction Rollback on Profile Failure
    // -------------------------------------------------------------
    console.log("--- TEST CASE 3: Transaction Rollback on Mid-Operation Failure ---");
    const testEmail3 = `rollback-test-${Date.now()}@example.com`;
    let rollbackErrorThrown = false;

    // Verify user doesn't exist before test
    const preUser3 = await User.findOne({ email: testEmail3 });
    if (preUser3) throw new Error("Test 3 Pre-condition failed: test user already exists");

    try {
      // Pass a payload where User creation succeeds, but StudentProfile schema validation
      // fails due to invalid/missing required fatherName or date format at MongoDB level
      await registerStudentWithAccount(
        {
          email: testEmail3,
          nameEnglish: "Rollback Test Student",
          dateOfBirth: "invalid-date-format-for-mongo-cast-failure", // CastError in Mongoose
          admissionYear: 2026,
          fatherName: "Father",
          motherName: "Mother",
        },
        { role: "ADMIN" }
      );
    } catch (err) {
      rollbackErrorThrown = true;
      console.log(`       - Caught expected profile creation failure: "${err.message}"`);
    }

    if (!rollbackErrorThrown) {
      throw new Error("Test 3 Failed: Operation did not fail as expected");
    }

    // Verify User creation was ROLLED BACK (No orphan user in DB)
    const postUser3 = await User.findOne({ email: testEmail3 });
    const postProfile3 = await StudentProfile.findOne({ nameEnglish: "Rollback Test Student" });

    if (postUser3) {
      throw new Error(`Test 3 FAILED: Orphan User record (${postUser3._id}) was NOT rolled back!`);
    }
    if (postProfile3) {
      throw new Error(`Test 3 FAILED: Orphan StudentProfile record (${postProfile3._id}) was found!`);
    }

    console.log(`[PASS] Test Case 3 Passed:`);
    console.log(`       - Database transaction successfully rolled back.`);
    console.log(`       - Confirmed: Zero orphan User and zero orphan StudentProfile records exist.\n`);

    // -------------------------------------------------------------
    // TEST CASE 4: Institution Scoping Override
    // -------------------------------------------------------------
    console.log("--- TEST CASE 4: Institution Scoping Enforcement ---");
    const testEmail4 = `inst-scope-test-${Date.now()}@example.com`;
    const anotherFakeInstId = new mongoose.Types.ObjectId(); // Attacker tries to inject this

    const payload4 = {
      email: testEmail4,
      nameEnglish: "Scoped Student",
      dateOfBirth: "2006-01-01",
      admissionYear: 2026,
      fatherName: "Father Scoped",
      motherName: "Mother Scoped",
      institutionId: anotherFakeInstId.toString(), // Malicious input attempting to bypass institution
    };

    // Caller is an INSTITUTION user locked to testInst._id
    const caller4 = {
      role: "INSTITUTION",
      institutionId: testInst._id,
    };

    const result4 = await registerStudentWithAccount(payload4, caller4);
    if (!result4 || !result4.student) {
      throw new Error("Test 4 Failed: Scoped student registration failed");
    }

    createdProfileIds.push(result4.student._id);
    if (result4.student.userId) {
      createdUserIds.push(result4.student.userId._id || result4.student.userId);
    }

    const profileInDb4 = await StudentProfile.findById(result4.student._id).lean();
    if (!profileInDb4) throw new Error("Test 4 Failed: Profile not found in DB");

    if (String(profileInDb4.institutionId) !== String(testInst._id)) {
      throw new Error(
        `Test 4 Failed: InstitutionId was NOT overridden! Found: ${profileInDb4.institutionId}, Expected: ${testInst._id}`
      );
    }

    console.log(`[PASS] Test Case 4 Passed:`);
    console.log(`       - Malicious institutionId (${anotherFakeInstId}) was ignored.`);
    console.log(`       - Server strictly enforced caller's institutionId (${testInst._id}).\n`);

    console.log("===============================================================");
    console.log("ALL 4 VERIFICATION TEST CASES PASSED PERFECTLY!");
    console.log("===============================================================");
  } finally {
    // Cleanup test data
    console.log("\n[Cleanup] Cleaning up test records from database...");
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (createdProfileIds.length > 0) {
      await StudentProfile.deleteMany({ _id: { $in: createdProfileIds } });
    }
    if (createdClassIds.length > 0) {
      await Class.deleteMany({ _id: { $in: createdClassIds } });
    }
    if (createdInstIds.length > 0) {
      await InstitutionProfile.deleteMany({ _id: { $in: createdInstIds } });
    }
    console.log("[Cleanup] Database cleaned.");
    await mongoose.disconnect();
    console.log("[Cleanup] Disconnected from MongoDB.");
  }
}

runTests().catch((err) => {
  console.error("\n[FATAL ERROR IN TEST SUITE]:", err);
  process.exit(1);
});
