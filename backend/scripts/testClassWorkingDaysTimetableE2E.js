const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const Timetable = require("../src/modules/academics/timetable.model");
const Notification = require("../src/modules/notifications/notification.model");
const EmailEvent = require("../src/modules/notifications/email-event.model");
const timetableService = require("../src/modules/academics/timetable.service");
const { generateToken } = require("../src/shared/utils/jwt");

async function runClassWorkingDaysTimetableE2E() {
  console.log("==================================================================");
  console.log("MISC SANAVIYYA — CLASS WORKING DAYS TIMETABLE ASSIGNMENT E2E");
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
  const baseUrl = `http://127.0.0.1:${port}/api/academic`;
  console.log(`[2/3] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupFacultyIds = [];
  const cleanupTimetableIds = [];
  const cleanupClassIds = [];
  const cleanupSubjectIds = [];
  const cleanupYearIds = [];

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assert(condition, message) {
    testTotalCount++;
    if (condition) {
      console.log(`  PASS: [TC-${testTotalCount}] ${message}`);
      testPassedCount++;
    } else {
      console.error(`  FAIL: [TC-${testTotalCount}] ${message}`);
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Setup Admin user and Auth header
    const adminUser = await User.create({
      username: `admin_wd_${timestamp}`,
      email: `admin_wd_${timestamp}@sanaviyya.test`,
      passwordHash: "hash123",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      role: "ADMIN",
      email: adminUser.email,
    });
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };

    // 2. Setup Faculty user and profile
    const facultyUser = await User.create({
      username: `usthad_wd_${timestamp}`,
      email: `usthad_wd_${timestamp}@sanaviyya.test`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(facultyUser._id);

    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      facultyId: `FAC-WD-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Usthad Ahmad Al-Kindi",
      nameArabic: "أحمد الكندي",
      designation: "Senior Mudarris",
      department: "Islamic Studies",
      contactNumber: "9876543210",
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile._id);

    // 3. Setup Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `AY-${timestamp}`,
      yearCode: `AY${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
      isCurrent: true,
    });
    cleanupYearIds.push(academicYear._id);

    // 4. Setup Subject
    const subject = await Subject.create({
      subjectName: "Fiqh & Usool",
      name: "Fiqh & Usool",
      subjectCode: `FIQH-${timestamp.toString().slice(-4)}`,
      code: `FIQH-${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subject._id);

    // 5. Setup Classes:
    // Class A: Working days EXCLUDING FRIDAY (Mon, Tue, Wed, Thu, Sat)
    const classNoFriday = await Class.create({
      name: `Class 8 Alpha (No Friday)`,
      code: `CLS-NF-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "SATURDAY"],
      status: "ACTIVE",
    });
    cleanupClassIds.push(classNoFriday._id);

    // Class B: Default working days (Sat, Sun, Mon, Tue, Wed, Thu — Friday disabled, Sunday working)
    const classDefaultDays = await Class.create({
      name: `Class 9 Beta (Default Working Days)`,
      code: `CLS-DF-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });
    cleanupClassIds.push(classDefaultDays._id);

    // Class C: Custom working days EXCLUDING WEDNESDAY
    const classNoWednesday = await Class.create({
      name: `Class 10 Gamma (No Wednesday)`,
      code: `CLS-NW-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      workingDays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"],
      status: "ACTIVE",
    });
    cleanupClassIds.push(classNoWednesday._id);

    // Class D: Class with Friday explicitly enabled
    const classWithFriday = await Class.create({
      name: `Class 11 Delta (Friday Enabled)`,
      code: `CLS-FE-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      workingDays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      status: "ACTIVE",
    });
    cleanupClassIds.push(classWithFriday._id);

    console.log("[3/3] Reference entities initialized. Starting verification tests...\n");

    // -------------------------------------------------------------------------
    // TEST 1: Verify Class Working Days Schema & Defaults
    // -------------------------------------------------------------------------
    console.log("--- TEST GROUP 1: Schema & Default Working Days ---");
    assert(
      Array.isArray(classNoFriday.workingDays) &&
        !classNoFriday.workingDays.includes("FRIDAY") &&
        classNoFriday.workingDays.includes("MONDAY"),
      "Class without Friday stores custom workingDays excluding Friday"
    );

    const refetchedDefaultClass = await Class.findById(classDefaultDays._id);
    assert(
      Array.isArray(refetchedDefaultClass.workingDays) &&
        !refetchedDefaultClass.workingDays.includes("FRIDAY") &&
        refetchedDefaultClass.workingDays.includes("SUNDAY") &&
        refetchedDefaultClass.workingDays.includes("SATURDAY"),
      "Class with default workingDays has Sunday enabled and Friday disabled"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Attempt assigning Friday to Class with No Friday Class (API POST)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: HTTP API Assignment on Disabled Day ---");
    const initialNotifCount = await Notification.countDocuments({ recipientId: facultyUser._id });
    const initialEmailCount = await EmailEvent.countDocuments({ recipientEmail: facultyUser.email });

    const fridayPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classNoFriday._id.toString(),
      dayOfWeek: "FRIDAY",
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 101",
      status: "ACTIVE",
    };

    const resAssignFriday = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(fridayPayload),
    });
    const fridayBody = await resAssignFriday.json();

    assert(
      resAssignFriday.status === 400,
      `API rejects Friday assignment for class without Friday with HTTP 400 (Received: ${resAssignFriday.status})`
    );
    assert(
      fridayBody.success === false,
      "Response indicates failure (success: false)"
    );
    assert(
      fridayBody.message === "Timetable cannot be assigned on Friday because this class has no scheduled classes on Friday.",
      `Exact expected error message returned: "${fridayBody.message}"`
    );

    // Verify database integrity: 0 timetable records created
    const fridayRecord = await Timetable.findOne({
      classId: classNoFriday._id,
      dayOfWeek: "FRIDAY",
      periodNumber: 1,
    });
    assert(!fridayRecord, "No timetable record was created in MongoDB");

    // Verify fail-safe: 0 notifications or email events dispatched
    const postNotifCount = await Notification.countDocuments({ recipientId: facultyUser._id });
    const postEmailCount = await EmailEvent.countDocuments({ recipientEmail: facultyUser.email });
    assert(
      postNotifCount === initialNotifCount,
      "No notification was dispatched on failed timetable assignment"
    );
    assert(
      postEmailCount === initialEmailCount,
      "No email event was dispatched on failed timetable assignment"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Attempt assigning Wednesday to Class with No Wednesday (Generic Check)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Dynamic Generic Day Validation (No Hardcoding) ---");
    const wednesdayPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classNoWednesday._id.toString(),
      dayOfWeek: "WEDNESDAY",
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 102",
      status: "ACTIVE",
    };

    const resAssignWed = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(wednesdayPayload),
    });
    const wedBody = await resAssignWed.json();

    assert(
      resAssignWed.status === 400,
      `API rejects Wednesday assignment for class without Wednesday with HTTP 400 (Received: ${resAssignWed.status})`
    );
    assert(
      wedBody.message === "Timetable cannot be assigned on Wednesday because this class has no scheduled classes on Wednesday.",
      `Exact message returned for Wednesday: "${wedBody.message}"`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Assigning on a Valid Working Day (Monday) Succeeds
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Valid Working Day Assignment ---");
    const mondayPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classNoFriday._id.toString(),
      dayOfWeek: "MONDAY",
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 101",
      status: "ACTIVE",
    };

    const resAssignMon = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(mondayPayload),
    });
    const monBody = await resAssignMon.json();

    assert(
      resAssignMon.status === 201 && monBody.success === true,
      `API creates timetable entry on Monday (valid day) with HTTP 201 (Received: ${resAssignMon.status})`
    );
    const createdMondayId = monBody.data?._id;
    if (createdMondayId) cleanupTimetableIds.push(createdMondayId);

    // -------------------------------------------------------------------------
    // TEST 5: Attempt Updating Timetable Entry to Non-Working Day (Friday)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Update Validation Rejection ---");
    const resUpdateToFriday = await fetch(`${baseUrl}/timetables/${createdMondayId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        dayOfWeek: "FRIDAY",
      }),
    });
    const updateFridayBody = await resUpdateToFriday.json();

    assert(
      resUpdateToFriday.status === 400,
      `Updating Monday entry to Friday is blocked with HTTP 400 (Received: ${resUpdateToFriday.status})`
    );
    assert(
      updateFridayBody.message === "Timetable cannot be assigned on Friday because this class has no scheduled classes on Friday.",
      `Exact error message returned on update: "${updateFridayBody.message}"`
    );

    // Verify record remains unchanged in database
    const unchangedEntry = await Timetable.findById(createdMondayId);
    assert(
      unchangedEntry.dayOfWeek === "MONDAY",
      "Database entry remained on MONDAY after rejected update"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Verify Default Class Rejects Friday & Accepts Sunday
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Default Working Days Verification ---");
    // 6a. Default class rejecting Friday
    const defaultClassFridayPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classDefaultDays._id.toString(),
      dayOfWeek: "FRIDAY",
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 201",
      status: "ACTIVE",
    };

    const resDefaultFriday = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(defaultClassFridayPayload),
    });
    const defaultFridayBody = await resDefaultFriday.json();

    assert(
      resDefaultFriday.status === 400,
      `Default class rejects Friday assignment with HTTP 400 (Received: ${resDefaultFriday.status})`
    );
    assert(
      defaultFridayBody.message === "Timetable cannot be assigned on Friday because this class has no scheduled classes on Friday.",
      `Default class returns exact error for Friday: "${defaultFridayBody.message}"`
    );

    // 6b. Default class accepting Sunday (Sunday is NOT disabled)
    const defaultClassSundayPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classDefaultDays._id.toString(),
      dayOfWeek: "SUNDAY",
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 201",
      status: "ACTIVE",
    };

    const resDefaultSunday = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(defaultClassSundayPayload),
    });
    const defaultSundayBody = await resDefaultSunday.json();

    assert(
      resDefaultSunday.status === 201 && defaultSundayBody.success === true,
      `Default class accepts Sunday assignment (Sunday is a working day, NOT disabled) (HTTP 201)`
    );
    if (defaultSundayBody.data?._id) cleanupTimetableIds.push(defaultSundayBody.data._id);

    // 6c. Class with Friday explicitly enabled allows Friday assignment
    const fridayEnabledPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classWithFriday._id.toString(),
      dayOfWeek: "FRIDAY",
      periodNumber: 2,
      startTime: "09:15",
      endTime: "10:00",
      subjectId: subject._id.toString(),
      facultyId: facultyProfile._id.toString(),
      room: "Room 301",
      status: "ACTIVE",
    };

    const resFridayEnabled = await fetch(`${baseUrl}/timetables`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(fridayEnabledPayload),
    });
    const fridayEnabledBody = await resFridayEnabled.json();

    assert(
      resFridayEnabled.status === 201 && fridayEnabledBody.success === true,
      `Class with Friday enabled allows Friday assignment (HTTP 201)`
    );
    if (fridayEnabledBody.data?._id) cleanupTimetableIds.push(fridayEnabledBody.data._id);

    // -------------------------------------------------------------------------
    // TEST 7: Case-Insensitivity & Direct Service Call
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Service Level & Case Insensitivity ---");
    let caughtServiceError = null;
    try {
      await timetableService.createTimetableEntry({
        academicYearId: academicYear._id,
        classId: classNoFriday._id,
        dayOfWeek: "friday", // lowercase test
        periodNumber: 2,
        startTime: "09:15",
        endTime: "10:00",
        subjectId: subject._id,
        facultyId: facultyProfile._id,
      });
    } catch (err) {
      caughtServiceError = err;
    }

    assert(
      caughtServiceError !== null && caughtServiceError.statusCode === 400,
      "Direct timetableService call rejects lowercase 'friday' with statusCode 400"
    );
    assert(
      caughtServiceError?.message === "Timetable cannot be assigned on Friday because this class has no scheduled classes on Friday.",
      `Service error message has proper title case: "${caughtServiceError?.message}"`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Preserving Existing Legacy Records
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Non-destructive Legacy Records Preservation ---");
    // Direct insertion of a legacy record as if created in earlier term
    const legacyFridayEntry = await Timetable.create({
      academicYearId: academicYear._id,
      classId: classNoFriday._id,
      dayOfWeek: "FRIDAY",
      periodNumber: 3,
      startTime: "10:15",
      endTime: "11:00",
      subjectId: subject._id,
      facultyId: facultyProfile._id,
      status: "ACTIVE",
    });
    cleanupTimetableIds.push(legacyFridayEntry._id);

    // Query entries for classNoFriday
    const classEntries = await timetableService.getTimetableEntries({ classId: classNoFriday._id });
    const legacyFound = classEntries.some(
      (e) => e._id.toString() === legacyFridayEntry._id.toString() && e.dayOfWeek === "FRIDAY"
    );

    assert(
      legacyFound,
      "Existing legacy timetable records on non-working days are preserved and NOT deleted"
    );

    // -------------------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`TEST RESULTS: ${testPassedCount} / ${testTotalCount} PASSED`);
    console.log("==================================================================");

    if (testPassedCount !== testTotalCount) {
      console.error(`FAILURE: ${testTotalCount - testPassedCount} test assertions failed.`);
      process.exit(1);
    }
  } catch (error) {
    console.error("Unhandled error during test execution:", error);
    process.exit(1);
  } finally {
    console.log("\nCleaning up test artifacts...");
    try {
      if (cleanupTimetableIds.length > 0) {
        await Timetable.deleteMany({ _id: { $in: cleanupTimetableIds } });
      }
      if (cleanupClassIds.length > 0) {
        await Class.deleteMany({ _id: { $in: cleanupClassIds } });
      }
      if (cleanupSubjectIds.length > 0) {
        await Subject.deleteMany({ _id: { $in: cleanupSubjectIds } });
      }
      if (cleanupYearIds.length > 0) {
        await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
      }
      if (cleanupFacultyIds.length > 0) {
        await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
      }
      if (cleanupUserIds.length > 0) {
        await Notification.deleteMany({ recipientId: { $in: cleanupUserIds } });
        await EmailEvent.deleteMany({ recipientEmail: { $regex: "admin_wd_|usthad_wd_" } });
        await User.deleteMany({ _id: { $in: cleanupUserIds } });
      }
      await mongoose.disconnect();
      await new Promise((resolve) => server.close(resolve));
      console.log("Cleanup completed.");
    } catch (cleanupErr) {
      console.error("Error during cleanup:", cleanupErr);
    }
  }
}

runClassWorkingDaysTimetableE2E();
