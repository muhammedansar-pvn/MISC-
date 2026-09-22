const { getSmtpTransporter, verifySmtpConnection, validateEmailConfig } = require("../../config/mail");
const env = require("../../config/env");

const classifySmtpError = (err) => {
  const msg = (err.message || "").toLowerCase();
  const code = (err.code || "").toUpperCase();
  const response = (err.response || "").toLowerCase();
  const full = `${msg} ${code} ${response}`;

  if (
    full.includes("535") ||
    full.includes("5.7.8") ||
    full.includes("username and password not accepted") ||
    full.includes("badcredentials") ||
    full.includes("invalid login") ||
    full.includes("authentication failed") ||
    code === "EAUTH"
  ) {
    return {
      code: "SMTP_AUTH_FAILED",
      message: "Email service authentication failed. Please contact the administrator.",
    };
  }

  if (
    full.includes("econnrefused") ||
    full.includes("enotfound") ||
    full.includes("esocket") ||
    full.includes("econnreset") ||
    full.includes("ehostunreach") ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND"
  ) {
    return {
      code: "SMTP_CONNECTION_FAILED",
      message: "Unable to connect to the email service. Please try again later.",
    };
  }

  if (full.includes("etimedout") || full.includes("timeout") || code === "ETIMEDOUT") {
    return {
      code: "SMTP_TIMEOUT",
      message: "Email service timed out. Please try again later.",
    };
  }

  return {
    code: "SMTP_SEND_FAILED",
    message: "Unable to send the verification email. Please try again later.",
  };
};

const getSenderAddress = () => {
  return `${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`;
};

const maskEmailAddress = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
};

const sendEmail = async ({ to, subject, html, emailType = "GENERIC" }) => {
  const maskedTo = maskEmailAddress(to);
  const from = getSenderAddress();
  const maskedFrom = maskEmailAddress(env.SMTP_FROM_EMAIL);

  try {
    const transporter = await getSmtpTransporter();
    const info = await transporter.sendMail({
      from,
      to: [to],
      subject,
      html,
    });

    console.log(
      `[EMAIL] SMTP email sent host=${env.SMTP_HOST} port=${env.SMTP_PORT} from=${maskedFrom} to=${maskedTo} type=${emailType} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} messageId="${info.messageId}"`
    );

    return {
      success: true,
      id: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } catch (err) {
    const classified = classifySmtpError(err);
    console.error(
      `[EMAIL] ${classified.code} host=${env.SMTP_HOST} port=${env.SMTP_PORT} from=${maskedFrom} to=${maskedTo} code=${classified.code} response=${err.response || err.message}`
    );

    return {
      success: false,
      error: {
        code: classified.code,
        message: classified.message,
      },
    };
  }
};

const sendOtpEmail = async (to, otp, purpose = "EMAIL_VERIFICATION") => {
  const subject = `MISC Verification Code - ${otp}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; background-color: #F7F8F5; color: #132238;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E2E8E0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: #2F7C7A; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">MISC Portal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Markaz Integrated Studies Council</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; margin-top: 0;">Assalamu Alaikum,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Your verification code for the MISC Portal (${purpose}) is:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="display: inline-block; background-color: #F7F8F5; border: 2px dashed #2F7C7A; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #132238;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
            This code will expire in <strong>10 minutes</strong>. Please enter this code on the verification page to proceed.
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8E0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94A3B8; margin-bottom: 0;">
            If you did not request this verification code, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #F7F8F5; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8E0;">
          Regards,<br /><strong>Markaz Integrated Studies Council (MISC) Team</strong>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: purpose || "EMAIL_VERIFICATION" });
};

const sendPasswordResetEmail = async (to, rawToken) => {
  const resetLink = `${env.APP_URL}/reset-password?token=${rawToken}`;
  const subject = "MISC Portal - Password Reset Request";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; background-color: #F7F8F5; color: #132238;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E2E8E0; overflow: hidden;">
        <div style="background-color: #2F7C7A; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">MISC Portal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Password Reset Request</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Hello,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            We received a request to reset your password for your MISC Portal account. Click the button below to set a new password:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #2F7C7A; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #64748B; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetLink}" style="color: #2F7C7A;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8E0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94A3B8; margin-bottom: 0;">
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
        <div style="background-color: #F7F8F5; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8E0;">
          Regards,<br /><strong>MISC Team</strong>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: "PASSWORD_RESET" });
};

const sendUserInvitationEmail = async (to, name, rawToken) => {
  const setPasswordLink = `${env.APP_URL}/account-setup/${rawToken}`;
  const displayName = name || "User";
  const subject = "Welcome to MISC - Account Setup";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; background-color: #F7F8F5; color: #132238;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E2E8E0; overflow: hidden;">
        <div style="background-color: #2F7C7A; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Welcome to MISC</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Markaz Integrated Studies Council</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Assalamu Alaikum ${displayName},</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            An account has been created for you on the MISC Portal. Click the button below to complete your account setup and choose your username and password:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${setPasswordLink}" style="display: inline-block; background-color: #2F7C7A; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              Complete Account Setup
            </a>
          </div>
          <p style="font-size: 12px; color: #64748B; word-break: break-all;">
            Or copy and paste this link into your browser:<br />
            <a href="${setPasswordLink}" style="color: #2F7C7A;">${setPasswordLink}</a>
          </p>
        </div>
        <div style="background-color: #F7F8F5; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8E0;">
          Regards,<br /><strong>MISC Team</strong>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: "ACCOUNT_SETUP" });
};

const sendTestEmail = async (to) => {
  const recipient = to || env.SMTP_USER || env.SMTP_FROM_EMAIL;
  const subject = "MISC Portal - SMTP Email Integration Test";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #132238;">
      <h2>MISC Portal - SMTP Delivery Test</h2>
      <p>This is a test email sent from the MISC Portal backend using Nodemailer SMTP transport.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;
  return sendEmail({ to: recipient, subject, html, emailType: "SYSTEM_TEST" });
};

module.exports = {
  validateEmailConfig,
  getSmtpTransporter,
  verifySmtpConnection,
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendUserInvitationEmail,
  sendTestEmail,
};
