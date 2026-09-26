const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const StudentProfile = require("../src/modules/students/student.model");
const User = require("../src/modules/users/user.model");
const Class = require("../src/modules/academics/class.model");

async function diagnoseOrphanStudentProfiles() {
  console.log("==========================================================================");
  console.log("DIAGNOSTIC AUDIT: Orphan & Inconsistent StudentProfiles");
  console.log("==========================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI not found in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[DB] Connected successfully to database.\n");

  try {
    const allProfiles = await StudentProfile.find().lean();
    console.log(`[Diagnostic] Total StudentProfiles in database: ${allProfiles.length}`);

    const allUsers = await User.find({ role: "STUDENT" }).lean();
    console.log(`[Diagnostic] Total Student Users in database: ${allUsers.length}\n`);

    const userMap = new Map();
    const allUsersList = await User.find().lean();
    allUsersList.forEach((u) => {
      userMap.set(u._id.toString(), u);
    });

    const missingUserOrphans = [];
    const deletedUserOrphans = [];
    const statusMismatchProfiles = [];
    const orphanUsersWithoutProfile = [];

    // 1. Audit StudentProfiles -> User
    for (const profile of allProfiles) {
      const userIdStr = profile.userId ? profile.userId.toString() : null;
      if (!userIdStr || !userMap.has(userIdStr)) {
        missingUserOrphans.push(profile);
      } else {
        const user = userMap.get(userIdStr);
        if (user.isDeleted === true && profile.isDeleted !== true) {
          deletedUserOrphans.push({ profile, user });
        } else if (profile.isDeleted !== true && user.isDeleted !== true) {
          // Check status synchronization
          if (user.status !== profile.status) {
            statusMismatchProfiles.push({ profile, user });
          }
        }
      }
    }

    // 2. Audit Student Users -> StudentProfile
    const profileUserIdSet = new Set(
      allProfiles.map((p) => (p.userId ? p.userId.toString() : null)).filter(Boolean)
    );
    for (const u of allUsers) {
      if (u.isDeleted !== true && !profileUserIdSet.has(u._id.toString())) {
        orphanUsersWithoutProfile.push(u);
      }
    }

    console.log("--------------------------------------------------------------------------");
    console.log("FINDINGS:");
    console.log("--------------------------------------------------------------------------");

    console.log(`1. StudentProfiles whose User record does NOT exist at all: ${missingUserOrphans.length}`);
    if (missingUserOrphans.length > 0) {
      console.log("\nDetails of Missing User Orphans:");
      missingUserOrphans.forEach((p, idx) => {
        console.log(`  [${idx + 1}] Profile ID: ${p._id}`);
        console.log(`      Reg No: ${p.registrationNumber}`);
        console.log(`      Name: ${p.nameEnglish || "N/A"}`);
        console.log(`      UserId: ${p.userId}`);
        console.log(`      Class ID: ${p.classId || "N/A"}`);
        console.log(`      Profile Status: ${p.status}, isDeleted: ${p.isDeleted}`);
      });
    }

    console.log(`\n2. StudentProfiles whose User isDeleted === true, but Profile isDeleted === false: ${deletedUserOrphans.length}`);
    if (deletedUserOrphans.length > 0) {
      console.log("\nDetails of Deleted User Orphans (User deleted, Profile active):");
      deletedUserOrphans.forEach((item, idx) => {
        console.log(`  [${idx + 1}] Profile ID: ${item.profile._id}`);
        console.log(`      Reg No: ${item.profile.registrationNumber}`);
        console.log(`      Name: ${item.profile.nameEnglish || item.user.name || "N/A"}`);
        console.log(`      UserId: ${item.user._id} (${item.user.email})`);
        console.log(`      User status: ${item.user.status}, isDeleted: ${item.user.isDeleted}`);
        console.log(`      Profile status: ${item.profile.status}, isDeleted: ${item.profile.isDeleted}`);
      });
    }

    console.log(`\n3. Active Profiles with Status Mismatch (User vs Profile): ${statusMismatchProfiles.length}`);
    if (statusMismatchProfiles.length > 0) {
      statusMismatchProfiles.forEach((item, idx) => {
        console.log(`  [${idx + 1}] Profile ID: ${item.profile._id}, User: ${item.user.email}`);
        console.log(`      User status: ${item.user.status} vs Profile status: ${item.profile.status}`);
      });
    }

    console.log(`\n4. Student Users with NO StudentProfile: ${orphanUsersWithoutProfile.length}`);
    if (orphanUsersWithoutProfile.length > 0) {
      orphanUsersWithoutProfile.forEach((u, idx) => {
        console.log(`  [${idx + 1}] User ID: ${u._id}, Email: ${u.email}, Name: ${u.name}, Status: ${u.status}`);
      });
    }

    console.log("\n==========================================================================");
    console.log("DIAGNOSTIC AUDIT COMPLETE (Read-Only. Zero records modified).");
    console.log("==========================================================================");
  } catch (err) {
    console.error("Diagnostic error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

diagnoseOrphanStudentProfiles();
