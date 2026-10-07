const env = require("../../config/env");

/**
 * Common MISC Email Wrapper Layout
 */
const renderEmailLayout = ({ title, preheader, bodyHtml, ctaText, ctaUrl }) => {
  const appUrl = env.APP_URL || "http://localhost:3000";
  const targetCtaUrl = ctaUrl ? (ctaUrl.startsWith("http") ? ctaUrl : `${appUrl}${ctaUrl}`) : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F7F8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #132238; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #F7F8F5; padding: 32px 0; }
    .main-table { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E2E8E0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #132238; padding: 24px 32px; text-align: center; border-bottom: 4px solid #2F7C7A; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .info-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #2F7C7A; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; }
    .footer { background-color: #F1F5F9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8E0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <!-- HEADER -->
      <tr>
        <td class="header">
          <h1>Markaz Integrated Studies Council</h1>
          <p>MISC Academic Management Portal</p>
        </td>
      </tr>
      <!-- CONTENT -->
      <tr>
        <td class="content">
          ${bodyHtml}
          ${
            targetCtaUrl && ctaText
              ? `
          <div class="btn-container">
            <a href="${targetCtaUrl}" class="btn" target="_blank">${ctaText}</a>
          </div>
          <p style="font-size: 12px; color: #94A3B8; text-align: center; word-break: break-all; margin-top: 16px;">
            If the button doesn't work, open: <a href="${targetCtaUrl}" style="color: #2F7C7A;">${targetCtaUrl}</a>
          </p>
          `
              : ""
          }
        </td>
      </tr>
      <!-- FOOTER -->
      <tr>
        <td class="footer">
          <p><strong>Markaz Integrated Studies Council (MISC)</strong></p>
          <p>This is an automated administrative notification. Please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} MISC. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};

// 1. EXAM PUBLISHED
const getExamPublishedEmail = ({
  recipientName = "Student / Parent",
  examTitle,
  examCode,
  registrationStartDate,
  registrationEndDate,
  portalUrl = "/student/examinations",
}) => {
  const codeStr = examCode ? ` (${examCode})` : "";
  const regDates =
    registrationStartDate && registrationEndDate
      ? `<div class="info-card">
          <p style="margin: 4px 0;"><strong>Registration Opens:</strong> ${new Date(registrationStartDate).toLocaleDateString("en-IN")}</p>
          <p style="margin: 4px 0;"><strong>Registration Closes:</strong> ${new Date(registrationEndDate).toLocaleDateString("en-IN")}</p>
        </div>`
      : "";

  const subject = `MISC Exam Notification: ${examTitle} Published`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>A new examination, <strong>${examTitle}${codeStr}</strong>, has been published and is open for registration.</p>
      ${regDates}
      <p>Please log in to the MISC portal to complete your registration before the deadline.</p>
    `,
    ctaText: "View Examination Details",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

A new examination, ${examTitle}${codeStr}, has been published on the MISC Portal.
${registrationStartDate ? `Registration Period: ${new Date(registrationStartDate).toLocaleDateString("en-IN")} to ${new Date(registrationEndDate).toLocaleDateString("en-IN")}` : ""}

Please log in to the MISC Portal to view details and register: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Administration`;

  return { subject, html, text };
};

// 2. EXAM REGISTRATION
const getExamRegistrationEmail = ({
  recipientName = "Student / Parent",
  examTitle,
  rollNumber,
  registrationDate = new Date(),
  portalUrl = "/student/examinations/registrations",
}) => {
  const subject = `MISC Exam Registration Confirmed: ${examTitle}`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>Examination registration for <strong>${examTitle}</strong> has been confirmed successfully.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Exam:</strong> ${examTitle}</p>
        <p style="margin: 4px 0;"><strong>Roll Number / Reference:</strong> ${rollNumber || "Assigned upon schedule"}</p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(registrationDate).toLocaleDateString("en-IN")}</p>
      </div>
      <p>You can check the status of your registration and download hall tickets once released.</p>
    `,
    ctaText: "View Registration",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Your registration for ${examTitle} has been confirmed.
Roll Number: ${rollNumber || "Assigned upon schedule"}
Date: ${new Date(registrationDate).toLocaleDateString("en-IN")}

View details: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Administration`;

  return { subject, html, text };
};

// 3. PAYMENT SUCCESS
const getPaymentSuccessEmail = ({
  recipientName = "Student / Parent",
  amount,
  transactionId,
  paymentType = "EXAM_FEE",
  date = new Date(),
  portalUrl = "/student/examinations/registrations",
}) => {
  const purpose = paymentType === "EXAM_FEE" ? "Examination Registration Fee" : "Institutional Fee";
  const subject = `MISC Fee Payment Receipt: ₹${amount} Received`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>We have successfully received your payment of <strong>₹${amount}</strong> for <strong>${purpose}</strong>.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Payment Purpose:</strong> ${purpose}</p>
        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
        <p style="margin: 4px 0;"><strong>Transaction Reference:</strong> ${transactionId || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${new Date(date).toLocaleString("en-IN")}</p>
        <p style="margin: 4px 0; color: #16A34A;"><strong>Status:</strong> Successful</p>
      </div>
      <p>Please retain this receipt for your records.</p>
    `,
    ctaText: "View Payment History",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Payment Confirmation:
Purpose: ${purpose}
Amount: ₹${amount}
Reference: ${transactionId || "N/A"}
Date: ${new Date(date).toLocaleString("en-IN")}
Status: Successful

Access your receipt on the portal: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Accounts`;

  return { subject, html, text };
};

// 4. HALL TICKET
const getHallTicketEmail = ({
  recipientName = "Student / Parent",
  examTitle,
  rollNumber,
  portalUrl = "/student/examinations/registrations",
}) => {
  const subject = `MISC Hall Ticket Available: ${examTitle}`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>The official Hall Ticket / Admit Card for <strong>${examTitle}</strong> is now available for download.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Exam:</strong> ${examTitle}</p>
        <p style="margin: 4px 0;"><strong>Roll Number:</strong> ${rollNumber || "Assigned"}</p>
      </div>
      <p>Please download and print your hall ticket before appearing at the examination hall. Carry a valid photo ID along with your hall ticket.</p>
    `,
    ctaText: "Download Hall Ticket",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Your Hall Ticket for ${examTitle} (Roll Number: ${rollNumber || "Assigned"}) is now ready for download.
Download at: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Examination Controller`;

  return { subject, html, text };
};

// 5. LEAVE SUBMITTED
const getLeaveSubmittedEmail = ({
  recipientName = "Faculty / Administrator",
  studentName = "A student",
  startDate,
  endDate,
  reason,
  portalUrl = "/faculty/leaves",
}) => {
  const subject = `MISC Leave Application: New Request from ${studentName}`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>A new leave application has been submitted by <strong>${studentName}</strong> and requires review.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Student:</strong> ${studentName}</p>
        <p style="margin: 4px 0;"><strong>Leave Period:</strong> ${startDate} to ${endDate}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${reason || "Not specified"}</p>
      </div>
      <p>Please review and take action through the Faculty Portal.</p>
    `,
    ctaText: "Review Leave Application",
    ctaUrl: portalUrl,
  });

  const text = `Hello ${recipientName},

New Leave Application submitted by ${studentName}:
Period: ${startDate} to ${endDate}
Reason: ${reason || "Not specified"}

Review on the portal: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Administration`;

  return { subject, html, text };
};

// 6. LEAVE APPROVED
const getLeaveApprovedEmail = ({
  recipientName = "Student / Parent",
  studentName,
  startDate,
  endDate,
  remarks,
  portalUrl = "/student/leave",
}) => {
  const subject = `MISC Leave Application: Approved (${startDate} to ${endDate})`;
  const remarksHtml = remarks
    ? `<p style="margin: 4px 0;"><strong>Review Remarks:</strong> ${remarks}</p>`
    : "";

  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>The leave application for <strong>${studentName || "the student"}</strong> has been <strong style="color: #16A34A;">APPROVED</strong>.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Approved</p>
        ${remarksHtml}
      </div>
    `,
    ctaText: "View Leave Status",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

The leave application for ${studentName || "the student"} (${startDate} to ${endDate}) has been APPROVED.
${remarks ? `Remarks: ${remarks}` : ""}

View details: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Administration`;

  return { subject, html, text };
};

// 7. LEAVE REJECTED
const getLeaveRejectedEmail = ({
  recipientName = "Student / Parent",
  studentName,
  startDate,
  endDate,
  remarks,
  portalUrl = "/student/leave",
}) => {
  const subject = `MISC Leave Application: Rejected (${startDate} to ${endDate})`;
  const remarksHtml = remarks
    ? `<p style="margin: 4px 0;"><strong>Reason / Remarks:</strong> ${remarks}</p>`
    : "";

  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>The leave application for <strong>${studentName || "the student"}</strong> has been <strong style="color: #DC2626;">REJECTED</strong>.</p>
      <div class="info-card">
        <p style="margin: 4px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Rejected</p>
        ${remarksHtml}
      </div>
      <p>Please contact your class faculty or administration if you require further clarification.</p>
    `,
    ctaText: "View Leave Application",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

The leave application for ${studentName || "the student"} (${startDate} to ${endDate}) was REJECTED.
${remarks ? `Remarks: ${remarks}` : ""}

View details: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Administration`;

  return { subject, html, text };
};

// 8. RESULT PUBLISHED
const getResultPublishedEmail = ({
  recipientName = "Student / Parent",
  examTitle,
  portalUrl = "/student/results",
}) => {
  const subject = `MISC Results Published: ${examTitle}`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>Official examination results for <strong>${examTitle}</strong> have been published.</p>
      <p>You can now view and download the official scorecard on the MISC portal.</p>
    `,
    ctaText: "View Result Scorecard",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Official examination results for ${examTitle} have been published.
View your scorecard: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Examination Controller`;

  return { subject, html, text };
};

// 9. ATTENDANCE WARNING (<75%)
const getAttendanceWarningEmail = ({
  recipientName = "Student / Parent",
  studentName = "Student",
  percentage,
  portalUrl = "/student/attendance",
}) => {
  const subject = `MISC Attendance Alert: Attendance below 75% (${percentage}%)`;
  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>This is an automated alert to notify you that the overall attendance for <strong>${studentName}</strong> has dropped below the mandatory <strong>75%</strong> requirement.</p>
      <div class="info-card" style="border-left: 4px solid #DC2626;">
        <p style="margin: 4px 0;"><strong>Current Attendance:</strong> <span style="color: #DC2626; font-weight: 700;">${percentage}%</span></p>
        <p style="margin: 4px 0;"><strong>Minimum Required:</strong> 75.0%</p>
      </div>
      <p>Failure to maintain 75% attendance may impact eligibility for upcoming examinations. Please ensure regular attendance and contact the class mentor if needed.</p>
    `,
    ctaText: "View Attendance Record",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Attendance Alert:
The overall attendance for ${studentName} is currently ${percentage}%, which is below the mandatory 75% threshold.
Ensure regular attendance to maintain examination eligibility.

View attendance details: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Academic Committee`;

  return { subject, html, text };
};

/**
 * 10. Timetable Assigned Email Template
 */
const getTimetableAssignedEmail = ({
  recipientName = "Faculty Member",
  subjectName = "Subject",
  className = "Class",
  dayOfWeek = "Day",
  periodNumber = 1,
  startTime = "",
  endTime = "",
  room = "",
  portalUrl = "/faculty/timetable",
}) => {
  const subject = `MISC: New Timetable Assigned - ${subjectName} (${className})`;
  const timeSlot = startTime && endTime ? `(${startTime} - ${endTime})` : "";
  const roomText = room ? `<p style="margin: 4px 0;"><strong>Room / Hall:</strong> ${room}</p>` : "";

  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>A new timetable period has been assigned to you on the MISC Academic Management Portal.</p>
      <div class="info-card" style="border-left: 4px solid #2F7C7A;">
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${subjectName}</p>
        <p style="margin: 4px 0;"><strong>Class:</strong> ${className}</p>
        <p style="margin: 4px 0;"><strong>Day:</strong> ${dayOfWeek}</p>
        <p style="margin: 4px 0;"><strong>Period:</strong> Period ${periodNumber} ${timeSlot}</p>
        ${roomText}
      </div>
      <p>Please log in to your Faculty Portal to view your complete teaching schedule.</p>
    `,
    ctaText: "View My Timetable",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

New Timetable Assignment:
Subject: ${subjectName}
Class: ${className}
Day: ${dayOfWeek}
Period: Period ${periodNumber} ${timeSlot}
${room ? `Room: ${room}\n` : ""}
View your timetable: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Academic Committee`;

  return { subject, html, text };
};

/**
 * 11. Timetable Updated Email Template
 */
const getTimetableUpdatedEmail = ({
  recipientName = "Faculty Member",
  subjectName = "Subject",
  className = "Class",
  dayOfWeek = "Day",
  periodNumber = 1,
  startTime = "",
  endTime = "",
  room = "",
  portalUrl = "/faculty/timetable",
}) => {
  const subject = `MISC: Timetable Updated - ${subjectName} (${className})`;
  const timeSlot = startTime && endTime ? `(${startTime} - ${endTime})` : "";
  const roomText = room ? `<p style="margin: 4px 0;"><strong>Room / Hall:</strong> ${room}</p>` : "";

  const html = renderEmailLayout({
    title: subject,
    bodyHtml: `
      <p>Assalamu Alaikum <strong>${recipientName}</strong>,</p>
      <p>Your timetable teaching schedule has been updated on the MISC Academic Management Portal.</p>
      <div class="info-card" style="border-left: 4px solid #2F7C7A;">
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${subjectName}</p>
        <p style="margin: 4px 0;"><strong>Class:</strong> ${className}</p>
        <p style="margin: 4px 0;"><strong>Day:</strong> ${dayOfWeek}</p>
        <p style="margin: 4px 0;"><strong>Period:</strong> Period ${periodNumber} ${timeSlot}</p>
        ${roomText}
      </div>
      <p>Please log in to your Faculty Portal to review the updated schedule.</p>
    `,
    ctaText: "View My Timetable",
    ctaUrl: portalUrl,
  });

  const text = `Assalamu Alaikum ${recipientName},

Timetable Schedule Update:
Subject: ${subjectName}
Class: ${className}
Day: ${dayOfWeek}
Period: Period ${periodNumber} ${timeSlot}
${room ? `Room: ${room}\n` : ""}
View updated schedule: ${env.APP_URL || ""}${portalUrl}

Regards,
MISC Academic Committee`;

  return { subject, html, text };
};

module.exports = {
  renderEmailLayout,
  getExamPublishedEmail,
  getExamRegistrationEmail,
  getPaymentSuccessEmail,
  getHallTicketEmail,
  getLeaveSubmittedEmail,
  getLeaveApprovedEmail,
  getLeaveRejectedEmail,
  getResultPublishedEmail,
  getAttendanceWarningEmail,
  getTimetableAssignedEmail,
  getTimetableUpdatedEmail,
};
