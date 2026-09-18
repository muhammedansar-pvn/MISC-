const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const {
  getEmailProvider,
  validateEmailConfig,
  sendTestEmail,
  sendOtpEmail,
} = require("../src/services/emailService");

async function testSmtpEmail() {
  console.log("==================================================");
  console.log("TESTING EMAIL TRANSPORT DISPATCH");
  console.log("==================================================");

  const activeProvider = getEmailProvider();
  console.log(`Active EMAIL_PROVIDER: ${activeProvider.toUpperCase()}`);

  if (activeProvider === "smtp") {
    console.log("SMTP_HOST:", process.env.SMTP_HOST || "Not set");
    console.log("SMTP_PORT:", process.env.SMTP_PORT || "Not set");
    console.log("SMTP_USER:", process.env.SMTP_USER ? "[PRESENT]" : "[MISSING]");
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "[PRESENT]" : "[MISSING]");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "Not set");
  } else {
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "[PRESENT]" : "[MISSING]");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "Not set");
  }

  const isConfigValid = validateEmailConfig();
  console.log("Email Config Valid:", isConfigValid);

  const testRecipient = process.env.SMTP_USER || "delivered@resend.dev";
  console.log(`\n--- Sending Test Email to ${testRecipient} ---`);

  try {
    const res = await sendTestEmail(testRecipient);
    console.log("Email Dispatch Result:", res);
  } catch (err) {
    console.error("Email Dispatch Error:", err.message);
  }
}

testSmtpEmail();
