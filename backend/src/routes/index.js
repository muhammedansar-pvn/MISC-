const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const institutionRoutes = require("../modules/institutions/institution.routes");
const academicRoutes = require("../modules/academics/academic.routes");
const studentRoutes = require("../modules/students/student.routes");
const facultyRoutes = require("../modules/faculty/faculty.routes");
const examRoutes = require("../modules/exams/exam.routes");
const eventRoutes = require("../modules/events/event.routes");
const paymentRoutes = require("../modules/payments/payment.routes");
const cmsRoutes = require("../modules/cms/cms.routes");
const downloadRoutes = require("../modules/downloads/download.routes");
const enquiryRoutes = require("../modules/enquiries/enquiry.routes");
const attendanceRoutes = require("../modules/attendance/attendance.routes");
const leaveRoutes = require("../modules/leaves/leave.routes");
const { sendTestEmail } = require("../shared/services/email.service");

const router = express.Router();

// Health Check Endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MISC Integrated Portal API Server is running",
  });
});

// Dev/Test Email Endpoint
router.get("/test-email", async (req, res) => {
  try {
    const recipient = req.query.to || process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL;
    const result = await sendTestEmail(recipient);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Test Email Route Error:", error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`,
    });
  }
});

// Domain Module Route Mounts
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/institutions", institutionRoutes);
router.use("/academic", academicRoutes);
router.use("/students", studentRoutes);
router.use("/faculty", facultyRoutes);
router.use("/exams", examRoutes);
router.use("/events", eventRoutes);
router.use("/payments", paymentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);

// CMS, Downloads & Enquiries Mounts (Retaining 100% frontend API compatibility)
router.use("/cms", cmsRoutes);
router.use("/cms", downloadRoutes);
router.use("/cms", enquiryRoutes);

// Optional direct mounts for Downloads & Enquiries modules
router.use("/downloads", downloadRoutes);
router.use("/enquiries", enquiryRoutes);

module.exports = router;
