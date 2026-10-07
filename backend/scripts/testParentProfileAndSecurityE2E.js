require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');
const ParentProfile = require('../src/modules/parents/parent.model');
const StudentProfile = require('../src/modules/students/student.model');
const { generateToken } = require('../src/shared/utils/jwt');

async function runTests() {
  console.log('====================================================');
  console.log('PARENT PROFILE & SECURITY E2E VERIFICATION SUITE');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // Find an active parent user who has an active linked student
  const activeStudentWithParent = await StudentProfile.findOne({
    parentUserId: { $ne: null },
    isDeleted: { $ne: true },
  }).lean();

  let parentUser = null;
  if (activeStudentWithParent) {
    parentUser = await User.findOne({ _id: activeStudentWithParent.parentUserId, role: 'PARENT' }).lean();
  }
  if (!parentUser) {
    parentUser = await User.findOne({ role: 'PARENT', status: 'ACTIVE' }).lean();
  }
  if (!parentUser) {
    throw new Error('No active parent user found in DB');
  }

  const parentToken = generateToken({
    userId: parentUser._id.toString(),
    role: 'PARENT',
  });

  // Find a student user
  const studentUser = await User.findOne({ role: 'STUDENT', status: 'ACTIVE' }).lean();
  const studentToken = studentUser ? generateToken({
    userId: studentUser._id.toString(),
    role: 'STUDENT',
  }) : null;

  // TEST 1: Unauthenticated request to /api/parents/me
  console.log('\n--- Test 1: Unauthenticated request ---');
  const res1 = await fetch('http://localhost:5000/api/parents/me');
  assert(res1.status === 401, 'Unauthenticated request returns 401');

  // TEST 2: Student role accessing /api/parents/me (RBAC)
  console.log('\n--- Test 2: Student role accessing Parent endpoint (RBAC) ---');
  if (studentToken) {
    const res2 = await fetch('http://localhost:5000/api/parents/me', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(res2.status === 403, 'STUDENT role returns 403 Forbidden for Parent profile');
  }

  // TEST 3: Invalid token
  console.log('\n--- Test 3: Invalid token ---');
  const res3 = await fetch('http://localhost:5000/api/parents/me', {
    headers: { Authorization: 'Bearer invalid.token.value' },
  });
  assert(res3.status === 401, 'Invalid token returns 401');

  // TEST 4: Valid parent token fetching profile
  console.log('\n--- Test 4: Valid Parent profile retrieval ---');
  const res4 = await fetch('http://localhost:5000/api/parents/me', {
    headers: { Authorization: `Bearer ${parentToken}` },
  });
  assert(res4.status === 200, 'Valid parent token returns 200 OK');
  const body4 = await res4.json();
  assert(body4.success === true, 'Response body success is true');
  assert(!!body4.parent, 'Response body contains parent entity');
  assert(!!body4.data?.parent, 'Response body contains standard data.parent entity');
  assert(body4.parent._id.toString() === body4.data.parent._id.toString(), 'Both parent and data.parent match');

  // TEST 5: Get parent students endpoint
  console.log('\n--- Test 5: Get linked students endpoint ---');
  const res5 = await fetch('http://localhost:5000/api/parents/students', {
    headers: { Authorization: `Bearer ${parentToken}` },
  });
  assert(res5.status === 200, 'GET /api/parents/students returns 200 OK');
  const body5 = await res5.json();
  assert(body5.success === true, 'Students response success is true');
  assert(Array.isArray(body5.students), 'Response contains students array');
  assert(Array.isArray(body5.data?.students), 'Response contains standard data.students array');

  // TEST 6: IDOR Protection on linked student details
  console.log('\n--- Test 6: IDOR Protection on student details ---');
  const linkedStudentId = body4.parent.studentIds?.[0]?._id;
  if (linkedStudentId) {
    // Authorized student access
    const res6a = await fetch(`http://localhost:5000/api/parents/students/${linkedStudentId}`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    assert(res6a.status === 200, 'Parent can access linked student details');
    const body6a = await res6a.json();
    assert(!!body6a.student && !!body6a.data?.student, 'Student details returned in both student and data.student');

    // Find an unlinked student
    const unlinkedStudent = await StudentProfile.findOne({
      _id: { $ne: linkedStudentId },
      isDeleted: { $ne: true },
    }).lean();

    if (unlinkedStudent) {
      const res6b = await fetch(`http://localhost:5000/api/parents/students/${unlinkedStudent._id}`, {
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      assert(res6b.status === 403, 'Parent CANNOT access unlinked student (IDOR 403 Access denied)');
    }
  }

  // TEST 7: IDOR Protection on student syllabus
  console.log('\n--- Test 7: IDOR Protection on student syllabus ---');
  if (linkedStudentId) {
    const res7a = await fetch(`http://localhost:5000/api/parents/students/${linkedStudentId}/syllabus`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    assert(res7a.status === 200, 'Parent can access linked student syllabus');
    const body7a = await res7a.json();
    assert(Array.isArray(body7a.syllabuses) && Array.isArray(body7a.data), 'Syllabus returned in both syllabuses and data');

    const unlinkedStudent = await StudentProfile.findOne({
      _id: { $ne: linkedStudentId },
      isDeleted: { $ne: true },
    }).lean();

    if (unlinkedStudent) {
      const res7b = await fetch(`http://localhost:5000/api/parents/students/${unlinkedStudent._id}/syllabus`, {
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      assert(res7b.status === 403, 'Parent CANNOT access unlinked student syllabus (IDOR 403)');
    }
  }

  // TEST 8: Self-Healing Parent Profile
  console.log('\n--- Test 8: Self-healing parent profile ---');
  const tempParentUser = await User.create({
    name: 'Temporary Self Healing Parent',
    email: `temp-parent-${Date.now()}@yopmail.com`,
    username: `temp-parent-${Date.now()}@yopmail.com`,
    role: 'PARENT',
    status: 'ACTIVE',
    emailVerified: true,
  });

  const tempToken = generateToken({
    userId: tempParentUser._id.toString(),
    role: 'PARENT',
  });

  // Verify ParentProfile does NOT exist initially for this temp user
  const initialProfile = await ParentProfile.findOne({ userId: tempParentUser._id });
  assert(!initialProfile, 'New temp parent initially has no ParentProfile');

  // Calling /api/parents/me triggers self-healing
  const res8 = await fetch('http://localhost:5000/api/parents/me', {
    headers: { Authorization: `Bearer ${tempToken}` },
  });
  assert(res8.status === 200, 'Self-healing created profile and returned 200 OK');
  const body8 = await res8.json();
  assert(body8.success === true, 'Self-healing response success is true');
  assert(!!body8.data?.parent, 'Self-healing response contains data.parent');
  assert(body8.data.parent.name === tempParentUser.name, 'Self-healed profile matches parent user name');

  // Cleanup temp user and profile
  await ParentProfile.deleteMany({ userId: tempParentUser._id });
  await User.findByIdAndDelete(tempParentUser._id);
  console.log('✓ Cleaned up temp self-healing test data');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('====================================================');

  await mongoose.disconnect();

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
