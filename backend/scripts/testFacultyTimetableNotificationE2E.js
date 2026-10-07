const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const { io: ioClient } = require("socket.io-client");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const Timetable = require("../src/modules/academics/timetable.model");
const Notification = require("../src/modules/notifications/notification.model");
const EmailEvent = require("../src/modules/notifications/email-event.model");
const { initSocketServer, closeSocketServer } = require("../src/socket");
const { generateToken } = require("../src/shared/utils/jwt");

async function runFacultyTimetableNotificationE2E() {
  console.log("==================================================================");
  console.log("MISC SANAVIYYA — FACULTY TIMETABLE NOTIFICATION E2E SUITE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/4] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  initSocketServer(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const socketUrl = `http://127.0.0.1:${port}`;
  console.log(`[2/4] Test HTTP & Socket.IO server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupFacultyIds = [];
  const cleanupTimetableIds = [];
  const cleanupClassIds = [];
  const cleanupSubjectIds = [];
  const cleanupYearIds = [];
  const activeSockets = [];

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
    const ts = Date.now();

    // 1. Create Admin User
    const adminUser = await User.create({
      username: `admin_tt_${ts}`,
      name: "Admin TT Tester",
      email: `admin_tt_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id,
      id: adminUser._id,
      role: "ADMIN",
      email: adminUser.email,
    });

    // 2. Create Faculty A User & Profile
    const facultyUserA = await User.create({
      username: `fac_a_${ts}`,
      name: "Usthad Ahmad",
      email: `ahmad_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUserA._id);
    const facultyProfileA = await FacultyProfile.create({
      userId: facultyUserA._id,
      facultyId: `FAC-A-${ts}`,
      nameEnglish: "Usthad Ahmad",
      designation: "Senior Lecturer",
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfileA._id);
    const facultyTokenA = generateToken({
      userId: facultyUserA._id,
      id: facultyUserA._id,
      role: "FACULTY",
      email: facultyUserA.email,
    });

    // 3. Create Faculty B User & Profile
    const facultyUserB = await User.create({
      username: `fac_b_${ts}`,
      name: "Usthad Bilal",
      email: `bilal_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUserB._id);
    const facultyProfileB = await FacultyProfile.create({
      userId: facultyUserB._id,
      facultyId: `FAC-B-${ts}`,
      nameEnglish: "Usthad Bilal",
      designation: "Lecturer",
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfileB._id);
    const facultyTokenB = generateToken({
      userId: facultyUserB._id,
      id: facultyUserB._id,
      role: "FACULTY",
      email: facultyUserB.email,
    });

    // 4. Academic Year, Classes, Subjects
    const academicYear = await AcademicYear.create({
      yearName: `2026-2027-${ts}`,
      yearCode: `AY-${ts}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const classA = await Class.create({
      name: `Sanaviyya Year 1-${ts}`,
      code: `SAN1-${ts}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classA._id);

    const classB = await Class.create({
      name: `Sanaviyya Year 2-${ts}`,
      code: `SAN2-${ts}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classB._id);

    const subjectA = await Subject.create({
      subjectName: "Arabic Grammar",
      subjectCode: `ARB-${ts}`,
      category: "LANGUAGE",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subjectA._id);

    const subjectB = await Subject.create({
      subjectName: "Fiqh & Jurisprudence",
      subjectCode: `FQH-${ts}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subjectB._id);

    console.log("[3/4] Base test domain fixtures established.");

    // Connect Socket.IO clients for Faculty A and Faculty B
    const socketClientA = ioClient(socketUrl, {
      auth: { token: facultyTokenA },
      transports: ["websocket"],
      forceNew: true,
    });
    activeSockets.push(socketClientA);

    const socketClientB = ioClient(socketUrl, {
      auth: { token: facultyTokenB },
      transports: ["websocket"],
      forceNew: true,
    });
    activeSockets.push(socketClientB);

    await Promise.all([
      new Promise((resolve) => socketClientA.on("connect", resolve)),
      new Promise((resolve) => socketClientB.on("connect", resolve)),
    ]);
    console.log("  ✓ Sockets for Faculty A and Faculty B connected & authenticated.\n");

    // Container for received socket notifications
    const receivedNotifsA = [];
    socketClientA.on("notification:new", (data) => receivedNotifsA.push(data));

    const receivedNotifsB = [];
    socketClientB.on("notification:new", (data) => receivedNotifsB.push(data));

    console.log("==================== TEST EXECUTION ====================\n");

    // -------------------------------------------------------------------------
    // TEST 1: Admin successfully assigns timetable to Faculty A
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: Timetable Assignment Creation & Notification ---");
    const createRes = await fetch(`${baseUrl}/academic/timetables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        academicYearId: academicYear._id.toString(),
        classId: classA._id.toString(),
        dayOfWeek: "MONDAY",
        periodNumber: 1,
        startTime: "09:00",
        endTime: "09:45",
        subjectId: subjectA._id.toString(),
        facultyId: facultyProfileA._id.toString(),
        room: "Hall 101",
      }),
    });

    const createJson = await createRes.json();
    assert(createRes.status === 201, `Timetable creation returned 201 Created (got ${createRes.status})`);
    assert(createJson.success === true, "Response reported success = true");
    const timetableEntryA = createJson.data;
    if (timetableEntryA?._id) cleanupTimetableIds.push(timetableEntryA._id);

    // Wait for async socket event delivery
    await new Promise((r) => setTimeout(r, 400));

    // -------------------------------------------------------------------------
    // TEST 2: Socket.IO notification received by Faculty A
    // -------------------------------------------------------------------------
    const socketNotifA = receivedNotifsA.find((n) => n.type === "TIMETABLE_ASSIGNED");
    assert(Boolean(socketNotifA), "Faculty A received real-time 'notification:new' via Socket.IO");
    assert(socketNotifA?.title === "New Timetable Assigned", "Socket notification title is 'New Timetable Assigned'");
    assert(socketNotifA?.message?.includes("Arabic Grammar"), "Socket notification contains subject 'Arabic Grammar'");
    assert(socketNotifA?.message?.includes("Monday"), "Socket notification contains day 'Monday'");
    assert(socketNotifA?.message?.includes("Period 1"), "Socket notification contains 'Period 1'");
    assert(socketNotifA?.message?.includes("Hall 101"), "Socket notification contains room 'Hall 101'");

    // -------------------------------------------------------------------------
    // TEST 3: Faculty B does NOT receive Faculty A's notification (Isolation / Security)
    // -------------------------------------------------------------------------
    const leakToB = receivedNotifsB.find(
      (n) => n.metadata?.timetableId?.toString() === timetableEntryA._id.toString()
    );
    assert(!leakToB, "Security: Faculty B received ZERO notifications for Faculty A's timetable (No leak)");

    // -------------------------------------------------------------------------
    // TEST 4: MongoDB Notification Persistence
    // -------------------------------------------------------------------------
    const savedNotifA = await Notification.findOne({
      userId: facultyUserA._id,
      type: "TIMETABLE_ASSIGNED",
      "metadata.timetableId": timetableEntryA._id.toString(),
    }).lean();

    assert(Boolean(savedNotifA), "Notification record persisted in MongoDB");
    assert(savedNotifA?.isRead === false, "Initial isRead status is false");
    assert(savedNotifA?.userId?.toString() === facultyUserA._id.toString(), "Notification strictly scoped to faculty user ID");

    // -------------------------------------------------------------------------
    // TEST 5: Deep-Link Verification
    // -------------------------------------------------------------------------
    assert(savedNotifA?.link === "/faculty/timetable", "Notification deep-link correctly targets '/faculty/timetable'");

    // -------------------------------------------------------------------------
    // TEST 6: Deduplication Check
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Deduplication Protection ---");
    const { notifyTimetableAssigned } = require("../src/modules/notifications/notification.service");
    const duplicateAttempt = await notifyTimetableAssigned(timetableEntryA);

    const totalMatchingNotifs = await Notification.countDocuments({
      userId: facultyUserA._id,
      "metadata.dedupKey": `TIMETABLE_ASSIGN_${timetableEntryA._id}_${facultyUserA._id}`,
    });
    assert(totalMatchingNotifs === 1, "Deduplication: Only 1 notification exists in MongoDB (Duplicate suppressed)");

    // -------------------------------------------------------------------------
    // TEST 7: Failed assignment (Schedule clash) does NOT create notification
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Failure Isolation (Failed Assignment) ---");
    const initialNotifCount = await Notification.countDocuments({ userId: facultyUserA._id });

    const clashRes = await fetch(`${baseUrl}/academic/timetables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        academicYearId: academicYear._id.toString(),
        classId: classA._id.toString(),
        dayOfWeek: "MONDAY",
        periodNumber: 1, // Same slot!
        startTime: "09:00",
        endTime: "09:45",
        subjectId: subjectB._id.toString(),
        facultyId: facultyProfileA._id.toString(),
      }),
    });
    assert(clashRes.status === 409, `Schedule clash rejected with HTTP 409 Conflict (got ${clashRes.status})`);

    const afterClashCount = await Notification.countDocuments({ userId: facultyUserA._id });
    assert(afterClashCount === initialNotifCount, "Failed timetable creation generated ZERO notifications");

    // -------------------------------------------------------------------------
    // TEST 8: Timetable Update Notification (TIMETABLE_UPDATED)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Timetable Update Notification ---");
    receivedNotifsA.length = 0; // Clear received list

    const updateRes = await fetch(`${baseUrl}/academic/timetables/${timetableEntryA._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        room: "Main Auditorium",
        startTime: "09:15",
        endTime: "10:00",
      }),
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, `Timetable update returned 200 OK (got ${updateRes.status})`);
    assert(updateJson.success === true, "Update response reported success = true");

    await new Promise((r) => setTimeout(r, 400));

    const updateSocketNotif = receivedNotifsA.find((n) => n.type === "TIMETABLE_UPDATED");
    assert(Boolean(updateSocketNotif), "Faculty A received 'TIMETABLE_UPDATED' Socket.IO notification");
    assert(updateSocketNotif?.title === "Timetable Updated", "Notification title is 'Timetable Updated'");
    assert(updateSocketNotif?.message?.includes("Main Auditorium"), "Notification message includes updated room 'Main Auditorium'");
    assert(updateSocketNotif?.link === "/faculty/timetable", "Notification deep-link targets '/faculty/timetable'");

    // -------------------------------------------------------------------------
    // TEST 9: Timetable Reassignment to Faculty B
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Timetable Reassignment to Another Faculty ---");
    receivedNotifsA.length = 0;
    receivedNotifsB.length = 0;

    const reassignRes = await fetch(`${baseUrl}/academic/timetables/${timetableEntryA._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        facultyId: facultyProfileB._id.toString(),
      }),
    });
    assert(reassignRes.status === 200, `Reassignment returned 200 OK (got ${reassignRes.status})`);

    await new Promise((r) => setTimeout(r, 400));

    const reassignNotifB = receivedNotifsB.find(
      (n) => n.type === "TIMETABLE_ASSIGNED" && n.metadata?.timetableId?.toString() === timetableEntryA._id.toString()
    );
    assert(Boolean(reassignNotifB), "Newly assigned Faculty B received 'TIMETABLE_ASSIGNED' notification");
    assert(reassignNotifB?.title === "New Timetable Assigned", "Title for Faculty B is 'New Timetable Assigned'");

    // -------------------------------------------------------------------------
    // TEST 10: Multiple Faculty Independent Delivery
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Independent Multiple Faculty Delivery ---");
    receivedNotifsA.length = 0;
    receivedNotifsB.length = 0;

    // Create entry for Faculty A in Class B
    const createForARes = await fetch(`${baseUrl}/academic/timetables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        academicYearId: academicYear._id.toString(),
        classId: classB._id.toString(),
        dayOfWeek: "TUESDAY",
        periodNumber: 2,
        startTime: "10:00",
        endTime: "10:45",
        subjectId: subjectA._id.toString(),
        facultyId: facultyProfileA._id.toString(),
        room: "Room 202",
      }),
    });
    const createForAJson = await createForARes.json();
    if (createForAJson.data?._id) cleanupTimetableIds.push(createForAJson.data._id);

    // Create entry for Faculty B in Class A
    const createForBRes = await fetch(`${baseUrl}/academic/timetables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        academicYearId: academicYear._id.toString(),
        classId: classA._id.toString(),
        dayOfWeek: "TUESDAY",
        periodNumber: 3,
        startTime: "11:00",
        endTime: "11:45",
        subjectId: subjectB._id.toString(),
        facultyId: facultyProfileB._id.toString(),
        room: "Room 105",
      }),
    });
    const createForBJson = await createForBRes.json();
    if (createForBJson.data?._id) cleanupTimetableIds.push(createForBJson.data._id);

    await new Promise((r) => setTimeout(r, 400));

    const notifA2 = receivedNotifsA.find(
      (n) => n.metadata?.timetableId?.toString() === createForAJson.data?._id?.toString()
    );
    const notifB2 = receivedNotifsB.find(
      (n) => n.metadata?.timetableId?.toString() === createForBJson.data?._id?.toString()
    );

    assert(Boolean(notifA2), "Faculty A independently received notification for Class B assignment");
    assert(Boolean(notifB2), "Faculty B independently received notification for Class A assignment");
    assert(!receivedNotifsA.some((n) => n.metadata?.timetableId?.toString() === createForBJson.data?._id?.toString()), "Faculty A did NOT receive Faculty B's assignment");
    assert(!receivedNotifsB.some((n) => n.metadata?.timetableId?.toString() === createForAJson.data?._id?.toString()), "Faculty B did NOT receive Faculty A's assignment");

    // -------------------------------------------------------------------------
    // TEST 11: Notification REST API Verification (Mark as read, Unread count)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: Notification REST API Endpoints ---");
    const countRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${facultyTokenA}` },
    });
    const countJson = await countRes.json();
    assert(countRes.status === 200, "GET /notifications/unread-count returned 200");
    assert(countJson.data?.unreadCount > 0, `Faculty A unreadCount is > 0 (got ${countJson.data?.unreadCount})`);

    const listRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${facultyTokenA}` },
    });
    const listJson = await listRes.json();
    assert(listRes.status === 200, "GET /notifications returned 200");
    assert(Array.isArray(listJson.data?.notifications), "Notifications list is an array");
    const firstNotifId = listJson.data.notifications[0]._id;

    // Mark as read
    const readRes = await fetch(`${baseUrl}/notifications/${firstNotifId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${facultyTokenA}` },
    });
    const readJson = await readRes.json();
    assert(readRes.status === 200, "PATCH /notifications/:id/read returned 200");
    assert(readJson.data?.isRead === true, "Notification isRead updated to true");

    // -------------------------------------------------------------------------
    // TEST 12: Email Event Audit Logging (Failure Isolated)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 8: Email Event Audit Logging ---");
    const emailEvents = await EmailEvent.find({
      eventType: "TIMETABLE_ASSIGNED",
      recipientUserId: facultyUserA._id,
    }).lean();
    assert(emailEvents.length > 0, `Email event logged in EmailEvent collection (count=${emailEvents.length})`);
    if (emailEvents.length > 0) {
      assert(emailEvents[0].subject.includes("New Timetable Assigned"), "Email subject is accurate");
      assert(["SENT", "FAILED", "SKIPPED"].includes(emailEvents[0].status), "Email event status is valid");
    }

    console.log("\n==================================================================");
    console.log(`TOTAL TESTS: ${testTotalCount} | PASSED: ${testPassedCount} | FAILED: ${testTotalCount - testPassedCount}`);
    console.log("==================================================================");

    if (testPassedCount !== testTotalCount) {
      throw new Error(`Test suite failure: ${testTotalCount - testPassedCount} test(s) failed.`);
    }
  } finally {
    // Teardown
    console.log("\n[4/4] Cleaning up test fixtures from database...");
    for (const s of activeSockets) {
      s.disconnect();
    }
    await closeSocketServer();
    await new Promise((resolve) => server.close(resolve));

    if (cleanupTimetableIds.length > 0) {
      await Timetable.deleteMany({ _id: { $in: cleanupTimetableIds } });
    }
    if (cleanupUserIds.length > 0) {
      await Notification.deleteMany({ userId: { $in: cleanupUserIds } });
      await EmailEvent.deleteMany({ recipientUserId: { $in: cleanupUserIds } });
      await User.deleteMany({ _id: { $in: cleanupUserIds } });
    }
    if (cleanupFacultyIds.length > 0) {
      await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
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

    await mongoose.connection.close();
    console.log("Cleanup complete. Teardown finished.");
  }
}

runFacultyTimetableNotificationE2E().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
