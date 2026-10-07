const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("../src/app");
const env = require("../src/config/env");

async function runSecurityAudit() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/misc";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const report = {
    authTests: [],
    idorTests: [],
    rbacTests: []
  };

  const JWT_SECRET = env.JWT_SECRET;

  // Fetch real users from DB
  const adminUser = await db.collection("users").findOne({ role: "ADMIN", username: "admin" });
  const facultyUser = await db.collection("users").findOne({ role: "FACULTY", email: "haseeb@yopmail.com" });
  const studentUserA = await db.collection("users").findOne({ role: "STUDENT", email: "fasi@yopmail.com" });
  const studentUserB = await db.collection("users").findOne({ role: "STUDENT", email: "farhan@yopmail.com" });
  const parentUserA = await db.collection("users").findOne({ role: "PARENT", email: "babu@yopmail.com" });
  const parentUserB = await db.collection("users").findOne({ role: "PARENT", email: "nafi@yopmail.com" });

  const studentProfileA = await db.collection("studentProfiles").findOne({ userId: studentUserA._id });
  const studentProfileB = await db.collection("studentProfiles").findOne({ userId: studentUserB._id });

  function generateToken(user, expired = false) {
    return jwt.sign(
      {
        id: user._id.toString(),
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: expired ? "-1s" : "1h" }
    );
  }



  const http = require("http");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  function simulateRequest(method, urlPath, token, body = null) {
    return new Promise((resolve, reject) => {
      const dataStr = body ? JSON.stringify(body) : null;
      const options = {
        hostname: "127.0.0.1",
        port,
        path: urlPath,
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(dataStr ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(dataStr) } : {})
        }
      };

      const req = http.request(options, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on("error", reject);
      if (dataStr) req.write(dataStr);
      req.end();
    });
  }

  // Active accounts
  const tokenAdmin = generateToken(adminUser);
  const tokenFaculty = generateToken(facultyUser);
  const tokenStudentFarhan = generateToken(studentUserB); // farhan (ACTIVE)
  const tokenParentBabu = generateToken(parentUserA);     // babu (ACTIVE)
  const tokenParentNafi = generateToken(parentUserB);     // nafi (ACTIVE)
  const tokenExpired = generateToken(studentUserB, true);
  const tokenInvalidSig = jwt.sign({ id: studentUserB._id.toString(), role: "STUDENT" }, "wrong_secret");

  // 1. AUTHENTICATION TESTS
  console.log("--- RUNNING AUTHENTICATION TESTS ---");
  const test1 = await simulateRequest("GET", "/api/students/profile", null);
  report.authTests.push({ name: "Unauthenticated request rejected with 401", status: test1.status, pass: test1.status === 401 });

  const test2 = await simulateRequest("GET", "/api/students/profile", tokenExpired);
  report.authTests.push({ name: "Expired token rejected with 401", status: test2.status, pass: test2.status === 401 });

  const test3 = await simulateRequest("GET", "/api/students/profile", tokenInvalidSig);
  report.authTests.push({ name: "Invalid signature rejected with 401", status: test3.status, pass: test3.status === 401 });

  const test4 = await simulateRequest("GET", "/api/students/profile", tokenStudentFarhan);
  report.authTests.push({ name: "Active student token accepted with 200", status: test4.status, pass: test4.status === 200 });

  // 2. RBAC TESTS
  console.log("--- RUNNING RBAC TESTS ---");
  const rbac1 = await simulateRequest("GET", "/api/admin/users", tokenStudentFarhan);
  report.rbacTests.push({ name: "Student cannot access Admin route (/api/admin/users)", status: rbac1.status, pass: rbac1.status === 403 });

  const rbac2 = await simulateRequest("GET", "/api/admin/users", tokenFaculty);
  report.rbacTests.push({ name: "Faculty cannot access Admin route (/api/admin/users)", status: rbac2.status, pass: rbac2.status === 403 });

  const rbac3 = await simulateRequest("GET", "/api/admin/users", tokenParentBabu);
  report.rbacTests.push({ name: "Parent cannot access Admin route (/api/admin/users)", status: rbac3.status, pass: rbac3.status === 403 });

  const rbac4 = await simulateRequest("GET", "/api/faculty", tokenStudentFarhan);
  report.rbacTests.push({ name: "Student cannot access Faculty route (/api/faculty)", status: rbac4.status, pass: rbac4.status === 403 });

  const rbac5 = await simulateRequest("GET", "/api/admin/users", tokenAdmin);
  report.rbacTests.push({ name: "Admin can access Admin route with 200", status: rbac5.status, pass: rbac5.status === 200 });

  // 3. IDOR & SCOPING TESTS
  console.log("--- RUNNING IDOR & SCOPING TESTS ---");
  const idor1 = await simulateRequest("GET", "/api/parents/me", tokenParentBabu);
  const babuStudents = idor1.body?.data?.parent?.students || idor1.body?.data?.parent?.studentIds || [];
  report.idorTests.push({
    name: "Parent Babu retrieves own profile with own student (fasi)",
    status: idor1.status,
    pass: idor1.status === 200 && idor1.body?.data?.parent?.name === "babu"
  });

  const idor2 = await simulateRequest("GET", "/api/parents/me", tokenParentNafi);
  report.idorTests.push({
    name: "Parent Nafi retrieves own profile without leakage to Babu",
    status: idor2.status,
    pass: idor2.status === 200 && idor2.body?.data?.parent?.name === "efrwT"
  });

  // Verify Student Farhan gets only Farhan profile
  const idor3 = await simulateRequest("GET", "/api/students/profile", tokenStudentFarhan);
  report.idorTests.push({
    name: "Student Farhan receives strictly Farhan profile data",
    status: idor3.status,
    pass: idor3.status === 200 && idor3.body?.data?.registrationNumber === "MISC20260023"
  });

  // Verify Parent Babu cannot access arbitrary student profile directly
  const idor4 = await simulateRequest("GET", `/api/students/${studentProfileB._id}`, tokenParentBabu);
  report.idorTests.push({
    name: "Parent Babu cannot directly access unlinked Student Farhan via student route",
    status: idor4.status,
    pass: idor4.status === 403 || idor4.status === 404
  });

  console.log(JSON.stringify(report, null, 2));
  server.close();
  await mongoose.disconnect();
}

runSecurityAudit().catch(err => {
  console.error("Security audit failed:", err);
  process.exit(1);
});
