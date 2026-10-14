const http = require("http");
const assert = require("assert");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runTestSuite() {
  console.log("==================================================================");
  console.log("TEST SUITE: ADMIN DASHBOARD ROUTES & DUAL-MOUNT VERIFICATION");
  console.log("==================================================================\n");

  const originalFindById = User.findById;
  const originalAggregate = User.aggregate;

  // Mock User queries
  User.findById = (id) => ({
    select: () => {
      const role = id === "admin_user_id" ? "ADMIN" : "STUDENT";
      return Promise.resolve({
        _id: id,
        role,
        status: "ACTIVE",
        isDeleted: false,
        name: "Test User",
        email: "test@markazsanaviyya.org",
        username: "testuser",
      });
    },
  });

  User.aggregate = () =>
    Promise.resolve([
      {
        totalUsers: [{ count: 15 }],
        activeUsers: [{ count: 12 }],
        pendingUsers: [{ count: 3 }],
        institutions: [{ count: 1 }],
        students: [{ count: 10 }],
        faculty: [{ count: 4 }],
      },
    ]);

  const StudentProfile = require("../src/modules/students/student.model");
  const Event = require("../src/modules/events/event.model");
  const Exam = require("../src/modules/exams/exam.model");
  const Payment = require("../src/modules/payments/payment.model");

  const originalStudentProfileFindOne = StudentProfile.findOne;
  const mockStudentProfile = {
    _id: "mock_student_profile_id",
    userId: "student_user_id",
    status: "ACTIVE",
    isDeleted: false,
  };
  StudentProfile.findOne = () => ({
    select: () => ({
      lean: () => Promise.resolve(mockStudentProfile),
    }),
    lean: () => Promise.resolve(mockStudentProfile),
  });

  const originalEventCount = Event.countDocuments;
  const originalExamCount = Exam.countDocuments;
  const originalPaymentCount = Payment.countDocuments;

  Event.countDocuments = () => Promise.resolve(5);
  Exam.countDocuments = () => Promise.resolve(2);
  Payment.countDocuments = () => Promise.resolve(8);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const adminToken = generateToken({
    userId: "admin_user_id",
    role: "ADMIN",
  });

  const studentToken = generateToken({
    userId: "student_user_id",
    role: "STUDENT",
  });

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Canonical /api/admin/stats with valid ADMIN token returns 200
    // -------------------------------------------------------------
    await test("TEST 1: GET /api/admin/stats with ADMIN token returns 200 with stats data", async () => {
      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();

      assert.strictEqual(res.status, 200, "Expected status 200");
      assert.strictEqual(data.success, true, "Expected success: true");
      assert.ok(data.data, "Expected stats data payload");
      assert.strictEqual(data.data.totalUsers, 15);
      assert.strictEqual(data.data.activeUsers, 12);
      assert.strictEqual(data.data.pendingUsers, 3);
      assert.strictEqual(data.data.institutions, 1);
      assert.strictEqual(data.data.students, 10);
      assert.strictEqual(data.data.faculty, 4);
    });

    // -------------------------------------------------------------
    // TEST 2: Direct root /admin/stats with valid ADMIN token returns 200
    // -------------------------------------------------------------
    await test("TEST 2: GET /admin/stats (root mount) with ADMIN token returns 200 with stats data", async () => {
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();

      assert.strictEqual(res.status, 200, "Expected status 200");
      assert.strictEqual(data.success, true, "Expected success: true");
      assert.ok(data.data, "Expected stats data payload");
      assert.strictEqual(data.data.totalUsers, 15);
      assert.strictEqual(data.data.activeUsers, 12);
    });

    // -------------------------------------------------------------
    // TEST 3: Unauthenticated request to /api/admin/stats returns 401
    // -------------------------------------------------------------
    await test("TEST 3: GET /api/admin/stats without token returns 401 Unauthorized", async () => {
      const res = await fetch(`${baseUrl}/api/admin/stats`);
      const data = await res.json();

      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Authentication required");
    });

    // -------------------------------------------------------------
    // TEST 4: Unauthenticated request to /admin/stats returns 401
    // -------------------------------------------------------------
    await test("TEST 4: GET /admin/stats without token returns 401 Unauthorized", async () => {
      const res = await fetch(`${baseUrl}/admin/stats`);
      const data = await res.json();

      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Authentication required");
    });

    // -------------------------------------------------------------
    // TEST 5: Non-admin token to /api/admin/stats returns 403 Forbidden
    // -------------------------------------------------------------
    await test("TEST 5: GET /api/admin/stats with STUDENT token returns 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();

      assert.strictEqual(res.status, 403);
      assert.strictEqual(data.success, false);
    });

    // -------------------------------------------------------------
    // TEST 6: Non-admin token to /admin/stats returns 403 Forbidden
    // -------------------------------------------------------------
    await test("TEST 6: GET /admin/stats with STUDENT token returns 403 Forbidden", async () => {
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();

      assert.strictEqual(res.status, 403);
      assert.strictEqual(data.success, false);
    });

    // -------------------------------------------------------------
    // TEST 7: Unknown endpoint under /api returns standardized 404 JSON
    // -------------------------------------------------------------
    await test("TEST 7: GET /api/unknown-endpoint returns 404 JSON", async () => {
      const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
      const data = await res.json();

      assert.strictEqual(res.status, 404);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "API endpoint not found");
    });

    // -------------------------------------------------------------
    // TEST 8: Unknown endpoint at root returns standardized 404 JSON
    // -------------------------------------------------------------
    await test("TEST 8: GET /unknown-endpoint returns 404 JSON", async () => {
      const res = await fetch(`${baseUrl}/unknown-endpoint`);
      const data = await res.json();

      assert.strictEqual(res.status, 404);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "API endpoint not found");
    });
  } finally {
    User.findById = originalFindById;
    User.aggregate = originalAggregate;
    StudentProfile.findOne = originalStudentProfileFindOne;
    Event.countDocuments = originalEventCount;
    Exam.countDocuments = originalExamCount;
    Payment.countDocuments = originalPaymentCount;
    server.close();
  }

  console.log("\n==================================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
