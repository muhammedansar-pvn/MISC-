const { Resend } = require("resend");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

const sendTestEmail = async (to = "delivered@resend.dev") => {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[DEV MODE Email] Test email dispatched to ${to}`);
    return { id: "mock_test_id" };
  }

  const response = await resend.emails.send({
    from: "MISC <onboarding@resend.dev>",
    to: [to],
    subject: "MISC Portal - Email Integration Test",
    html: `<p>MISC Resend integration test</p>`,
  });

  return response.data;
};

const sendUserInvitationEmail = async (to, name, rawToken) => {
  const resend = getResendClient();
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const setPasswordLink = `${appUrl}/account-setup/${rawToken}`;
  const displayName = name || "User";

  if (!resend) {
    console.log(`[DEV MODE Email] Invitation link for ${to}: ${setPasswordLink}`);
    return { id: "mock_invitation_id", link: setPasswordLink };
  }

  try {
    const response = await resend.emails.send({
      from: "MISC <onboarding@resend.dev>",
      to: [to],
      subject: "Welcome to MISC - Set Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #132238; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8E0; border-radius: 8px;">
          <h2 style="color: #2F7C7A;">Welcome to MISC</h2>
          <p>Hello ${displayName},</p>
          <p>Click below to set up your account and password:</p>
          <p><a href="${setPasswordLink}">${setPasswordLink}</a></p>
        </div>
      `,
    });
    return response.data;
  } catch (err) {
    console.warn(`[DEV MODE Email Fallback] Resend send failed (${err.message}). Setup link: ${setPasswordLink}`);
    return { id: "dev_fallback_id", link: setPasswordLink };
  }
};

const sendPasswordResetEmail = async (to, rawToken) => {
  const resend = getResendClient();
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

  if (!resend) {
    console.log(`[DEV MODE Email] Password reset link for ${to}: ${resetLink}`);
    return { id: "mock_reset_id" };
  }

  const response = await resend.emails.send({
    from: "MISC <onboarding@resend.dev>",
    to: [to],
    subject: "MISC Portal - Password Reset Request",
    html: `<p>Reset your password here: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  return response.data;
};

const sendOtpEmail = async (to, otp, purpose) => {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[DEV MODE Email] OTP code for ${to} (${purpose}): ${otp}`);
    return { id: "mock_otp_id" };
  }

  const response = await resend.emails.send({
    from: "MISC <onboarding@resend.dev>",
    to: [to],
    subject: `MISC Verification Code - ${otp}`,
    html: `<p>Your verification code for ${purpose} is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });

  return response.data;
};

module.exports = {
  sendTestEmail,
  sendUserInvitationEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
};
