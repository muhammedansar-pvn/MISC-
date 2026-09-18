const { Resend } = require("resend");
const nodemailer = require("nodemailer");

// Cached Singleton Transporters
let resendClient = null;
let smtpTransporter = null;

/**
 * Determine configured email provider ("resend" | "smtp")
 */
const getEmailProvider = () => {
  return (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
};

/**
 * Singleton Resend API Client
 */
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Singleton Nodemailer SMTP Transporter
 */
const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return smtpTransporter;
};

/**
 * Validate Email Service Configuration for Active Provider
 */
const validateEmailConfig = () => {
  const isProd = process.env.NODE_ENV === "production";
  const provider = getEmailProvider();
  const missing = [];

  if (provider === "smtp") {
    if (!process.env.SMTP_HOST) missing.push("SMTP_HOST");
    if (!process.env.SMTP_USER) missing.push("SMTP_USER");
    if (!process.env.SMTP_PASS) missing.push("SMTP_PASS");
    if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");
  } else {
    // resend
    if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
    if (isProd && !process.env.EMAIL_FROM) missing.push("EMAIL_FROM");
  }

  if (missing.length > 0) {
    const errorMsg = `[EMAIL CONFIG ERROR] Provider (${provider}) missing required variables: ${missing.join(", ")}`;
    if (isProd) {
      console.error(errorMsg);
      throw new Error(errorMsg);
    } else {
      console.warn(`${errorMsg}. Email service will operate with fallback.`);
    }
    return false;
  }

  return true;
};

/**
 * Resolve Sender Address
 */
const getSenderAddress = () => {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("EMAIL_FROM environment variable must be configured in production environment.");
  }
  const provider = getEmailProvider();
  if (provider === "smtp" && process.env.SMTP_USER) {
    return `MISC Portal <${process.env.SMTP_USER}>`;
  }
  return "MISC Portal <onboarding@resend.dev>";
};

/**
 * Extract recipient domain for safe observability logging
 */
const getRecipientDomain = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return "unknown";
  }
  return email.split("@")[1];
};

/**
 * Centralized Generic Email Dispatcher supporting Resend and Nodemailer/SMTP
 */
const sendEmail = async ({ to, subject, html, emailType = "GENERIC" }) => {
  const provider = getEmailProvider();
  const recipientDomain = getRecipientDomain(to);

  let from;
  try {
    from = getSenderAddress();
  } catch (err) {
    console.error(`EMAIL_FAILED { type: "${emailType}", provider: "${provider}", recipientDomain: "${recipientDomain}", error: "${err.message}" }`);
    return {
      success: false,
      error: err.message,
      message: "Unable to send email due to sender configuration error.",
    };
  }

  // ----------------------------------------------------
  // Option A: Nodemailer / Gmail SMTP Transport
  // ----------------------------------------------------
  if (provider === "smtp") {
    const transporter = getSmtpTransporter();
    if (!transporter) {
      console.error(`EMAIL_FAILED { type: "${emailType}", provider: "smtp", recipientDomain: "${recipientDomain}", error: "SMTP credentials not configured" }`);
      return {
        success: false,
        error: "SMTP credentials (SMTP_USER / SMTP_PASS) not configured",
        message: "Unable to send email via SMTP.",
      };
    }

    try {
      const info = await transporter.sendMail({
        from,
        to: [to],
        subject,
        html,
      });

      console.log(`EMAIL_SENT { type: "${emailType}", provider: "smtp", messageId: "${info.messageId}", recipientDomain: "${recipientDomain}" }`);
      return {
        success: true,
        id: info.messageId,
      };
    } catch (err) {
      console.error(`EMAIL_FAILED { type: "${emailType}", provider: "smtp", recipientDomain: "${recipientDomain}", error: "${err.message}" }`);
      return {
        success: false,
        error: err.message,
        message: "Unable to send email via SMTP. Please try again later.",
      };
    }
  }

  // ----------------------------------------------------
  // Option B: Resend API Transport (Default)
  // ----------------------------------------------------
  const resend = getResendClient();
  if (!resend) {
    console.log(`[DEV MODE Email] ${emailType} email requested for recipient domain @${recipientDomain}`);
    return {
      success: true,
      devFallback: true,
      id: "dev_fallback_id",
      message: "Email dispatch simulated (no API key configured)",
    };
  }

  try {
    const response = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (response.error) {
      console.error(`EMAIL_FAILED { type: "${emailType}", provider: "resend", recipientDomain: "${recipientDomain}", error: "${response.error.message}" }`);
      return {
        success: false,
        error: response.error.message,
        message: "Unable to send email. Please try again later.",
      };
    }

    const messageId = response.data?.id || "resend_ok";
    console.log(`EMAIL_SENT { type: "${emailType}", provider: "resend", messageId: "${messageId}", recipientDomain: "${recipientDomain}" }`);

    return {
      success: true,
      id: messageId,
    };
  } catch (err) {
    console.error(`EMAIL_FAILED { type: "${emailType}", provider: "resend", recipientDomain: "${recipientDomain}", error: "${err.message}" }`);
    return {
      success: false,
      error: err.message,
      message: "Unable to send email. Please try again later.",
    };
  }
};

/**
 * 1. Email Verification OTP Email
 */
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
            Your email verification code for the MISC Portal is:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <span style="display: inline-block; background-color: #F7F8F5; border: 2px dashed #2F7C7A; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #132238;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
            This code will expire in <strong>10 minutes</strong>. Please enter this code on the verification page to activate your account.
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

  return sendEmail({ to, subject, html, emailType: "EMAIL_VERIFICATION" });
};

/**
 * 2. Password Reset Email
 */
const sendPasswordResetEmail = async (to, rawToken) => {
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const resetLink = `${appUrl}/reset-password?token=${rawToken}`;
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

/**
 * 3. User Invitation / Account Setup Email
 */
const sendUserInvitationEmail = async (to, name, rawToken) => {
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const setPasswordLink = `${appUrl}/account-setup/${rawToken}`;
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

/**
 * Dev Test Email Dispatcher
 */
const sendTestEmail = async (to = "delivered@resend.dev") => {
  const subject = "MISC Portal - Email Integration Test";
  const html = `<p>MISC Email integration transport test</p>`;
  return sendEmail({ to, subject, html, emailType: "SYSTEM_TEST" });
};

module.exports = {
  getEmailProvider,
  validateEmailConfig,
  getResendClient,
  getSmtpTransporter,
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendUserInvitationEmail,
  sendTestEmail,
};
