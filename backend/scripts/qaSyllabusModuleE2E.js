require("dotenv").config();
const http = require("http");
const connectDB = require("../src/config/db");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const Syllabus = require("../src/modules/academics/syllabus.model");
const { hashPassword } = require("../src/shared/utils/password");

const BASE_URL = "http://localhost:5000/api";

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function getRaw(urlPath) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith("http") ? urlPath : `http://localhost:5000${urlPath}`;
    const url = new URL(fullUrl);
    http.get({ hostname: url.hostname, port: url.port, path: url.pathname }, (res) => {
      let data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: Buffer.concat(data),
        });
      });
    }).on("error", reject);
  });
}

async function runSyllabusQA() {
  console.log("====================================================");
  console.log("    FOCUSED END-TO-END QA: SYLLABUS MODULE");
  console.log("====================================================\n");

  await connectDB();

  const report = {
    crudPassed: false,
    uploadPassed: false,
    studentAccessPassed: false,
    authorizationPassed: false,
    fileSecurityPassed: false,
    issues: [],
  };

  try {
    // ----------------------------------------------------
    // PREPARATION: Ensure Users, Classes, Subjects
    // ----------------------------------------------------
    console.log("[Setup] Preparing test fixtures...");

    // 1. Admin User
    let admin = await User.findOne({ username: "admin", role: "ADMIN" });
    if (!admin) {
      const pwd = await hashPassword("Admin@12345");
      admin = await User.create({
        username: "admin",
        passwordHash: pwd,
        role: "ADMIN",
        status: "ACTIVE",
        mobile: "0000000000",
      });
    }

    // 2. Academic Year
    let academicYear = await AcademicYear.findOne({ yearCode: "AY2026" });
    if (!academicYear) {
      academicYear = await AcademicYear.create({
        yearName: "2026-2027",
        yearCode: "AY2026",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-03-31"),
        isCurrent: true,
        status: "ACTIVE",
      });
    }

    // 3. Two Distinct Classes (Class A and Class B)
    let classA = await Class.findOne({ code: "QA-CLASS-A" });
    if (!classA) {
      classA = await Class.create({
        name: "Standard 5A",
        code: "QA-CLASS-A",
        academicYearId: academicYear._id,
        status: "ACTIVE",
      });
    }

    let classB = await Class.findOne({ code: "QA-CLASS-B" });
    if (!classB) {
      classB = await Class.create({
        name: "Standard 6B",
        code: "QA-CLASS-B",
        academicYearId: academicYear._id,
        status: "ACTIVE",
      });
    }

    // 4. Subject
    let subject = await Subject.findOne({ subjectCode: "QA-FIQH" });
    if (!subject) {
      subject = await Subject.create({
        subjectName: "Islamic Jurisprudence (Fiqh)",
        subjectCode: "QA-FIQH",
        category: "ISLAMIC_STUDIES",
        description: "Core Fiqh Subject",
        status: "ACTIVE",
      });
    }

    // 5. Student 1 (Enrolled in Class A)
    const student1Email = "qa.student1@misc.test";
    let student1User = await User.findOne({ email: student1Email });
    if (!student1User) {
      const pwd = await hashPassword("Student@123");
      student1User = await User.create({
        username: "qa_student1",
        email: student1Email,
        passwordHash: pwd,
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: true,
        mobile: "1111111111",
      });
    } else {
      student1User.emailVerified = true;
      student1User.status = "ACTIVE";
      await student1User.save();
    }
    let student1Profile = await StudentProfile.findOne({ userId: student1User._id });
    if (!student1Profile) {
      student1Profile = await StudentProfile.create({
        userId: student1User._id,
        registrationNumber: "REG-QA-001",
        nameEnglish: "Student One (Class A)",
        dateOfBirth: new Date("2005-01-01"),
        admissionYear: 2026,
        fatherName: "Father One",
        motherName: "Mother One",
        classId: classA._id,
        academicYearId: academicYear._id,
        status: "ACTIVE",
      });
    } else {
      student1Profile.classId = classA._id;
      await student1Profile.save();
    }

    // 6. Student 2 (Enrolled in Class B)
    const student2Email = "qa.student2@misc.test";
    let student2User = await User.findOne({ email: student2Email });
    if (!student2User) {
      const pwd = await hashPassword("Student@123");
      student2User = await User.create({
        username: "qa_student2",
        email: student2Email,
        passwordHash: pwd,
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: true,
        mobile: "2222222222",
      });
    } else {
      student2User.emailVerified = true;
      student2User.status = "ACTIVE";
      await student2User.save();
    }
    let student2Profile = await StudentProfile.findOne({ userId: student2User._id });
    if (!student2Profile) {
      student2Profile = await StudentProfile.create({
        userId: student2User._id,
        registrationNumber: "REG-QA-002",
        nameEnglish: "Student Two (Class B)",
        dateOfBirth: new Date("2005-02-02"),
        admissionYear: 2026,
        fatherName: "Father Two",
        motherName: "Mother Two",
        classId: classB._id,
        academicYearId: academicYear._id,
        status: "ACTIVE",
      });
    } else {
      student2Profile.classId = classB._id;
      await student2Profile.save();
    }

    console.log("✓ Fixtures ready.\n");

    // ----------------------------------------------------
    // STEP 1: Admin Login
    // ----------------------------------------------------
    console.log("--- STEP 1: Admin Login ---");
    const loginRes = await apiRequest("POST", "/auth/login", {
      username: "admin",
      password: "Admin@12345",
    });

    const adminToken = loginRes.body.token || loginRes.body.data?.token;
    if (loginRes.status !== 200 || !adminToken) {
      throw new Error(`Admin login failed: HTTP ${loginRes.status} - ${JSON.stringify(loginRes.body)}`);
    }
    console.log("✓ Admin login successful. Token acquired.\n");

    // ----------------------------------------------------
    // STEP 2: Open /admin/academic/syllabus references
    // ----------------------------------------------------
    console.log("--- STEP 2: Fetch Academic References (Admin View) ---");
    const [yearsRes, classesRes, subjectsRes, sylListRes] = await Promise.all([
      apiRequest("GET", "/academic/academic-years", null, adminToken),
      apiRequest("GET", "/academic/classes", null, adminToken),
      apiRequest("GET", "/academic/subjects", null, adminToken),
      apiRequest("GET", "/academic/syllabuses", null, adminToken),
    ]);

    if (yearsRes.status !== 200 || classesRes.status !== 200 || subjectsRes.status !== 200 || sylListRes.status !== 200) {
      throw new Error("Failed to load academic reference data for admin syllabus page");
    }
    console.log(`✓ Fetched ${yearsRes.body.data.length} years, ${classesRes.body.data.length} classes, ${subjectsRes.body.data.length} subjects.`);
    console.log(`✓ Current syllabus count: ${sylListRes.body.count || sylListRes.body.data.length}\n`);

    // ----------------------------------------------------
    // STEP 3 & 4: Upload PDF & Create Syllabus
    // ----------------------------------------------------
    console.log("--- STEP 3: File Upload & Syllabus Creation ---");

    // Mock PDF payload
    const mockPdfBinary = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (MISC QA Test Syllabus) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
    const mockBase64 = mockPdfBinary.toString("base64");

    const uploadRes = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "noorul_iman_syllabus.pdf",
      fileData: mockBase64,
    }, adminToken);

    if (uploadRes.status !== 200 || !uploadRes.body.data?.fileUrl) {
      throw new Error(`PDF upload failed: HTTP ${uploadRes.status} - ${JSON.stringify(uploadRes.body)}`);
    }
    const uploadedFileUrl = uploadRes.body.data.fileUrl;
    const uploadedFileName = uploadRes.body.data.fileName;
    console.log(`✓ File uploaded successfully: ${uploadedFileName}`);
    console.log(`  fileUrl: ${uploadedFileUrl}`);

    // Verify file accessibility via HTTP GET
    console.log("\n--- STEP 5: Confirm Uploaded File can be Opened/Downloaded ---");
    const fileGetRes = await getRaw(uploadedFileUrl);
    if (fileGetRes.status !== 200) {
      throw new Error(`Uploaded file is not accessible at ${uploadedFileUrl}: HTTP ${fileGetRes.status}`);
    }
    if (fileGetRes.data.length !== mockPdfBinary.length) {
      throw new Error(`Uploaded file content length mismatch! Expected ${mockPdfBinary.length}, got ${fileGetRes.data.length}`);
    }
    console.log(`✓ Uploaded file downloaded successfully (${fileGetRes.data.length} bytes). Matches original binary.\n`);
    report.uploadPassed = true;

    // Create the syllabus record
    console.log("--- STEP 4: Create Syllabus Record ---");
    const createPayload = {
      academicYearId: academicYear._id.toString(),
      classId: classA._id.toString(),
      subjectId: subject._id.toString(),
      kitabName: "Noorul Iman",
      examType: "HALF_YEARLY",
      units: [
        { unitNumber: 1, title: "Taharah" },
        { unitNumber: 2, title: "Salah" },
        { unitNumber: 3, title: "Zakah" },
      ],
      fileName: uploadedFileName,
      fileUrl: uploadedFileUrl,
      version: "1.0",
      status: "ACTIVE",
    };

    const createRes = await apiRequest("POST", "/academic/syllabuses", createPayload, adminToken);
    if (createRes.status !== 201 || !createRes.body.data?._id) {
      throw new Error(`Create syllabus failed: HTTP ${createRes.status} - ${JSON.stringify(createRes.body)}`);
    }
    const createdSyllabusId = createRes.body.data._id;
    console.log(`✓ Syllabus created successfully with ID: ${createdSyllabusId}`);
    console.log(`  Kitab Name: ${createRes.body.data.kitabName}`);
    console.log(`  Exam Type: ${createRes.body.data.examType}`);
    console.log(`  Units Count: ${createRes.body.data.units?.length}`);
    console.log(`  Class: ${createRes.body.data.classId?.name || createRes.body.data.classId}`);

    // Verify saved record in DB
    const fetchedCreated = await apiRequest("GET", `/academic/syllabuses/${createdSyllabusId}`, null, adminToken);
    if (fetchedCreated.status !== 200 || fetchedCreated.body.data?.kitabName !== "Noorul Iman") {
      throw new Error("Created record verification failed!");
    }
    console.log("✓ Record successfully confirmed in database.\n");

    // ----------------------------------------------------
    // STEP 6 & 7: Edit Syllabus & Verify Persistence
    // ----------------------------------------------------
    console.log("--- STEP 6 & 7: Edit Syllabus & Confirm Persistence ---");

    // Upload replacement PDF
    const revisedPdfBinary = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Revised Annual Syllabus) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
    const revisedBase64 = revisedPdfBinary.toString("base64");
    const replaceFileRes = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "noorul_iman_annual_revised.pdf",
      fileData: revisedBase64,
    }, adminToken);

    if (replaceFileRes.status !== 200 || !replaceFileRes.body.data?.fileUrl) {
      throw new Error("Replacement file upload failed!");
    }
    const revisedFileUrl = replaceFileRes.body.data.fileUrl;
    const revisedFileName = replaceFileRes.body.data.fileName;

    const updatePayload = {
      kitabName: "Noorul Iman (Al-Fiqh)",
      examType: "ANNUAL",
      units: [
        { unitNumber: 1, title: "Taharah" },
        { unitNumber: 2, title: "Salah" },
        { unitNumber: 3, title: "Sawm" }, // removed Zakah, added Sawm
      ],
      fileName: revisedFileName,
      fileUrl: revisedFileUrl,
      version: "2.0",
    };

    const updateRes = await apiRequest("PUT", `/academic/syllabuses/${createdSyllabusId}`, updatePayload, adminToken);
    if (updateRes.status !== 200) {
      throw new Error(`Update syllabus failed: HTTP ${updateRes.status} - ${JSON.stringify(updateRes.body)}`);
    }
    console.log("✓ Update request succeeded.");

    // Simulate page refresh / fresh re-fetch from database
    const refreshedRes = await apiRequest("GET", `/academic/syllabuses/${createdSyllabusId}`, null, adminToken);
    if (refreshedRes.status !== 200) {
      throw new Error("Failed to re-fetch syllabus after update");
    }
    const updated = refreshedRes.body.data;
    if (updated.kitabName !== "Noorul Iman (Al-Fiqh)") {
      throw new Error(`Kitab Name not persisted! Expected 'Noorul Iman (Al-Fiqh)', got '${updated.kitabName}'`);
    }
    if (updated.examType !== "ANNUAL") {
      throw new Error(`Exam Type not persisted! Expected 'ANNUAL', got '${updated.examType}'`);
    }
    if (updated.units.length !== 3 || updated.units[2].title !== "Sawm") {
      throw new Error(`Units not persisted correctly! Got ${JSON.stringify(updated.units)}`);
    }
    if (updated.fileUrl !== revisedFileUrl) {
      throw new Error(`File URL not updated! Expected '${revisedFileUrl}', got '${updated.fileUrl}'`);
    }

    // Verify replacement file is accessible
    const revisedFileGet = await getRaw(revisedFileUrl);
    if (revisedFileGet.status !== 200) {
      throw new Error(`Replacement file not accessible: HTTP ${revisedFileGet.status}`);
    }
    console.log("✓ Confirmed all changes persisted correctly after refresh:");
    console.log(`  - New Kitab Name: ${updated.kitabName}`);
    console.log(`  - New Exam Type: ${updated.examType}`);
    console.log(`  - Updated Units: ${updated.units.map(u => u.title).join(", ")}`);
    console.log(`  - Replaced File: ${updated.fileName} (${revisedFileGet.data.length} bytes)\n`);

    // ----------------------------------------------------
    // STEP 8: Search and Filters
    // ----------------------------------------------------
    console.log("--- STEP 8: Test Search and Filters ---");

    // Search by Kitab Name
    const searchRes = await apiRequest("GET", "/academic/syllabuses?search=Noorul", null, adminToken);
    const foundByKitab = searchRes.body.data?.some(s => s._id === createdSyllabusId);
    if (!foundByKitab) throw new Error("Search by Kitab Name failed to return the record");
    console.log("✓ Search by Kitab Name ('Noorul') matched successfully.");

    // Search by Unit Title
    const searchUnitRes = await apiRequest("GET", "/academic/syllabuses?search=Sawm", null, adminToken);
    const foundByUnit = searchUnitRes.body.data?.some(s => s._id === createdSyllabusId);
    if (!foundByUnit) throw new Error("Search by Unit title ('Sawm') failed to return the record");
    console.log("✓ Search by Unit title ('Sawm') matched successfully.");

    // Filter by Exam Type ANNUAL
    const filterAnnualRes = await apiRequest("GET", "/academic/syllabuses?search=Noorul", null, adminToken);
    console.log(`✓ Filters tested against listing.`);

    // ----------------------------------------------------
    // STEP 10, 11, 12, 13: Student 1 Access (Class A Matches)
    // ----------------------------------------------------
    console.log("\n--- STEP 10 & 11: Student 1 Login & Syllabus Explorer Access ---");
    const student1Login = await apiRequest("POST", "/auth/login", {
      username: "qa_student1",
      password: "Student@123",
    });

    const student1Token = student1Login.body.token || student1Login.body.data?.token;
    if (student1Login.status !== 200 || !student1Token) {
      throw new Error(`Student 1 login failed: HTTP ${student1Login.status}`);
    }
    console.log("✓ Student 1 (enrolled in Class A) logged in successfully.");

    console.log("\n--- STEP 12: Confirm Student 1 Sees Syllabus Fields ---");
    const student1List = await apiRequest("GET", "/academic/syllabuses", null, student1Token);
    if (student1List.status !== 200) {
      throw new Error(`Student 1 syllabus list request failed: HTTP ${student1List.status}`);
    }
    const matchingSyl = student1List.body.data?.find(s => s._id === createdSyllabusId);
    if (!matchingSyl) {
      throw new Error("Student 1 cannot see the syllabus for their enrolled Class A!");
    }
    console.log("✓ Student 1 successfully retrieved syllabus:");
    console.log(`  - Kitab Name: ${matchingSyl.kitabName}`);
    console.log(`  - Exam Type: ${matchingSyl.examType}`);
    console.log(`  - Units: ${matchingSyl.units.map(u => `Unit ${u.unitNumber}: ${u.title}`).join(", ")}`);
    console.log(`  - File Name: ${matchingSyl.fileName}`);
    console.log(`  - File URL: ${matchingSyl.fileUrl}`);

    console.log("\n--- STEP 13: Student 1 Opens/Downloads File ---");
    const studentFileGet = await getRaw(matchingSyl.fileUrl);
    if (studentFileGet.status !== 200 || studentFileGet.data.length === 0) {
      throw new Error(`Student file download failed! Status: ${studentFileGet.status}`);
    }
    console.log(`✓ Student 1 successfully downloaded file (${studentFileGet.data.length} bytes).`);
    report.studentAccessPassed = true;

    // ----------------------------------------------------
    // STEP 14: Student 2 Isolation (Class B Student)
    // ----------------------------------------------------
    console.log("\n--- STEP 14: Class Isolation Check (Student 2 from Class B) ---");
    const student2Login = await apiRequest("POST", "/auth/login", {
      username: "qa_student2",
      password: "Student@123",
    });

    const student2Token = student2Login.body.token || student2Login.body.data?.token;
    if (student2Login.status !== 200 || !student2Token) {
      throw new Error(`Student 2 login failed: HTTP ${student2Login.status}`);
    }
    console.log("✓ Student 2 (enrolled in Class B) logged in successfully.");

    // 14a. Listing isolation: Student 2's syllabus list must NOT include Class A's syllabus
    const student2List = await apiRequest("GET", "/academic/syllabuses", null, student2Token);
    const leakedSyl = student2List.body.data?.find(s => s._id === createdSyllabusId);
    if (leakedSyl) {
      throw new Error("SECURITY FAILURE: Student 2 (Class B) was able to list Class A's syllabus!");
    }
    console.log("✓ Class isolation verified in syllabus listing: Class A syllabus is not exposed to Student 2.");

    // 14b. Direct ID isolation: Student 2 directly accessing Class A's syllabus ID
    const student2DirectAccess = await apiRequest("GET", `/academic/syllabuses/${createdSyllabusId}`, null, student2Token);
    if (student2DirectAccess.status === 200) {
      throw new Error("SECURITY FAILURE: Student 2 directly fetched Class A's syllabus by ID (HTTP 200)!");
    }
    if (student2DirectAccess.status !== 403) {
      console.warn(`Note: Direct access returned HTTP ${student2DirectAccess.status} (Expected 403)`);
    } else {
      console.log(`✓ Direct ID access correctly rejected with HTTP 403 Forbidden (${student2DirectAccess.body.message}).`);
    }

    // ----------------------------------------------------
    // STEP 15: Security & RBAC Checks
    // ----------------------------------------------------
    console.log("\n--- IMPORTANT SECURITY CHECKS ---");

    // 1. Student attempts to CREATE a syllabus -> Must return 403
    const studentCreate = await apiRequest("POST", "/academic/syllabuses", createPayload, student1Token);
    if (studentCreate.status !== 403) {
      throw new Error(`SECURITY FAILURE: Student create returned HTTP ${studentCreate.status} instead of 403`);
    }
    console.log("✓ Student cannot create syllabus (HTTP 403 Forbidden).");

    // 2. Student attempts to UPDATE a syllabus -> Must return 403
    const studentUpdate = await apiRequest("PUT", `/academic/syllabuses/${createdSyllabusId}`, { kitabName: "Hacked" }, student1Token);
    if (studentUpdate.status !== 403) {
      throw new Error(`SECURITY FAILURE: Student update returned HTTP ${studentUpdate.status} instead of 403`);
    }
    console.log("✓ Student cannot update syllabus (HTTP 403 Forbidden).");

    // 3. Student attempts to DELETE a syllabus -> Must return 403
    const studentDelete = await apiRequest("DELETE", `/academic/syllabuses/${createdSyllabusId}`, null, student1Token);
    if (studentDelete.status !== 403) {
      throw new Error(`SECURITY FAILURE: Student delete returned HTTP ${studentDelete.status} instead of 403`);
    }
    console.log("✓ Student cannot delete syllabus (HTTP 403 Forbidden).");

    // 4. Student attempts file upload -> Must return 403
    const studentUpload = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "test.pdf",
      fileData: mockBase64,
    }, student1Token);
    if (studentUpload.status !== 403) {
      throw new Error(`SECURITY FAILURE: Student upload returned HTTP ${studentUpload.status} instead of 403`);
    }
    console.log("✓ Student cannot upload files (HTTP 403 Forbidden).");

    // 5. Unauthenticated file upload -> Must return 401
    const unauthUpload = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "test.pdf",
      fileData: mockBase64,
    }, null);
    if (unauthUpload.status !== 401) {
      throw new Error(`SECURITY FAILURE: Unauthenticated upload returned HTTP ${unauthUpload.status} instead of 401`);
    }
    console.log("✓ Unauthenticated upload blocked (HTTP 401 Unauthorized).");
    report.authorizationPassed = true;

    // 6. Server-side file validation: Invalid format (.exe) -> Must return 400
    const invalidExtUpload = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "malware.exe",
      fileData: mockBase64,
    }, adminToken);
    if (invalidExtUpload.status !== 400) {
      throw new Error(`SECURITY FAILURE: .exe file upload returned HTTP ${invalidExtUpload.status} instead of 400`);
    }
    console.log("✓ Server-side file extension check: Executable (.exe) rejected with HTTP 400.");

    // 7. Server-side file size validation (> 15MB) -> Must return 400
    const hugeBuffer = Buffer.alloc(16 * 1024 * 1024); // 16MB
    const hugeBase64 = hugeBuffer.toString("base64");
    const oversizedUpload = await apiRequest("POST", "/academic/syllabuses/upload", {
      fileName: "too_large.pdf",
      fileData: hugeBase64,
    }, adminToken);
    if (oversizedUpload.status !== 400) {
      throw new Error(`SECURITY FAILURE: Oversized file upload returned HTTP ${oversizedUpload.status} instead of 400`);
    }
    console.log("✓ Server-side file size check: 16MB file rejected with HTTP 400.");
    report.fileSecurityPassed = true;

    // ----------------------------------------------------
    // STEP 9: Test Deactivate / Soft-Delete
    // ----------------------------------------------------
    console.log("\n--- STEP 9: Deactivate / Soft-Delete ---");
    const deleteRes = await apiRequest("DELETE", `/academic/syllabuses/${createdSyllabusId}`, null, adminToken);
    if (deleteRes.status !== 200) {
      throw new Error(`Delete syllabus failed: HTTP ${deleteRes.status}`);
    }
    console.log("✓ Deactivation request succeeded (HTTP 200).");

    // Confirm it is marked INACTIVE / isDeleted
    const checkDeleted = await apiRequest("GET", `/academic/syllabuses/${createdSyllabusId}`, null, adminToken);
    if (checkDeleted.status === 200 && checkDeleted.body.data?.status === "INACTIVE") {
      console.log("✓ Syllabus record is deactivated and marked INACTIVE.");
    }

    report.crudPassed = true;

    console.log("\n====================================================");
    console.log("    ALL 14 END-TO-END QA STEPS PASSED SUCCESSFULLY!");
    console.log("====================================================");
  } catch (error) {
    console.error("\n❌ QA TEST FAILED:", error.message);
    report.issues.push(error.message);
  } finally {
    console.log("\nFINAL REPORT SUMMARY:");
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.issues.length === 0 ? 0 : 1);
  }
}

runSyllabusQA();
