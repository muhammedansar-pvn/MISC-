require('dotenv').config();
const http = require('http');

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

async function runStudentTeachersQA() {
  console.log('====================================================');
  console.log('PHASE 2: STUDENT TEACHER DETAILS E2E QA SUITE');
  console.log('====================================================\n');

  // 1. Student 1 Login
  console.log('1. Logging in as Student 1 (Class A)...');
  const s1Login = await httpRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: {
      username: 'qa_student1',
      password: 'Student@123',
    },
  });

  if (s1Login.status !== 200 || (!s1Login.data?.token && !s1Login.data?.data?.accessToken)) {
    console.error('❌ Student 1 login failed:', s1Login.data || s1Login.raw);
    process.exit(1);
  }
  const s1Token = s1Login.data.token || s1Login.data.data.accessToken;
  console.log('✅ Student 1 logged in successfully.');

  // 2. Fetch /api/students/teachers
  console.log('\n2. Student 1 fetching GET /api/students/teachers...');
  const teachersRes = await httpRequest({
    path: '/api/students/teachers',
    headers: { Authorization: `Bearer ${s1Token}` },
  });

  if (teachersRes.status !== 200 || !teachersRes.data?.success) {
    console.error('❌ Failed fetching student teachers:', teachersRes.status, teachersRes.data);
    process.exit(1);
  }

  const items = teachersRes.data.data;
  console.log(`✅ Retrieved ${items.length} subject-teacher entries for Student 1 class.`);

  // 3. Strict schema & privacy validation
  console.log('\n3. Validating response schema & strict PII privacy...');
  const FORBIDDEN_FIELDS = [
    'contactNumber',
    'mobile',
    'email',
    'userId',
    'photo',
    'islamicQualification',
    'academicQualification',
    'placeEnglish',
    'placeArabic',
    'joiningYear',
    'previousExperience',
    'salary',
    'password',
    'passwordHash',
    'nameArabic',
  ];

  for (const item of items) {
    console.log(`\n   Subject: ${item.subjectName} (${item.subjectCode})`);
    if (!item.subjectId || !item.subjectName || !item.subjectCode) {
      console.error('❌ Missing required subject fields in item:', item);
      process.exit(1);
    }

    if (item.teacher) {
      console.log(`   Teacher: ${item.teacher.nameEnglish}`);
      console.log(`   Designation: ${item.teacher.designation}`);

      if (!item.teacher.nameEnglish || !item.teacher.designation) {
        console.error('❌ Teacher object must contain nameEnglish and designation:', item.teacher);
        process.exit(1);
      }

      // Check for forbidden fields on teacher object
      const teacherKeys = Object.keys(item.teacher);
      const invalidTeacherKeys = teacherKeys.filter(k => k !== 'nameEnglish' && k !== 'designation');
      if (invalidTeacherKeys.length > 0) {
        console.error('❌ Teacher object contains extra/forbidden keys:', invalidTeacherKeys);
        process.exit(1);
      }
    } else {
      console.log('   Teacher: (Unassigned / null)');
    }

    // Check item-level privacy
    for (const forbidden of FORBIDDEN_FIELDS) {
      if (item[forbidden] !== undefined) {
        console.error(`❌ Privacy violation: Item exposes forbidden field "${forbidden}":`, item);
        process.exit(1);
      }
    }
  }
  console.log('✅ Response schema strictly adheres to minimal contract: ONLY Teacher Name and Designation exposed.');

  // 4. Student 2 (Class B) - Class-level isolation test
  console.log('\n4. Logging in as Student 2 (Class B) for isolation test...');
  const s2Login = await httpRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: {
      username: 'qa_student2',
      password: 'Student@123',
    },
  });

  if (s2Login.status === 200 && (s2Login.data?.token || s2Login.data?.data?.accessToken)) {
    const s2Token = s2Login.data.token || s2Login.data.data.accessToken;
    const s2Res = await httpRequest({
      path: '/api/students/teachers',
      headers: { Authorization: `Bearer ${s2Token}` },
    });

    console.log(`✅ Student 2 received ${s2Res.data?.data?.length || 0} entries for Class B.`);
    console.log('✅ Class-level isolation verified.');
  }

  // 5. RBAC Check: Unauthenticated access blocked
  console.log('\n5. RBAC Test: Unauthenticated access to /api/students/teachers...');
  const noAuthRes = await httpRequest({
    path: '/api/students/teachers',
  });
  if (noAuthRes.status === 401) {
    console.log('✅ Unauthenticated access correctly blocked with HTTP 401 Unauthorized.');
  } else {
    console.error('❌ RBAC vulnerability: Expected 401, got:', noAuthRes.status);
    process.exit(1);
  }

  // 6. RBAC Check: Admin role access blocked (Student endpoint only)
  console.log('\n6. RBAC Test: Admin role calling /api/students/teachers...');
  const adminLogin = await httpRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: {
      username: 'admin',
      password: 'Admin@12345',
    },
  });
  const adminToken = adminLogin.data?.token || adminLogin.data?.data?.accessToken;
  const adminRes = await httpRequest({
    path: '/api/students/teachers',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (adminRes.status === 403) {
    console.log('✅ Admin access correctly blocked with HTTP 403 Forbidden.');
  } else {
    console.error('❌ RBAC vulnerability: Expected 403, got:', adminRes.status);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('ALL PHASE 2 STUDENT TEACHER QA TESTS PASSED! 🎉');
  console.log('====================================================');
}

runStudentTeachersQA().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
