require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');
const ParentProfile = require('../src/modules/parents/parent.model');
const { generateToken } = require('../src/shared/utils/jwt');

async function testParentProfileRequest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const parentUser = await User.findOne({ role: 'PARENT', status: 'ACTIVE' }).lean();
  if (!parentUser) {
    console.error('No active parent user found in DB!');
    await mongoose.disconnect();
    return;
  }
  console.log('Testing with Parent User:', parentUser._id, parentUser.email, parentUser.role);

  const parentProfile = await ParentProfile.findOne({ userId: parentUser._id }).lean();
  console.log('DB ParentProfile found:', !!parentProfile, parentProfile ? { _id: parentProfile._id, studentIds: parentProfile.studentIds } : null);

  const token = generateToken({
    userId: parentUser._id.toString(),
    role: parentUser.role,
  });

  // Call GET http://localhost:5000/api/parents/me
  try {
    const rawRes = await fetch('http://localhost:5000/api/parents/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const status = rawRes.status;
    const body = await rawRes.json();

    console.log('\n--- API RESPONSE ---');
    console.log('HTTP Status:', status);
    console.log('Response Body:', JSON.stringify(body, null, 2));

    console.log('\n--- FRONTEND COMPATIBILITY ANALYSIS ---');
    console.log('body.success:', body.success);
    console.log('body.data?.parent:', body.data?.parent);
    console.log('body.parent:', !!body.parent);
    
    if (body.success && body.data?.parent) {
      console.log('Current frontend check (body.data?.parent): MATCH (SUCCESS)');
    } else {
      console.log('Current frontend check (body.data?.parent): MISMATCH! Frontend will fail with error: "' + (body.message || 'Unable to load profile.') + '"');
    }
  } catch (err) {
    console.error('API request failed:', err.message);
  }

  await mongoose.disconnect();
}

testParentProfileRequest().catch(console.error);
