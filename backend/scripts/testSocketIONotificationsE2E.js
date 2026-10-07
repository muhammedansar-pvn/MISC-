const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const { io: ioClient } = require("socket.io-client");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const Notification = require("../src/modules/notifications/notification.model");
const notificationService = require("../src/modules/notifications/notification.service");
const { initSocketServer, closeSocketServer, getIO } = require("../src/socket");
const { generateToken } = require("../src/shared/utils/jwt");

async function runSocketIOE2ETests() {
  console.log("==================================================================");
  console.log("PHASE 3A END-TO-END VERIFICATION: REAL-TIME SOCKET.IO LAYER");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/3] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  initSocketServer(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const socketUrl = `http://127.0.0.1:${port}`;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/3] Test HTTP & Socket.IO server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupNotificationIds = [];
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

    // Setup Test Users
    const userA = await User.create({
      username: `socket_user_a_${ts}`,
      name: "Socket User Alpha",
      email: `socket_a_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(userA._id);
    const tokenA = generateToken({
      userId: userA._id,
      id: userA._id,
      role: "STUDENT",
      email: userA.email,
    });

    const userB = await User.create({
      username: `socket_user_b_${ts}`,
      name: "Socket User Beta",
      email: `socket_b_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(userB._id);
    const tokenB = generateToken({
      userId: userB._id,
      id: userB._id,
      role: "FACULTY",
      email: userB.email,
    });

    console.log("[3/3] Fixtures created. Running real-time socket verification...\n");

    // =========================================================================
    // SUITE 1: CONNECTION & AUTHENTICATION HANDSHAKE
    // =========================================================================
    console.log("--- SUITE 1: Connection & Authentication Handshake ---");

    // TC-1: Socket server is initialized and accessible
    const ioServer = getIO();
    assert(Boolean(ioServer), "Socket.IO server instance is initialized and active");

    // TC-2: Unauthenticated connection rejected
    let unauthRejected = false;
    let unauthError = "";
    await new Promise((resolve) => {
      const client = ioClient(socketUrl, {
        transports: ["websocket"],
        timeout: 3000,
        reconnection: false,
      });
      client.on("connect_error", (err) => {
        unauthRejected = true;
        unauthError = err.message;
        client.disconnect();
        resolve();
      });
      client.on("connect", () => {
        client.disconnect();
        resolve();
      });
    });
    assert(unauthRejected && unauthError.includes("Authentication required"), "Unauthenticated connection rejected with auth error");

    // TC-3: Invalid JWT connection rejected
    let invalidTokenRejected = false;
    let invalidError = "";
    await new Promise((resolve) => {
      const client = ioClient(socketUrl, {
        auth: { token: "bad.invalid.jwt.token" },
        transports: ["websocket"],
        timeout: 3000,
        reconnection: false,
      });
      client.on("connect_error", (err) => {
        invalidTokenRejected = true;
        invalidError = err.message;
        client.disconnect();
        resolve();
      });
      client.on("connect", () => {
        client.disconnect();
        resolve();
      });
    });
    assert(invalidTokenRejected && invalidError.includes("Authentication failed"), "Invalid/forged JWT rejected during handshake");

    // TC-4: Valid JWT connection accepted
    let clientA = null;
    let clientAConnected = false;
    await new Promise((resolve) => {
      clientA = ioClient(socketUrl, {
        auth: { token: tokenA },
        transports: ["websocket"],
        timeout: 4000,
      });
      activeSockets.push(clientA);
      clientA.on("connect", () => {
        clientAConnected = true;
        resolve();
      });
      clientA.on("connect_error", (err) => {
        console.error("Client A connection failed:", err.message);
        resolve();
      });
    });
    assert(clientAConnected && clientA.connected, "Valid JWT connection accepted successfully");

    // TC-5: Authenticated socket joins correct private user room
    const serverSockets = Array.from(ioServer.sockets.sockets.values());
    const matchedSocket = serverSockets.find((s) => s.id === clientA.id);
    const inRoom = matchedSocket && matchedSocket.rooms.has(`user:${userA._id.toString()}`);
    assert(Boolean(inRoom), `Socket automatically joined private user room (user:${userA._id.toString()})`);

    // =========================================================================
    // SUITE 2: REAL-TIME EVENT DELIVERY & ISOLATION
    // =========================================================================
    console.log("\n--- SUITE 2: Real-Time Event Delivery & Cross-User Isolation ---");

    // Connect User B
    let clientB = null;
    await new Promise((resolve) => {
      clientB = ioClient(socketUrl, {
        auth: { token: tokenB },
        transports: ["websocket"],
        timeout: 4000,
      });
      activeSockets.push(clientB);
      clientB.on("connect", resolve);
    });

    // Connect second tab for User A (Multi-Tab scenario)
    let clientA2 = null;
    await new Promise((resolve) => {
      clientA2 = ioClient(socketUrl, {
        auth: { token: tokenA },
        transports: ["websocket"],
        timeout: 4000,
      });
      activeSockets.push(clientA2);
      clientA2.on("connect", resolve);
    });

    // Listen for notification:new
    let notifReceivedByA1 = null;
    let notifReceivedByA2 = null;
    let notifReceivedByB = null;

    clientA.on("notification:new", (data) => {
      notifReceivedByA1 = data;
    });

    clientA2.on("notification:new", (data) => {
      notifReceivedByA2 = data;
    });

    clientB.on("notification:new", (data) => {
      notifReceivedByB = data;
    });

    // TC-6, TC-7, TC-8, TC-9: Create notification for User A
    const createdNotif = await notificationService.createNotification({
      userId: userA._id,
      title: "Real-Time Exam Alert",
      message: "Your examination hall ticket is now ready for download.",
      type: "HALL_TICKET",
      link: "/student/examinations/registrations",
      metadata: { dedupKey: `SOCKET_TEST_1_${ts}` },
    });
    cleanupNotificationIds.push(createdNotif._id);

    // Wait briefly for real-time WebSocket delivery
    await new Promise((resolve) => setTimeout(resolve, 300));

    // TC-6 & TC-7: User A received notification
    assert(
      notifReceivedByA1 &&
      notifReceivedByA1._id.toString() === createdNotif._id.toString() &&
      notifReceivedByA1.title === "Real-Time Exam Alert",
      "Notification creation triggers real-time notification:new delivery to target user"
    );

    // TC-8: Strict Room Isolation: User B did NOT receive User A's notification
    assert(notifReceivedByB === null, "Strict Isolation: User B did NOT receive User A's private notification");

    // TC-9: Multi-Tab Support: Both Tab 1 and Tab 2 for User A received the notification
    assert(
      notifReceivedByA2 &&
      notifReceivedByA2._id.toString() === createdNotif._id.toString(),
      "Multi-Tab Support: Multiple concurrent socket sessions for User A both receive the real-time event"
    );

    // =========================================================================
    // SUITE 3: DATABASE SOURCE OF TRUTH & RESILIENCE
    // =========================================================================
    console.log("\n--- SUITE 3: Source of Truth, Fallback & Reconnection ---");

    // TC-10: Notification persisted to MongoDB before/with socket emission
    const dbRecord = await Notification.findById(createdNotif._id).lean();
    assert(dbRecord && dbRecord.title === "Real-Time Exam Alert", "MongoDB remains authoritative source of truth with complete record");

    // TC-11: Resiliency: Notification creation succeeds even if target user has 0 connected sockets
    const disconnectedUser = await User.create({
      username: `offline_user_${ts}`,
      name: "Offline User",
      email: `offline_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(disconnectedUser._id);

    const offlineNotif = await notificationService.createNotification({
      userId: disconnectedUser._id,
      title: "Offline Alert",
      message: "Delivered to database while user is offline.",
      type: "SYSTEM_ALERT",
      metadata: { dedupKey: `OFFLINE_TEST_${ts}` },
    });
    cleanupNotificationIds.push(offlineNotif._id);

    assert(Boolean(offlineNotif && offlineNotif._id), "Resilience: Notification creation succeeds seamlessly when recipient has no active sockets");

    // TC-12: REST API fallback returns notifications for offline user
    const offlineToken = generateToken({
      userId: disconnectedUser._id,
      id: disconnectedUser._id,
      role: "STUDENT",
      email: disconnectedUser.email,
    });

    const restRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${offlineToken}` },
    });
    const restData = await restRes.json();
    assert(
      restRes.status === 200 &&
      restData.data.notifications.length === 1 &&
      restData.data.notifications[0].title === "Offline Alert",
      "REST API fallback returns persisted notifications for offline / reconnected user"
    );

    // TC-13: Reconnection recovery: client reconnects and retrieves state via REST
    clientA.disconnect();
    // Simulate notification sent while clientA was disconnected
    const missedNotif = await notificationService.createNotification({
      userId: userA._id,
      title: "Missed While Disconnected",
      message: "You were offline when this was created.",
      type: "EXAM_PUBLISHED",
      metadata: { dedupKey: `MISSED_TEST_${ts}` },
    });
    cleanupNotificationIds.push(missedNotif._id);

    // Reconnect clientA
    await new Promise((resolve) => {
      clientA.connect();
      clientA.once("connect", resolve);
    });

    // Query REST after reconnect
    const reconnectRestRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const reconnectRestData = await reconnectRestRes.json();
    const hasMissed = reconnectRestData.data.notifications.some((n) => n._id.toString() === missedNotif._id.toString());
    assert(hasMissed && reconnectRestData.data.unreadCount >= 2, "Reconnection Recovery: REST API provides full updated history and unread count after reconnection");

    // TC-14: Disconnect cleans up client connection
    clientA.disconnect();
    clientA2.disconnect();
    clientB.disconnect();
    assert(!clientA.connected && !clientB.connected, "Socket clients cleanly disconnect on session termination");

  } catch (err) {
    console.error("UNEXPECTED ERROR IN SOCKET E2E TEST RUN:", err);
  } finally {
    console.log("\n--- Cleaning up test fixtures & closing connections ---");
    try {
      activeSockets.forEach((s) => s && s.disconnect());
      await closeSocketServer();

      if (cleanupNotificationIds.length > 0) {
        await Notification.deleteMany({ _id: { $in: cleanupNotificationIds } });
      }
      if (cleanupUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: cleanupUserIds } });
      }
      console.log("Cleanup completed successfully.");
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr.message);
    }

    server.close();
    await mongoose.disconnect();

    console.log("\n==================================================================");
    console.log(`FINAL RESULT: ${testPassedCount} / ${testTotalCount} TESTS PASSED`);
    console.log("==================================================================");

    if (testPassedCount !== testTotalCount || testTotalCount === 0) {
      process.exit(1);
    }
  }
}

runSocketIOE2ETests();
