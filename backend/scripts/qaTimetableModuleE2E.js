require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const connectDB = require('../src/config/db');
const User = require('../src/modules/users/user.model');
const StudentProfile = require('../src/modules/students/student.model');
const Timetable = require('../src/modules/academics/timetable.model');
const { hashPassword } = require('../src/shared/utils/password');

function httpRequest({ port = 5000, path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTimetableQA() {
  console.log('====================================================');
  console.log('TIMETABLE MODULE END-TO-END QA SUITE');
  console.log('====================================================\n');

  await connectDB();
  try {
    await Timetable.syncIndexes();
    console.log('✅ Timetable MongoDB indexes synced.');
  } catch (idxErr) {
    console.warn('Index sync warning:', idxErr.message);
  }

  // 1. Login as Admin
  console.log('1. Logging in as Admin...');
  const adminLogin = await httpRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: {
      username: 'admin',
      password: 'Admin@12345',
    },
  });

  if (adminLogin.status !== 200 || (!adminLogin.data?.token && !adminLogin.data?.data?.accessToken)) {
    console.error('❌ Admin login failed:', adminLogin.data || adminLogin.raw);
    process.exit(1);
  }
  const adminToken = adminLogin.data.token || adminLogin.data.data.accessToken;
  console.log('✅ Admin login successful.');

  // 2. Fetch academic reference records
  console.log('\n2. Fetching academic reference records...');
  const yearsRes = await httpRequest({
    path: '/api/academic/academic-years',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const classesRes = await httpRequest({
    path: '/api/academic/classes',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const subjectsRes = await httpRequest({
    path: '/api/academic/subjects',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const facultiesRes = await httpRequest({
    path: '/api/faculty',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const years = yearsRes.data?.data?.years || yearsRes.data?.data || [];
  const classes = classesRes.data?.data?.classes || classesRes.data?.data || [];
  const subjects = subjectsRes.data?.data?.subjects || subjectsRes.data?.data || [];
  const faculties = facultiesRes.data?.data?.faculties || facultiesRes.data?.data || [];

  if (!years.length || !classes.length || !subjects.length || !faculties.length) {
    console.error('❌ Missing prerequisite seed data:', {
      years: years.length,
      classes: classes.length,
      subjects: subjects.length,
      faculties: faculties.length,
    });
    process.exit(1);
  }

  const academicYear = years[0];
  const testClassA = classes[0];
  const testClassB = classes.length > 1 ? classes[1] : classes[0];
  const subject1 = subjects[0];
  const subject2 = subjects.length > 1 ? subjects[1] : subjects[0];
  const faculty1 = faculties[0];

  console.log(`✅ Using Academic Year: ${academicYear.yearName || academicYear.name || academicYear._id}`);
  console.log(`✅ Class A: ${testClassA.name || testClassA.code} (${testClassA._id})`);
  console.log(`✅ Class B: ${testClassB.name || testClassB.code} (${testClassB._id})`);
  console.log(`✅ Subject 1: ${subject1.subjectName || subject1.name} (${subject1._id})`);
  console.log(`✅ Subject 2: ${subject2.subjectName || subject2.name} (${subject2._id})`);
  console.log(`✅ Faculty: ${faculty1.fullName || faculty1.nameEnglish || faculty1._id}`);

  // Setup test students in DB
  const pwd = await hashPassword('Student@123');
  let student1User = await User.findOne({ username: 'qa_student1' });
  if (!student1User) {
    student1User = await User.create({
      username: 'qa_student1',
      email: 'qa.student1@misc.test',
      passwordHash: pwd,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
      mobile: '1111111111',
    });
  } else {
    student1User.status = 'ACTIVE';
    student1User.passwordHash = pwd;
    await student1User.save();
  }

  let student1Profile = await StudentProfile.findOne({ userId: student1User._id });
  if (!student1Profile) {
    student1Profile = await StudentProfile.create({
      userId: student1User._id,
      registrationNumber: 'REG-QA-001',
      nameEnglish: 'Student One (Class A)',
      dateOfBirth: new Date('2005-01-01'),
      admissionYear: 2026,
      fatherName: 'Father One',
      motherName: 'Mother One',
      classId: testClassA._id,
      academicYearId: academicYear._id,
      status: 'ACTIVE',
    });
  } else {
    student1Profile.classId = testClassA._id;
    await student1Profile.save();
  }

  let student2User = await User.findOne({ username: 'qa_student2' });
  if (!student2User) {
    student2User = await User.create({
      username: 'qa_student2',
      email: 'qa.student2@misc.test',
      passwordHash: pwd,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: true,
      mobile: '2222222222',
    });
  } else {
    student2User.status = 'ACTIVE';
    student2User.passwordHash = pwd;
    await student2User.save();
  }

  let student2Profile = await StudentProfile.findOne({ userId: student2User._id });
  if (!student2Profile) {
    student2Profile = await StudentProfile.create({
      userId: student2User._id,
      registrationNumber: 'REG-QA-002',
      nameEnglish: 'Student Two (Class B)',
      dateOfBirth: new Date('2005-01-01'),
      admissionYear: 2026,
      fatherName: 'Father Two',
      motherName: 'Mother Two',
      classId: testClassB._id,
      academicYearId: academicYear._id,
      status: 'ACTIVE',
    });
  } else {
    student2Profile.classId = testClassB._id;
    await student2Profile.save();
  }

  console.log('✅ Student accounts verified and enrolled:');
  console.log(`   - qa_student1 -> Class A (${testClassA._id})`);
  console.log(`   - qa_student2 -> Class B (${testClassB._id})`);

  // 3. Admin creates Period 1 for Class A on MONDAY
  console.log('\n3. Admin creating Timetable Entry: Class A, MONDAY, Period 1...');
  // Clean up any existing test records for Class A MONDAY
  const existingList = await httpRequest({
    path: `/api/academic/timetables?classId=${testClassA._id}&academicYearId=${academicYear._id}&dayOfWeek=MONDAY`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const entriesToDelete = Array.isArray(existingList.data?.data)
    ? existingList.data.data
    : existingList.data?.data?.entries || [];
  if (entriesToDelete.length) {
    for (const e of entriesToDelete) {
      const delRes = await httpRequest({
        path: `/api/academic/timetables/${e._id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log(`ℹ️ Cleaned up entry ${e._id}: status ${delRes.status}`, delRes.data);
    }
  }

  await Timetable.deleteMany({ classId: testClassA._id, dayOfWeek: 'MONDAY' });
  console.log('ℹ️ Cleaned test records for repeatable QA execution.');

  const createP1Res = await httpRequest({
    path: '/api/academic/timetables',
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      academicYearId: academicYear._id,
      classId: testClassA._id,
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:30',
      endTime: '09:15',
      subjectId: subject1._id,
      facultyId: faculty1._id,
      room: 'Hall A-101',
    },
  });

  if (createP1Res.status !== 201 || !createP1Res.data?.data?._id) {
    console.error('❌ Failed creating Period 1:', createP1Res.status, createP1Res.data);
    process.exit(1);
  }
  const p1Id = createP1Res.data.data._id;
  console.log(`✅ Period 1 created with ID: ${p1Id}`);

  // 4. Test Clash Prevention: Attempt duplicate Class A + MONDAY + Period 1
  console.log('\n4. Testing Clash Prevention: Attempting duplicate Class A + MONDAY + Period 1...');
  const clashRes = await httpRequest({
    path: '/api/academic/timetables',
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      academicYearId: academicYear._id,
      classId: testClassA._id,
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:30',
      endTime: '09:15',
      subjectId: subject2._id,
      facultyId: faculty1._id,
    },
  });

  if (clashRes.status === 409) {
    console.log('✅ Clash correctly rejected with HTTP 409 Conflict:', clashRes.data?.message);
  } else {
    console.error('❌ Clash check failed! Expected 409, got:', clashRes.status, clashRes.data);
    process.exit(1);
  }

  // 5. Admin creates Period 2 for Class A on MONDAY
  console.log('\n5. Admin creating Timetable Entry: Class A, MONDAY, Period 2...');
  const createP2Res = await httpRequest({
    path: '/api/academic/timetables',
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      academicYearId: academicYear._id,
      classId: testClassA._id,
      dayOfWeek: 'MONDAY',
      periodNumber: 2,
      startTime: '09:15',
      endTime: '10:00',
      subjectId: subject2._id,
      facultyId: faculty1._id,
      room: 'Hall A-102',
    },
  });

  if (createP2Res.status !== 201 || !createP2Res.data?.data?._id) {
    console.error('❌ Failed creating Period 2:', createP2Res.status, createP2Res.data);
    process.exit(1);
  }
  const p2Id = createP2Res.data.data._id;
  console.log(`✅ Period 2 created with ID: ${p2Id}`);

  // 6. Admin updates Period 1 room
  console.log('\n6. Admin updating Period 1 room to "Main Lecture Hall"...');
  const updateRes = await httpRequest({
    path: `/api/academic/timetables/${p1Id}`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      room: 'Main Lecture Hall',
    },
  });

  if (updateRes.status === 200 && updateRes.data?.data?.room === 'Main Lecture Hall') {
    console.log('✅ Period 1 updated successfully. Room:', updateRes.data.data.room);
  } else {
    console.error('❌ Failed updating Period 1:', updateRes.status, updateRes.data);
    process.exit(1);
  }

  // 7. Student 1 login and fetch timetable
  console.log('\n7. Logging in as Student 1 (Class A)...');
  const student1Login = await httpRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: {
      username: 'qa_student1',
      password: 'Student@123',
    },
  });

  if (student1Login.status !== 200 || (!student1Login.data?.token && !student1Login.data?.data?.accessToken)) {
    console.error('❌ Student 1 login failed:', student1Login.data || student1Login.raw);
    process.exit(1);
  }
  const student1Token = student1Login.data.token || student1Login.data.data.accessToken;
  console.log('✅ Student 1 login successful.');

  console.log('\n8. Student 1 requesting /api/students/timetable...');
  const student1TtRes = await httpRequest({
    path: '/api/students/timetable',
    headers: { Authorization: `Bearer ${student1Token}` },
  });

  if (student1TtRes.status === 200 && student1TtRes.data?.success) {
    const data = student1TtRes.data.data;
    console.log(`✅ Student 1 Timetable retrieved for class: ${data.class?.name || data.class?.code}`);
    console.log(`✅ Active periods found: ${data.entries?.length}`);
    const p1Found = data.entries.find((e) => e._id === p1Id);
    const p2Found = data.entries.find((e) => e._id === p2Id);
    if (p1Found && p2Found && p1Found.room === 'Main Lecture Hall') {
      console.log('✅ Both Period 1 and Period 2 confirmed in Student 1 timetable.');
    } else {
      console.error('❌ Missing expected entries in student timetable:', { p1Found, p2Found });
      process.exit(1);
    }
  } else {
    console.error('❌ Student 1 timetable retrieval failed:', student1TtRes.status, student1TtRes.data);
    process.exit(1);
  }

  // 9. Student 2 login and isolation check
  if (testClassA._id.toString() !== testClassB._id.toString()) {
    console.log('\n9. Logging in as Student 2 (Class B)...');
    const student2Login = await httpRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        username: 'qa_student2',
        password: 'Student@123',
      },
    });

    if (student2Login.status === 200 && (student2Login.data?.token || student2Login.data?.data?.accessToken)) {
      const student2Token = student2Login.data.token || student2Login.data.data.accessToken;
      console.log('✅ Student 2 login successful.');

      const student2TtRes = await httpRequest({
        path: '/api/students/timetable',
        headers: { Authorization: `Bearer ${student2Token}` },
      });

      const s2Entries = student2TtRes.data?.data?.entries || [];
      const hasClassAPeriods = s2Entries.some((e) => e._id === p1Id || e._id === p2Id);
      if (!hasClassAPeriods) {
        console.log('✅ Data Isolation Verified: Student 2 cannot see Class A timetable entries.');
      } else {
        console.error('❌ Isolation breach! Student 2 sees Class A entries.');
        process.exit(1);
      }
    }
  }

  // 10. RBAC Security Checks: Student cannot call Admin CRUD endpoints
  console.log('\n10. RBAC Test: Student attempting to POST /api/academic/timetables...');
  const rbacPostRes = await httpRequest({
    path: '/api/academic/timetables',
    method: 'POST',
    headers: { Authorization: `Bearer ${student1Token}` },
    body: {
      academicYearId: academicYear._id,
      classId: testClassA._id,
      dayOfWeek: 'TUESDAY',
      periodNumber: 1,
      startTime: '08:30',
      endTime: '09:15',
      subjectId: subject1._id,
      facultyId: faculty1._id,
    },
  });

  if (rbacPostRes.status === 403) {
    console.log('✅ Student creation correctly blocked with HTTP 403 Forbidden.');
  } else {
    console.error('❌ RBAC vulnerability! Expected 403, got:', rbacPostRes.status);
    process.exit(1);
  }

  console.log('\n11. RBAC Test: Student attempting to DELETE /api/academic/timetables/:id...');
  const rbacDeleteRes = await httpRequest({
    path: `/api/academic/timetables/${p1Id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${student1Token}` },
  });

  if (rbacDeleteRes.status === 403) {
    console.log('✅ Student deletion correctly blocked with HTTP 403 Forbidden.');
  } else {
    console.error('❌ RBAC vulnerability! Expected 403, got:', rbacDeleteRes.status);
    process.exit(1);
  }

  // 12. Admin soft-deletes Period 2
  console.log('\n12. Admin soft-deleting Period 2...');
  const deleteRes = await httpRequest({
    path: `/api/academic/timetables/${p2Id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (deleteRes.status === 200) {
    console.log('✅ Period 2 soft-deleted successfully.');
  } else {
    console.error('❌ Failed to delete Period 2:', deleteRes.status, deleteRes.data);
    process.exit(1);
  }

  // 13. Student 1 requests timetable again - Period 2 must not be present
  console.log('\n13. Verifying Student 1 no longer sees soft-deleted Period 2...');
  const studentAfterDeleteRes = await httpRequest({
    path: '/api/students/timetable',
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const updatedEntries = studentAfterDeleteRes.data?.data?.entries || [];
  const p2StillPresent = updatedEntries.some((e) => e._id === p2Id);
  if (!p2StillPresent && updatedEntries.some((e) => e._id === p1Id)) {
    console.log('✅ Soft-deleted entry is immediately excluded from student timetable.');
  } else {
    console.error('❌ Soft delete did not filter correctly:', updatedEntries);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('ALL TIMETABLE MODULE E2E QA TESTS PASSED! 🎉');
  console.log('====================================================');
  await mongoose.disconnect();
  process.exit(0);
}

runTimetableQA().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
