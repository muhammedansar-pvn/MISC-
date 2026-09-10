const { sendTestEmail } = require("../services/emailService");

/**
 * Controller to send a test email via GET /api/test-email
 */
const handleTestEmail = async (req, res) => {
  try {
    const recipient = req.query.to || "delivered@resend.dev";
    const result = await sendTestEmail(recipient);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Test Email Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`,
    });
  }
};

module.exports = {
  handleTestEmail,
};
