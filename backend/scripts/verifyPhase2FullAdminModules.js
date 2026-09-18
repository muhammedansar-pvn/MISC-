require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { hashPassword } = require("../src/utils/password");

// Import controllers
const { login } = require("../src/controllers/authController");
const { getDashboardStats, getUsers, getUserById, createUserInvitation } = require("../src/controllers/adminUserController");
const { handleCreateInstitution, handleGetInstitutions, handleUpdateInstitution } = require("../src/controllers/institutionController");
const { handleCreateAcademicYear, handleGetAcademicYears } = require("../src/controllers/academicYearController");
const { handleCreateClass, handleGetClasses } = require("../src/controllers/classController");
const { handleCreateSubject, handleGetSubjects } = require("../src/controllers/subjectController");
const { handleCreateSyllabus, handleGetSyllabuses } = require("../src/controllers/syllabusController");
const { registerStudent, handleGetStudents, handleUpdateStudent } = require("../src/controllers/studentController");
const { handleCreateFaculty, handleGetFacultyMembers, handleUpdateFaculty } = require("../src/controllers/facultyController");
const { handleCreateArticle, handleGetArticles } = require("../src/controllers/articleController");
const { handleCreateDownloadResource, handleGetDownloadResources } = require("../src/controllers/downloadResourceController");
const { handleGetEnquiries } = require("../src/controllers/enquiryController");
const { handleCreateEvent, handleGetEvents, handleGetEventRegistrations } = require("../src/controllers/eventController");
const { handleCreatePayment, handleVerifyPayment, handleGetPayments } = require("../src/controllers/paymentController");
const { handleCreateExam, handleGetExams } = require("../src/controllers/examController");
const { handleCreateExamSchedule, handleGetExamSchedules } = require("../src/controllers/examScheduleController");
const { handleGenerateExamResults, handleGetExamResults } = require("../src/controllers/examResultController");

const createMockReqRes = (body = {}, query = {}, params = {}, user = null) => {
  const req = { body, query, params, user };
  const res = {
    statusCode: 200,
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
  };
  return { req, res };
};

const runFullAdminVerification = async () => {
  console.log("=================================================");
  console.log("  MISC WEEKLY DELIVERABLE: ALL ADMIN MODULES E2E TEST");
  console.log("=================================================\n");

  await connectDB();

  const results = {};

  try {
    // 1. Ensure Admin exists
    let admin = await User.findOne({ username: "admin", role: "ADMIN" });
    if (!admin) {
      const passwordHash = await hashPassword("Admin@12345");
      admin = await User.create({
        username: "admin",
        email: "admin@misc.markaz.in",
        name: "System Admin",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      });
    }

    const adminUser = { userId: admin._id.toString(), role: admin.role };

    // --- 1. AUTHENTICATION MODULE ---
    console.log("[1/11] Testing Authentication...");
    const { req: rAuth, res: resAuth } = createMockReqRes({ username: "admin", password: "Admin@12345" });
    await login(rAuth, resAuth);
    results.authentication = resAuth.statusCode === 200 && resAuth.responseData?.token ? "PASS" : "FAIL";

    // --- 2. ADMIN DASHBOARD METRICS ---
    console.log("[2/11] Testing Dashboard Metrics API...");
    const { req: rStats, res: resStats } = createMockReqRes({}, {}, {}, adminUser);
    await getDashboardStats(rStats, resStats);
    results.dashboard = resStats.statusCode === 200 && resStats.responseData?.data?.totalUsers !== undefined ? "PASS" : "FAIL";

    // --- 3. USER MANAGEMENT ---
    console.log("[3/11] Testing User Management APIs...");
    const { req: rUsers, res: resUsers } = createMockReqRes({}, {}, {}, adminUser);
    await getUsers(rUsers, resUsers);
    results.users = resUsers.statusCode === 200 && Array.isArray(resUsers.responseData?.data) ? "PASS" : "FAIL";

    // --- 4. INSTITUTIONS MODULE ---
    console.log("[4/11] Testing Institution Management APIs...");
    const instCode = `INST-${Date.now().toString().slice(-4)}`;
    const { req: rInstAdd, res: resInstAdd } = createMockReqRes({
      institutionName: "Test Institution Campus",
      institutionCode: instCode,
      type: "DIRECT",
      address: "Karanthur, Kozhikode, Kerala",
      email: `inst.${Date.now()}@markaz.in`,
      contactNumber: "0495123456",
    }, {}, {}, adminUser);
    await handleCreateInstitution(rInstAdd, resInstAdd);
    console.log("  => resInstAdd:", resInstAdd.statusCode, resInstAdd.responseData);

    const { req: rInstGet, res: resInstGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetInstitutions(rInstGet, resInstGet);
    console.log("  => resInstGet:", resInstGet.statusCode, resInstGet.responseData);
    results.institutions = (resInstAdd.statusCode === 201 || resInstAdd.statusCode === 200) && resInstGet.statusCode === 200 ? "PASS" : "FAIL";

    // --- 5. ACADEMIC MANAGEMENT MODULE ---
    console.log("[5/11] Testing Academic Years, Classes, Subjects, Syllabuses...");
    const ayCode = `AY-${Date.now().toString().slice(-4)}`;
    const { req: rAyAdd, res: resAyAdd } = createMockReqRes({
      yearName: "2026-2027",
      yearCode: ayCode,
      startDate: "2026-06-01",
      endDate: "2027-03-31",
      isCurrent: true,
      status: "ACTIVE",
    }, {}, {}, adminUser);
    await handleCreateAcademicYear(rAyAdd, resAyAdd);

    const { req: rClsGet, res: resClsGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetClasses(rClsGet, resClsGet);

    const { req: rSbjGet, res: resSbjGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetSubjects(rSbjGet, resSbjGet);

    results.academic = resAyAdd.statusCode === 201 && resClsGet.statusCode === 200 && resSbjGet.statusCode === 200 ? "PASS" : "FAIL";

    // --- 6. STUDENTS MODULE ---
    console.log("[6/11] Testing Student Management APIs...");
    const { req: rStdGet, res: resStdGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetStudents(rStdGet, resStdGet);
    results.students = resStdGet.statusCode === 200 && Array.isArray(resStdGet.responseData?.data) ? "PASS" : "FAIL";

    // --- 7. FACULTY MODULE ---
    console.log("[7/11] Testing Faculty Management APIs...");
    const { req: rFacGet, res: resFacGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetFacultyMembers(rFacGet, resFacGet);
    results.faculty = resFacGet.statusCode === 200 && Array.isArray(resFacGet.responseData?.data) ? "PASS" : "FAIL";

    // --- 8. CMS MODULE ---
    console.log("[8/11] Testing CMS Articles, Resources & Enquiries...");
    const { req: rArtGet, res: resArtGet } = createMockReqRes();
    await handleGetArticles(rArtGet, resArtGet);

    const { req: rResGet, res: resResGet } = createMockReqRes();
    await handleGetDownloadResources(rResGet, resResGet);

    const { req: rEnqGet, res: resEnqGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetEnquiries(rEnqGet, resEnqGet);

    results.cms = resArtGet.statusCode === 200 && resResGet.statusCode === 200 && resEnqGet.statusCode === 200 ? "PASS" : "FAIL";

    // --- 9. EVENTS MODULE ---
    console.log("[9/11] Testing Events & Registrations...");
    const { req: rEvtGet, res: resEvtGet } = createMockReqRes();
    await handleGetEvents(rEvtGet, resEvtGet);

    const { req: rEvtReg, res: resEvtReg } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetEventRegistrations(rEvtReg, resEvtReg);

    results.events = resEvtGet.statusCode === 200 && resEvtReg.statusCode === 200 ? "PASS" : "FAIL";

    // --- 10. PAYMENTS LEDGER & SECURITY AUDIT ---
    console.log("[10/11] Testing Payment Ledger & Security Verification...");
    const { req: rPayGet, res: resPayGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetPayments(rPayGet, resPayGet);
    results.payments = resPayGet.statusCode === 200 && Array.isArray(resPayGet.responseData?.data) ? "PASS" : "FAIL";

    // --- 11. EXAMS & RESULTS MODULE ---
    console.log("[11/11] Testing Exams, Schedules & Results...");
    const { req: rExGet, res: resExGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetExams(rExGet, resExGet);

    const { req: rSchGet, res: resSchGet } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetExamSchedules(rSchGet, resSchGet);

    const { req: rResList, res: resResList } = createMockReqRes({}, {}, {}, adminUser);
    await handleGetExamResults(rResList, resResList);

    results.exams_and_results = resExGet.statusCode === 200 && resSchGet.statusCode === 200 && resResList.statusCode === 200 ? "PASS" : "FAIL";

    console.log("\n=================================================");
    console.log("  FULL WEEKLY SCOPE E2E VERIFICATION REPORT");
    console.log("=================================================");
    console.table(results);

    process.exit(0);
  } catch (err) {
    console.error("Full Admin verification error:", err);
    process.exit(1);
  }
};

runFullAdminVerification();
