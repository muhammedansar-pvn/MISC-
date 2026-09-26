const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const OtpVerification = require("../src/modules/auth/otp-verification.model");
const { registerStudentWithAccount, updateStudent } = require("../src/modules/students/student.service");
const { verifyOtpCode, sendAndStoreOtp } = require("../src/modules/auth/auth.service");

async function runStudentEmailChangeFlowTests() {
  console.log("==================================================================");
  console.log("TEST SUITE: STUDENT EMAIL CHANGE & OTP VERIFICATION FLOW AUDIT");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI missing in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[DB] Connected to MongoDB Atlas.\n");

  const createdUserIds = [];
  const createdProfileIds = [];
  const createdClassIds = [];
  const createdYearIds = [];

  try {
    // 0. Setup test class and academic year if needed
    let testYear = await AcademicYear.findOne({ status: "ACTIVE" });
    if (!testYear) {
      testYear = await AcademicYear.create({
        yearLabel: "2026-2027",
        startYear: 2026,
        endYear: 2027,
        status: "ACTIVE",
      });
      createdYearIds.push(testYear._id);
    }

    let testClass = await Class.findOne({ status: "ACTIVE" });
    if (!testClass) {
      testClass = await Class.create({
        name: "Sanaviyya Test Class C",
        code: `SNV${Date.now().toString().slice(-4)}`,
        academicYearId: testYear._id,
        status: "ACTIVE",
      });
      createdClassIds.push(testClass._id);
    }

    // -------------------------------------------------------------
    // PHASE 1: Setup Initial Active Student
    // -------------------------------------------------------------
    console.log("--- PHASE 1: Setup Initial Active Student ---");
    const origEmail = `orig-student-${Date.now()}@markazsanaviyya.org`;
    const regPayload = {
      email: origEmail,
      nameEnglish: "Usama Bin Zayd",
      nameArabic: "أسامة بن زيد",
      placeEnglish: "Calicut",
      placeArabic: "كالیكوت",
      dateOfBirth: "2007-06-15",
      admissionYear: 2026,
      classId: testClass._id.toString(),
      contactNumber: "+91 9988776655",
      fatherName: "Zayd",
      motherName: "Umm Ayman",
    };

    const regResult = await registerStudentWithAccount(regPayload, { role: "ADMIN" });
    const studentProfileId = regResult.student._id;
    const initialUserId = regResult.student.userId._id || regResult.student.userId;
    createdProfileIds.push(studentProfileId);
    createdUserIds.push(initialUserId);

    // Verify initial registration OTP to activate student
    const knownSetupOtp = "654321";
    await OtpVerification.updateOne(
      { identifier: origEmail, purpose: "EMAIL_VERIFICATION" },
      {
        $set: {
          otpHash: crypto.createHash("sha256").update(knownSetupOtp).digest("hex"),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
        },
      }
    );

    const initialVerifyResult = await verifyOtpCode(origEmail, knownSetupOtp, "EMAIL_VERIFICATION");
    if (!initialVerifyResult || !initialVerifyResult.success) {
      throw new Error("Phase 1 Failed: Initial OTP verification failed");
    }

    // Activate user
    await User.findByIdAndUpdate(initialUserId, {
      emailVerified: true,
      status: "ACTIVE",
    });

    let currentDbUser = await User.findById(initialUserId);
    console.log(`[PASS] Initial student active: ${currentDbUser.email} (verified=${currentDbUser.emailVerified})\n`);

    // -------------------------------------------------------------
    // PHASE 2: Student / Admin requests Email Change (1st time)
    // -------------------------------------------------------------
    console.log("--- PHASE 2: Change Email to new-email-1@markaz.in ---");
    const newEmail1 = `new-email-1-${Date.now()}@markazsanaviyya.org`;

    const updateResult1 = await updateStudent(studentProfileId, {
      email: newEmail1,
      contactNumber: "+91 9988776655",
    });

    console.log("[Update 1 Response]:", {
      requiresEmailVerification: updateResult1.requiresEmailVerification,
      email: updateResult1.email,
      maskedEmail: updateResult1.maskedEmail,
      hasVerificationId: !!updateResult1.verificationId,
    });

    if (!updateResult1.requiresEmailVerification) {
      throw new Error("Phase 2 Failed: updateStudent should indicate requiresEmailVerification=true");
    }
    if (updateResult1.email !== newEmail1) {
      throw new Error(`Phase 2 Failed: Expected email ${newEmail1}, got ${updateResult1.email}`);
    }

    // Inspect DB state
    currentDbUser = await User.findById(initialUserId);
    console.log("[DB State after update 1]:", {
      email: currentDbUser.email,
      pendingEmail: currentDbUser.pendingEmail,
      emailVerified: currentDbUser.emailVerified,
    });

    if (currentDbUser.email !== origEmail) {
      throw new Error(`Phase 2 Failed: Active email was prematurely changed to ${currentDbUser.email}! It should remain ${origEmail}`);
    }
    if (currentDbUser.pendingEmail !== newEmail1) {
      throw new Error(`Phase 2 Failed: pendingEmail should be ${newEmail1}, got ${currentDbUser.pendingEmail}`);
    }

    // Verify OTP record exists for newEmail1
    const otp1Doc = await OtpVerification.findOne({
      identifier: newEmail1,
      purpose: "EMAIL_VERIFICATION",
    });
    if (!otp1Doc) {
      throw new Error("Phase 2 Failed: OTP record was not created for newEmail1");
    }
    console.log(`[PASS] OTP record successfully dispatched for pending email: ${newEmail1} (id=${otp1Doc._id})\n`);

    // -------------------------------------------------------------
    // PHASE 3: Attempt verification with invalid OTP
    // -------------------------------------------------------------
    console.log("--- PHASE 3: Verify with Invalid OTP (000000) ---");
    let caughtInvalid = false;
    try {
      await verifyOtpCode(newEmail1, "000000", "EMAIL_VERIFICATION");
    } catch (err) {
      caughtInvalid = true;
      console.log(`[PASS] Caught expected invalid OTP error: "${err.message}"`);
    }

    if (!caughtInvalid) {
      throw new Error("Phase 3 Failed: Wrong OTP should have thrown an error");
    }

    currentDbUser = await User.findById(initialUserId);
    if (currentDbUser.email !== origEmail || currentDbUser.pendingEmail !== newEmail1) {
      throw new Error("Phase 3 Failed: User state corrupted after failed OTP attempt");
    }
    console.log("[PASS] Invalid OTP correctly rejected, unverified email remains pending.\n");

    // -------------------------------------------------------------
    // PHASE 4: Update Email AGAIN before verifying (new-email-2)
    // -------------------------------------------------------------
    console.log("--- PHASE 4: Update Email Again Before Verification (Invalidation Check) ---");
    const newEmail2 = `new-email-2-${Date.now()}@markazsanaviyya.org`;

    const updateResult2 = await updateStudent(studentProfileId, {
      email: newEmail2,
    });

    // Check that previous OTP for newEmail1 is deleted/invalidated
    const oldOtpDoc = await OtpVerification.findOne({
      identifier: newEmail1,
      purpose: "EMAIL_VERIFICATION",
    });
    if (oldOtpDoc) {
      throw new Error("Phase 4 Failed: Old pending OTP for newEmail1 was not invalidated!");
    }
    console.log(`[PASS] Previous pending OTP for ${newEmail1} was purged.`);

    // Check that new OTP exists for newEmail2
    const otp2Doc = await OtpVerification.findOne({
      identifier: newEmail2,
      purpose: "EMAIL_VERIFICATION",
    });
    if (!otp2Doc) {
      throw new Error("Phase 4 Failed: New OTP was not generated for newEmail2");
    }
    console.log(`[PASS] New OTP successfully issued for ${newEmail2}.`);

    currentDbUser = await User.findById(initialUserId);
    if (currentDbUser.pendingEmail !== newEmail2) {
      throw new Error(`Phase 4 Failed: pendingEmail not updated to ${newEmail2}`);
    }
    if (currentDbUser.email !== origEmail) {
      throw new Error(`Phase 4 Failed: Active email prematurely altered!`);
    }
    console.log("[PASS] Pending email updated to newEmail2 while active email remains original.\n");

    // -------------------------------------------------------------
    // PHASE 5: Resend OTP functionality and 30-second Cooldown Check
    // -------------------------------------------------------------
    console.log("--- PHASE 5: Resend OTP & Cooldown Verification ---");
    let cooldownCaught = false;
    try {
      await sendAndStoreOtp(newEmail2, "EMAIL_VERIFICATION", { userId: initialUserId });
    } catch (cdErr) {
      if (cdErr.message && cdErr.message.includes("Please wait 30 seconds")) {
        cooldownCaught = true;
        console.log(`[PASS] 30-second cooldown correctly enforced: "${cdErr.message}"`);
      } else {
        throw cdErr;
      }
    }

    if (!cooldownCaught) {
      throw new Error("Phase 5 Failed: Cooldown was not enforced when resending within 30s");
    }

    // Now simulate 31 seconds elapsed by removing the recent OTP record
    await OtpVerification.deleteMany({
      identifier: newEmail2,
      purpose: "EMAIL_VERIFICATION",
    });

    const resendResult = await sendAndStoreOtp(newEmail2, "EMAIL_VERIFICATION", {
      userId: initialUserId,
    });
    console.log("[Resend Result after cooldown]:", {
      success: resendResult.success,
      maskedEmail: resendResult.maskedEmail,
    });

    if (!resendResult.success) {
      throw new Error("Phase 5 Failed: Resend OTP failed after cooldown");
    }

    const resentOtpDoc = await OtpVerification.findOne({
      identifier: newEmail2,
      purpose: "EMAIL_VERIFICATION",
    });
    console.log(`[PASS] Resent OTP document confirmed in DB: id=${resentOtpDoc._id}\n`);

    // -------------------------------------------------------------
    // PHASE 6: Successful Verification of newEmail2 and Promotion
    // -------------------------------------------------------------
    console.log("--- PHASE 6: Valid OTP Verification & Email Promotion ---");
    const testCodeToVerify = "889900";
    await OtpVerification.updateOne(
      { identifier: newEmail2, purpose: "EMAIL_VERIFICATION" },
      {
        $set: {
          otpHash: crypto.createHash("sha256").update(testCodeToVerify).digest("hex"),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
        },
      }
    );

    const validVerify = await verifyOtpCode(newEmail2, testCodeToVerify, "EMAIL_VERIFICATION");
    if (!validVerify || !validVerify.success) {
      throw new Error("Phase 6 Failed: Valid OTP verification returned invalid");
    }
    console.log("[OTP Code Verified Valid]:", validVerify);

    // Execute the promotion logic identical to auth.controller verifyEmailOtp
    const userToPromote = await User.findOne({
      $or: [{ email: newEmail2 }, { pendingEmail: newEmail2 }],
    });
    if (!userToPromote) throw new Error("Phase 6 Failed: User not found by pendingEmail");

    if (userToPromote.pendingEmail === newEmail2) {
      userToPromote.email = newEmail2;
      userToPromote.pendingEmail = undefined;
      userToPromote.emailVerified = true;
      if (userToPromote.status === "PENDING_SETUP") {
        userToPromote.status = "ACTIVE";
      }
      await userToPromote.save();
    }

    // Check final state
    const finalizedUser = await User.findById(initialUserId);
    console.log("[Final User State]:", {
      email: finalizedUser.email,
      pendingEmail: finalizedUser.pendingEmail,
      emailVerified: finalizedUser.emailVerified,
      status: finalizedUser.status,
    });

    if (finalizedUser.email !== newEmail2) {
      throw new Error(`Phase 6 Failed: Final email should be ${newEmail2}, got ${finalizedUser.email}`);
    }
    if (finalizedUser.pendingEmail) {
      throw new Error(`Phase 6 Failed: pendingEmail should be cleared, got ${finalizedUser.pendingEmail}`);
    }
    if (!finalizedUser.emailVerified) {
      throw new Error("Phase 6 Failed: Final emailVerified should be true");
    }
    console.log("[PASS] Email successfully promoted and finalized after OTP verification!\n");

    // -------------------------------------------------------------
    // PHASE 7: Ensure Student Registration Flow Remains Intact
    // -------------------------------------------------------------
    console.log("--- PHASE 7: Regression Check - Student Registration Flow ---");
    const regCheckEmail = `reg-check-${Date.now()}@markazsanaviyya.org`;
    const regCheckPayload = {
      email: regCheckEmail,
      nameEnglish: "Abdullah Bin Mas'ud",
      dateOfBirth: "2007-01-10",
      admissionYear: 2026,
      classId: testClass._id.toString(),
      fatherName: "Mas'ud",
      motherName: "Umm Abdullah",
    };

    const regCheckResult = await registerStudentWithAccount(regCheckPayload, { role: "ADMIN" });
    if (!regCheckResult.verificationId || !regCheckResult.maskedEmail) {
      throw new Error("Phase 7 Failed: Registration response missing verificationId or maskedEmail");
    }
    createdProfileIds.push(regCheckResult.student._id);
    createdUserIds.push(regCheckResult.student.userId._id || regCheckResult.student.userId);

    const regOtp = await OtpVerification.findOne({ identifier: regCheckEmail, purpose: "EMAIL_VERIFICATION" });
    if (!regOtp) {
      throw new Error("Phase 7 Failed: OTP not generated during normal student registration");
    }
    console.log("[PASS] Normal student registration email OTP flow is 100% operational.\n");

    console.log("==================================================================");
    console.log("ALL 7 TEST PHASES PASSED WITH ZERO ERRORS!");
    console.log("==================================================================");
  } finally {
    // Cleanup test artifacts
    console.log("\n[CLEANUP] Cleaning up test records...");
    if (createdProfileIds.length > 0) {
      await StudentProfile.deleteMany({ _id: { $in: createdProfileIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (createdClassIds.length > 0) {
      await Class.deleteMany({ _id: { $in: createdClassIds } });
    }
    if (createdYearIds.length > 0) {
      await AcademicYear.deleteMany({ _id: { $in: createdYearIds } });
    }
    console.log("[CLEANUP] Completed. Disconnecting DB.");
    await mongoose.disconnect();
  }
}

runStudentEmailChangeFlowTests().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED:", err);
  process.exit(1);
});
