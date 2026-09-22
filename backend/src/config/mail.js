const nodemailer = require("nodemailer");
const env = require("./env");

let smtpTransporter = null;

const getSmtpTransporter = async () => {
  if (smtpTransporter) {
    return smtpTransporter;
  }

  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return smtpTransporter;
};

const verifySmtpConnection = async () => {
  try {
    const transporter = await getSmtpTransporter();
    await transporter.verify();
    console.log("[SMTP VERIFY] SMTP Server connection verified successfully.");
    return { success: true, message: "SMTP Transporter verified successfully" };
  } catch (error) {
    console.error(`[SMTP VERIFY ERROR] Verification failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const validateEmailConfig = () => {
  const missing = [];
  if (!env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!env.SMTP_USER) missing.push("SMTP_USER");
  if (!env.SMTP_PASS) missing.push("SMTP_PASS");

  const pass = env.SMTP_PASS;
  const isPlaceholderPass = !pass || pass === "your-google-app-password" || pass === "YOUR_GOOGLE_APP_PASSWORD";

  if (missing.length > 0 || isPlaceholderPass) {
    console.error(
      "[EMAIL CONFIG ERROR] Invalid or placeholder SMTP configuration. SMTP_PASS is missing or set to placeholder. A valid App Password is required."
    );
    return false;
  }
  return true;
};

module.exports = {
  getSmtpTransporter,
  verifySmtpConnection,
  validateEmailConfig,
};
