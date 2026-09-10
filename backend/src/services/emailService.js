const { Resend } = require("resend");

/**
 * Helper to obtain instantiated Resend client with API key validation
 */
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured in environment variables.");
  }
  return new Resend(apiKey);
};

/**
 * Send a test email using Resend
 * @param {string} to - Recipient email address (defaults to 'delivered@resend.dev')
 * @returns {Promise<Object>} Resend response data
 */
const sendTestEmail = async (to = "delivered@resend.dev") => {
  try {
    const resend = getResendClient();
    const targetEmail = to || "delivered@resend.dev";

    const response = await resend.emails.send({
      from: "MISC <onboarding@resend.dev>",
      to: [targetEmail],
      subject: "MISC Portal - Email Integration Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #132238; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8E0; border-radius: 8px;">
          <h2 style="color: #2F7C7A; margin-top: 0;">MISC Integrated Portal</h2>
          <p>This is a test email confirming that the <strong>Resend email service</strong> is properly configured and operational in the backend.</p>
          <div style="background-color: #F7F8F5; padding: 12px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Status:</strong> Integration Operational</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;"><strong>Recipient:</strong> ${targetEmail}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #E2E8E0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0;">Markaz Integrated Studies Council &bull; Test Message</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("Resend API Error:", response.error.message || response.error);
      throw new Error(response.error.message || "Failed to send email via Resend API");
    }

    return response.data;
  } catch (error) {
    console.error("Email Service Error [sendTestEmail]:", error.message);
    throw error;
  }
};

/**
 * Send account invitation email with set-password token link via Resend
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient full name
 * @param {string} rawToken - Unhashed invitation token
 * @returns {Promise<Object>} Resend response data
 */
const sendUserInvitationEmail = async (to, name, rawToken) => {
  try {
    const resend = getResendClient();
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const setPasswordLink = `${appUrl}/set-password?token=${rawToken}`;
    const displayName = name || "User";

    const response = await resend.emails.send({
      from: "MISC <onboarding@resend.dev>",
      to: [to],
      subject: "Welcome to MISC - Set Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #132238; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8E0; border-radius: 8px; background-color: #FFFFFF;">
          <h2 style="color: #2F7C7A; margin-top: 0;">Welcome to MISC</h2>
          <p>Hello ${displayName},</p>
          <p>Your MISC account has been created.</p>
          <p>Click the button below to set your password.</p>
          <div style="margin: 24px 0;">
            <a href="${setPasswordLink}" style="background-color: #2F7C7A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">Set Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">This link will expire in 30 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #E2E8E0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not expect this account, you can ignore this email.</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("Resend API Error [sendUserInvitationEmail]:", response.error.message || response.error);
      throw new Error(response.error.message || "Failed to send invitation email via Resend API");
    }

    return response.data;
  } catch (error) {
    console.error("Email Service Error [sendUserInvitationEmail]:", error.message);
    throw error;
  }
};

const sendPasswordResetEmail = async (to, resetToken) => {
  throw new Error("sendPasswordResetEmail is not yet implemented.");
};

const sendAccountActivationEmail = async (to, setupToken) => {
  throw new Error("sendAccountActivationEmail is not yet implemented.");
};

module.exports = {
  sendTestEmail,
  sendUserInvitationEmail,
  sendPasswordResetEmail,
  sendAccountActivationEmail,
};
