const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

const { sendTestEmail, sendOtpEmail } = require("../src/services/emailService");

async function testEmailDelivery() {
  console.log("==================================================");
  console.log("TESTING RESEND EMAIL DELIVERY FLOW");
  console.log("==================================================");

  console.log("RESEND_API_KEY Present:", !!process.env.RESEND_API_KEY);

  console.log("\n--- Sending Test Email to delivered@resend.dev ---");
  try {
    const res = await sendTestEmail("delivered@resend.dev");
    console.log("Resend API Response for delivered@resend.dev:", res);
  } catch (err) {
    console.error("Resend API Error:", err);
  }

  console.log("\n--- Sending OTP Email to delivered@resend.dev ---");
  try {
    const otpRes = await sendOtpEmail("delivered@resend.dev", "654321", "EMAIL_VERIFICATION");
    console.log("Resend OTP Email Response:", otpRes);
  } catch (err) {
    console.error("Resend OTP Email Error:", err);
  }
}

testEmailDelivery();
