const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const StudentProfile = require("../src/modules/students/student.model");
const User = require("../src/modules/users/user.model");

async function runSyncOrphans() {
  const isExecute = process.argv.includes("--execute");
  const modeLabel = isExecute ? "EXECUTION MODE (Live Database Update)" : "DRY-RUN MODE (Safe Preview, No DB Changes)";

  console.log("==========================================================================");
  console.log("SAFE ORPHAN STUDENT PROFILE SYNCHRONIZATION");
  console.log(`MODE: ${modeLabel}`);
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
    const allUsers = await User.find().lean();
    const userMap = new Map();
    allUsers.forEach((u) => userMap.set(u._id.toString(), u));

    const syncCandidates = [];

    for (const profile of allProfiles) {
      const userIdStr = profile.userId ? profile.userId.toString() : null;
      if (userIdStr && userMap.has(userIdStr)) {
        const user = userMap.get(userIdStr);
        if (user.isDeleted === true && profile.isDeleted !== true) {
          syncCandidates.push({ profile, user });
        }
      }
    }

    console.log(`[Scan Result] Found ${syncCandidates.length} StudentProfile(s) out of sync with deleted User accounts.\n`);

    if (syncCandidates.length === 0) {
      console.log("No orphan or desynchronized student profiles found. Database is completely consistent!");
      return;
    }

    console.log("--------------------------------------------------------------------------");
    console.log("RECORDS TO SYNCHRONIZE:");
    console.log("--------------------------------------------------------------------------");

    syncCandidates.forEach((item, idx) => {
      console.log(`[Record ${idx + 1}]`);
      console.log(`  Profile ID:   ${item.profile._id}`);
      console.log(`  Reg Number:   ${item.profile.registrationNumber}`);
      console.log(`  Student Name: ${item.profile.nameEnglish}`);
      console.log(`  User ID:      ${item.user._id} (${item.user.email})`);
      console.log(`  Current User:    status = "${item.user.status}", isDeleted = ${item.user.isDeleted}`);
      console.log(`  Current Profile: status = "${item.profile.status}", isDeleted = ${item.profile.isDeleted}`);
      console.log(`  Proposed Action: Set StudentProfile status = "INACTIVE", isDeleted = true (NO deletion)`);
      console.log("");
    });

    if (!isExecute) {
      console.log("==========================================================================");
      console.log("DRY-RUN COMPLETE: Zero records were modified in the database.");
      console.log("To apply these safe synchronization updates, run:");
      console.log("  node backend/scripts/syncOrphanStudentProfiles.js --execute");
      console.log("==========================================================================");
      return;
    }

    // Execution Mode
    console.log("==========================================================================");
    console.log("APPLYING SAFE SYNCHRONIZATION UPDATES...");
    console.log("==========================================================================");

    let updatedCount = 0;
    for (const item of syncCandidates) {
      await StudentProfile.findByIdAndUpdate(item.profile._id, {
        $set: {
          status: "INACTIVE",
          isDeleted: true,
        },
      });
      console.log(`  [UPDATED] Profile ${item.profile._id} (${item.profile.registrationNumber}) synchronized.`);
      updatedCount++;
    }

    console.log(`\n[SUCCESS] Safely synchronized ${updatedCount} StudentProfile record(s).`);
    console.log("All corresponding User and StudentProfile states are now perfectly aligned.");
    console.log("==========================================================================");
  } catch (error) {
    console.error("Error during synchronization:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[DB] Disconnected.");
  }
}

runSyncOrphans();
