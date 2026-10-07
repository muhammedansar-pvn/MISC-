const mongoose = require("mongoose");
const Notification = require("./notification.model");
const User = require("../users/user.model");
const StudentProfile = require("../students/student.model");
const ParentProfile = require("../parents/parent.model");
const FacultyProfile = require("../faculty/faculty.model");
const { sendEventEmail } = require("../../shared/services/email.service");
const {
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
} = require("../../shared/services/email-templates");

/**
 * Creates a single in-app notification with safe deduplication.
 */
const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  link = null,
  metadata = {},
}) => {
  if (!userId || !title || !message) {
    return null;
  }

  // Deduplication check if dedupKey is supplied in metadata
  if (metadata && metadata.dedupKey) {
    const existing = await Notification.findOne({
      userId,
      "metadata.dedupKey": metadata.dedupKey,
    }).lean();
    if (existing) {
      return existing;
    }
  }

  const notification = await Notification.create({
    userId,
    title: title.trim(),
    message: message.trim(),
    type,
    link: link ? link.trim() : null,
    metadata: metadata || {},
    isRead: false,
  });

  // Real-time delivery via Socket.IO (non-blocking, fail-safe)
  try {
    const { emitToUser } = require("../../socket");
    emitToUser(userId, "notification:new", notification.toObject ? notification.toObject() : notification);
  } catch (socketErr) {
    console.error("Non-fatal: failed to emit real-time notification:", socketErr.message);
  }

  return notification;
};

/**
 * Creates multiple in-app notifications with deduplication.
 */
const createManyNotifications = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const created = [];
  for (const item of items) {
    try {
      const doc = await createNotification(item);
      if (doc) created.push(doc);
    } catch (err) {
      console.error("Non-fatal: failed to create individual notification:", err.message);
    }
  }
  return created;
};

/**
 * Retrieves paginated notifications strictly scoped to the authenticated user.
 */
const getUserNotifications = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const query = { userId };
  if (options.unreadOnly === true || options.unreadOnly === "true") {
    query.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves unread notification count for the authenticated user.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount: count };
};

/**
 * Marks a single notification as read with strict IDOR verification.
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    const existsForAnother = await Notification.exists({ _id: notificationId });
    if (existsForAnother) {
      const error = new Error("Forbidden: You are not authorized to access or modify this notification");
      error.statusCode = 403;
      throw error;
    }
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
};

/**
 * Marks all unread notifications belonging to the authenticated user as read.
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return {
    success: true,
    modifiedCount: result.modifiedCount || 0,
  };
};

// =========================================================================
// BUSINESS WORKFLOW NOTIFICATION INTEGRATIONS
// =========================================================================

/**
 * Helper to retrieve active linked parent User records for given student profile IDs.
 */
const getLinkedParentsForStudents = async (studentProfileIds = []) => {
  if (!studentProfileIds || studentProfileIds.length === 0) return [];
  const parents = await ParentProfile.find({
    studentIds: { $in: studentProfileIds },
    status: "ACTIVE",
  })
    .populate({
      path: "userId",
      match: { status: "ACTIVE", isDeleted: { $ne: true } },
      select: "name email status isDeleted",
    })
    .lean();

  return parents
    .map((p) => p.userId)
    .filter((u) => u && (u._id || u.id) && u.email);
};

/**
 * Helper to retrieve active linked parent User IDs for given student profile IDs.
 */
const getParentUserIdsForStudents = async (studentProfileIds = []) => {
  if (!studentProfileIds || studentProfileIds.length === 0) return [];
  const parents = await ParentProfile.find({
    studentIds: { $in: studentProfileIds },
    status: "ACTIVE",
  })
    .select("userId")
    .lean();
  return parents.map((p) => p.userId).filter(Boolean);
};

/**
 * A. EXAM PUBLISHED
 * Notifies students enrolled in eligible classes and their linked parents via In-App & Email.
 */
const notifyExamPublished = async (exam) => {
  try {
    if (!exam || !exam.eligibleClassIds || exam.eligibleClassIds.length === 0) return;

    const students = await StudentProfile.find({
      classId: { $in: exam.eligibleClassIds },
      status: "ACTIVE",
    })
      .populate("userId", "name email status isDeleted")
      .lean();

    if (students.length === 0) return;

    const studentUserIds = students.map((s) => (s.userId && s.userId._id ? s.userId._id : s.userId)).filter(Boolean);
    const studentProfileIds = students.map((s) => s._id);
    const parentUserIds = await getParentUserIdsForStudents(studentProfileIds);

    const examTitle = exam.title || exam.name || "Examination";
    const examCode = exam.code ? ` (${exam.code})` : "";

    const notifications = [];

    // Notify Students (In-App)
    for (const uId of studentUserIds) {
      notifications.push({
        userId: uId,
        title: `New Exam Published: ${examTitle}`,
        message: `Examination ${examTitle}${examCode} has been published. Registration is now open.`,
        type: "EXAM_PUBLISHED",
        link: "/student/examinations",
        metadata: {
          examId: exam._id,
          dedupKey: `EXAM_PUB_${exam._id}_${uId}`,
        },
      });
    }

    // Notify Parents (In-App)
    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: `New Exam Published: ${examTitle}`,
        message: `Examination ${examTitle}${examCode} has been published for your ward's curriculum.`,
        type: "EXAM_PUBLISHED",
        link: "/parent/examinations",
        metadata: {
          examId: exam._id,
          dedupKey: `EXAM_PUB_${exam._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch (Asynchronous & Failure Isolated)
    try {
      const emailPromises = [];

      for (const s of students) {
        const sUser = s.userId && typeof s.userId === "object" ? s.userId : null;
        if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
          const emailContent = getExamPublishedEmail({
            recipientName: s.nameEnglish || sUser.name || "Student",
            examTitle,
            examCode: exam.code,
            registrationStartDate: exam.registrationStartDate,
            registrationEndDate: exam.registrationEndDate,
            portalUrl: "/student/examinations",
          });
          emailPromises.push(
            sendEventEmail({
              eventType: "EXAM_PUBLISHED",
              to: sUser.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
              userId: sUser._id,
              dedupKey: `EMAIL_EXAM_PUB_${exam._id}_${sUser._id}`,
              metadata: { examId: exam._id },
            }).catch((e) => console.error("Non-fatal email error in notifyExamPublished:", e.message))
          );
        }
      }

      const linkedParents = await getLinkedParentsForStudents(studentProfileIds);
      for (const pUser of linkedParents) {
        const emailContent = getExamPublishedEmail({
          recipientName: pUser.name || "Parent",
          examTitle,
          examCode: exam.code,
          registrationStartDate: exam.registrationStartDate,
          registrationEndDate: exam.registrationEndDate,
          portalUrl: "/parent/examinations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "EXAM_PUBLISHED",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_EXAM_PUB_${exam._id}_${pUser._id}`,
            metadata: { examId: exam._id },
          }).catch((e) => console.error("Non-fatal email error in notifyExamPublished:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyExamPublished:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyExamPublished:", err.message);
  }
};

/**
 * B. EXAM REGISTRATION CONFIRMED
 * Notifies the registered student and linked parent via In-App & Email.
 */
const notifyExamRegistration = async (registration, exam) => {
  try {
    if (!registration) return;
    const student = await StudentProfile.findById(registration.studentId)
      .populate("userId", "name email status isDeleted")
      .lean();
    if (!student || !student.userId) return;

    const studentUserId = student.userId._id || student.userId;
    const parentUserIds = await getParentUserIdsForStudents([student._id]);
    const examTitle = exam?.title || exam?.name || "Examination";
    const rollNumber = registration.rollNumber || "Assigned";

    const notifications = [
      {
        userId: studentUserId,
        title: "Exam Registration Confirmed",
        message: `Your registration for ${examTitle} (Roll Number: ${rollNumber}) has been confirmed successfully.`,
        type: "EXAM_REGISTRATION",
        link: "/student/examinations/registrations",
        metadata: {
          registrationId: registration._id,
          examId: exam?._id || registration.examId,
          rollNumber,
          dedupKey: `EXAM_REG_${registration._id}_${studentUserId}`,
        },
      },
    ];

    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Exam Registration Confirmed",
        message: `Registration for ${examTitle} (Roll Number: ${rollNumber}) has been confirmed for your ward.`,
        type: "EXAM_REGISTRATION",
        link: "/parent/examinations",
        metadata: {
          registrationId: registration._id,
          examId: exam?._id || registration.examId,
          rollNumber,
          dedupKey: `EXAM_REG_${registration._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];
      const sUser = student.userId && typeof student.userId === "object" ? student.userId : await User.findById(student.userId).lean();
      if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
        const emailContent = getExamRegistrationEmail({
          recipientName: student.nameEnglish || sUser.name || "Student",
          examTitle,
          rollNumber,
          registrationDate: registration.createdAt || new Date(),
          portalUrl: "/student/examinations/registrations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "EXAM_REGISTRATION",
            to: sUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: sUser._id,
            dedupKey: `EMAIL_EXAM_REG_${registration._id}_${sUser._id}`,
            metadata: { registrationId: registration._id, examId: exam?._id },
          }).catch((e) => console.error("Non-fatal email error in notifyExamRegistration:", e.message))
        );
      }

      const linkedParents = await getLinkedParentsForStudents([student._id]);
      for (const pUser of linkedParents) {
        const emailContent = getExamRegistrationEmail({
          recipientName: pUser.name || "Parent",
          examTitle,
          rollNumber,
          registrationDate: registration.createdAt || new Date(),
          portalUrl: "/parent/examinations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "EXAM_REGISTRATION",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_EXAM_REG_${registration._id}_${pUser._id}`,
            metadata: { registrationId: registration._id, examId: exam?._id },
          }).catch((e) => console.error("Non-fatal email error in notifyExamRegistration:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyExamRegistration:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyExamRegistration:", err.message);
  }
};

/**
 * C. PAYMENT SUCCESSFUL
 * Notifies the paying student / parent via In-App & Email.
 */
const notifyPaymentSuccess = async (payment) => {
  try {
    if (!payment) return;
    if (payment.status && payment.status !== "SUCCESS") return;

    const paymentDocId = payment._id || payment.paymentId || new mongoose.Types.ObjectId();

    let studentUserId = null;
    let studentProfileId = payment.studentId;
    let studentUser = null;
    let studentName = "Student";

    if (studentProfileId) {
      const student = await StudentProfile.findById(studentProfileId)
        .populate("userId", "name email status isDeleted")
        .lean();
      if (student) {
        studentName = student.nameEnglish || "Student";
        studentUserId = student.userId?._id || student.userId;
        studentUser = student.userId && typeof student.userId === "object" ? student.userId : null;
      }
    } else if (payment.userId) {
      const payingUser = await User.findById(payment.userId).lean();
      if (payingUser?.role === "STUDENT") {
        studentUserId = payingUser._id;
        studentUser = payingUser;
        studentName = payingUser.name || "Student";
        const student = await StudentProfile.findOne({ userId: payingUser._id }).select("_id").lean();
        studentProfileId = student?._id;
      }
    }

    const parentUserIds = studentProfileId ? await getParentUserIdsForStudents([studentProfileId]) : [];
    const amountStr = `₹${payment.amount}`;
    const txId = payment.transactionId || "N/A";
    const purpose = payment.paymentType === "EXAM_FEE" ? "Exam Registration Fee" : "Institution Fee";

    const notifications = [];

    // Notify Student (In-App)
    if (studentUserId) {
      notifications.push({
        userId: studentUserId,
        title: "Payment Successful",
        message: `Your payment of ${amountStr} for ${purpose} was successful (Ref: ${txId}).`,
        type: "PAYMENT_SUCCESS",
        link: "/student/examinations/registrations",
        metadata: {
          paymentId: paymentDocId,
          transactionId: txId,
          amount: payment.amount,
          dedupKey: `PAYMENT_SUCCESS_${paymentDocId}_${studentUserId}`,
        },
      });
    }

    // Notify Parents (In-App)
    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Payment Successful",
        message: `Payment of ${amountStr} for ${purpose} was confirmed successfully (Ref: ${txId}).`,
        type: "PAYMENT_SUCCESS",
        link: "/parent/payments",
        metadata: {
          paymentId: paymentDocId,
          transactionId: txId,
          amount: payment.amount,
          dedupKey: `PAYMENT_SUCCESS_${paymentDocId}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];

      if (studentUser && studentUser.email && studentUser.status === "ACTIVE" && !studentUser.isDeleted) {
        const emailContent = getPaymentSuccessEmail({
          recipientName: studentName,
          amount: payment.amount,
          transactionId: txId,
          paymentType: payment.paymentType,
          date: payment.createdAt || new Date(),
          portalUrl: "/student/examinations/registrations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "PAYMENT_SUCCESS",
            to: studentUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: studentUser._id,
            dedupKey: `EMAIL_PAYMENT_${paymentDocId}_${studentUser._id}`,
            metadata: { paymentId: paymentDocId, transactionId: txId, amount: payment.amount },
          }).catch((e) => console.error("Non-fatal email error in notifyPaymentSuccess:", e.message))
        );
      }

      if (studentProfileId) {
        const linkedParents = await getLinkedParentsForStudents([studentProfileId]);
        for (const pUser of linkedParents) {
          const emailContent = getPaymentSuccessEmail({
            recipientName: pUser.name || "Parent",
            amount: payment.amount,
            transactionId: txId,
            paymentType: payment.paymentType,
            date: payment.createdAt || new Date(),
            portalUrl: "/parent/payments",
          });
          emailPromises.push(
            sendEventEmail({
              eventType: "PAYMENT_SUCCESS",
              to: pUser.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
              userId: pUser._id,
              dedupKey: `EMAIL_PAYMENT_${paymentDocId}_${pUser._id}`,
              metadata: { paymentId: paymentDocId, transactionId: txId, amount: payment.amount },
            }).catch((e) => console.error("Non-fatal email error in notifyPaymentSuccess:", e.message))
          );
        }
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyPaymentSuccess:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyPaymentSuccess:", err.message);
  }
};

/**
 * D. HALL TICKET ISSUED
 * Notifies student and linked parent when hall ticket becomes available via In-App & Email.
 */
const notifyHallTicketIssued = async (registration, exam = null) => {
  try {
    if (!registration) return;
    const student = await StudentProfile.findById(registration.studentId)
      .populate("userId", "name email status isDeleted")
      .lean();
    if (!student || !student.userId) return;

    const studentUserId = student.userId._id || student.userId;
    const parentUserIds = await getParentUserIdsForStudents([student._id]);
    const examTitle = exam?.title || exam?.name || "Examination";
    const rollNumber = registration.rollNumber || "Assigned";

    const notifications = [
      {
        userId: studentUserId,
        title: "Hall Ticket Available",
        message: `Your Hall Ticket for ${examTitle} (Roll No: ${rollNumber}) is now available for download.`,
        type: "HALL_TICKET",
        link: "/student/examinations/registrations",
        metadata: {
          registrationId: registration._id,
          examId: exam?._id || registration.examId,
          rollNumber,
          dedupKey: `HALL_TICKET_${registration._id}_${studentUserId}`,
        },
      },
    ];

    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Hall Ticket Available",
        message: `Hall Ticket for ${examTitle} (Roll No: ${rollNumber}) is now available for your ward.`,
        type: "HALL_TICKET",
        link: "/parent/examinations",
        metadata: {
          registrationId: registration._id,
          examId: exam?._id || registration.examId,
          rollNumber,
          dedupKey: `HALL_TICKET_${registration._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];
      const sUser = student.userId && typeof student.userId === "object" ? student.userId : await User.findById(student.userId).lean();
      if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
        const emailContent = getHallTicketEmail({
          recipientName: student.nameEnglish || sUser.name || "Student",
          examTitle,
          rollNumber,
          portalUrl: "/student/examinations/registrations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "HALL_TICKET",
            to: sUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: sUser._id,
            dedupKey: `EMAIL_HALL_TICKET_${registration._id}_${sUser._id}`,
            metadata: { registrationId: registration._id, examId: exam?._id, rollNumber },
          }).catch((e) => console.error("Non-fatal email error in notifyHallTicketIssued:", e.message))
        );
      }

      const linkedParents = await getLinkedParentsForStudents([student._id]);
      for (const pUser of linkedParents) {
        const emailContent = getHallTicketEmail({
          recipientName: pUser.name || "Parent",
          examTitle,
          rollNumber,
          portalUrl: "/parent/examinations",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "HALL_TICKET",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_HALL_TICKET_${registration._id}_${pUser._id}`,
            metadata: { registrationId: registration._id, examId: exam?._id, rollNumber },
          }).catch((e) => console.error("Non-fatal email error in notifyHallTicketIssued:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyHallTicketIssued:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyHallTicketIssued:", err.message);
  }
};

/**
 * E. LEAVE SUBMITTED
 * Notifies class faculty reviewers and administrators via In-App & Email.
 */
const notifyLeaveSubmitted = async (leave, student) => {
  try {
    if (!leave || !student) return;

    const reviewerUserIds = new Set();

    // 1. Assigned Faculty for the student's class
    if (student.classId) {
      const facultyList = await FacultyProfile.find({
        assignedClasses: student.classId,
        status: "ACTIVE",
      })
        .select("userId")
        .lean();
      facultyList.forEach((f) => f.userId && reviewerUserIds.add(f.userId.toString()));
    }

    // 2. Mentors
    const MentorAssignment = require("../mentorship/mentor-assignment.model");
    const mentorAssignments = await MentorAssignment.find({
      studentId: student._id,
      status: "ACTIVE",
    })
      .populate("mentorId", "userId")
      .lean();
    mentorAssignments.forEach((m) => {
      if (m.mentorId?.userId) reviewerUserIds.add(m.mentorId.userId.toString());
    });

    // 3. Active Admins
    const admins = await User.find({ role: "ADMIN", status: "ACTIVE" }).select("_id").lean();
    admins.forEach((a) => reviewerUserIds.add(a._id.toString()));

    const studentName = student.nameEnglish || "A student";
    const startDate = leave.dateRange?.startDate
      ? new Date(leave.dateRange.startDate).toLocaleDateString("en-IN")
      : "";
    const endDate = leave.dateRange?.endDate
      ? new Date(leave.dateRange.endDate).toLocaleDateString("en-IN")
      : "";

    const notifications = [];
    for (const reviewerId of reviewerUserIds) {
      notifications.push({
        userId: reviewerId,
        title: "Leave Request Submitted",
        message: `${studentName} submitted a leave request for ${startDate} to ${endDate}. Reason: "${leave.reason}".`,
        type: "LEAVE_SUBMITTED",
        link: "/faculty/leaves",
        metadata: {
          leaveId: leave._id,
          studentId: student._id,
          dedupKey: `LEAVE_SUBMITTED_${leave._id}_${reviewerId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch to Reviewers
    try {
      const emailPromises = [];
      const reviewerUsers = await User.find({
        _id: { $in: Array.from(reviewerUserIds) },
        status: "ACTIVE",
        isDeleted: { $ne: true },
      })
        .select("name email status isDeleted")
        .lean();

      for (const revUser of reviewerUsers) {
        if (revUser.email) {
          const emailContent = getLeaveSubmittedEmail({
            recipientName: revUser.name || "Faculty / Administrator",
            studentName,
            startDate,
            endDate,
            reason: leave.reason,
            portalUrl: "/faculty/leaves",
          });
          emailPromises.push(
            sendEventEmail({
              eventType: "LEAVE_SUBMITTED",
              to: revUser.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
              userId: revUser._id,
              dedupKey: `EMAIL_LEAVE_SUBMITTED_${leave._id}_${revUser._id}`,
              metadata: { leaveId: leave._id, studentId: student._id },
            }).catch((e) => console.error("Non-fatal email error in notifyLeaveSubmitted:", e.message))
          );
        }
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyLeaveSubmitted:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyLeaveSubmitted:", err.message);
  }
};

/**
 * F. LEAVE APPROVED
 * Notifies student and linked parent via In-App & Email.
 */
const notifyLeaveApproved = async (leave, student) => {
  try {
    if (!leave || !student || !student.userId) return;

    const studentUserId = student.userId._id || student.userId;
    const parentUserIds = await getParentUserIdsForStudents([student._id]);
    const startDate = leave.dateRange?.startDate
      ? new Date(leave.dateRange.startDate).toLocaleDateString("en-IN")
      : "";
    const endDate = leave.dateRange?.endDate
      ? new Date(leave.dateRange.endDate).toLocaleDateString("en-IN")
      : "";

    const notifications = [
      {
        userId: studentUserId,
        title: "Leave Request Approved",
        message: `Your leave request for ${startDate} to ${endDate} has been approved.`,
        type: "LEAVE_APPROVED",
        link: "/student/leave",
        metadata: {
          leaveId: leave._id,
          dedupKey: `LEAVE_APPROVED_${leave._id}_${studentUserId}`,
        },
      },
    ];

    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Leave Request Approved",
        message: `Leave application for your ward for ${startDate} to ${endDate} has been approved.`,
        type: "LEAVE_APPROVED",
        link: "/parent/leave",
        metadata: {
          leaveId: leave._id,
          dedupKey: `LEAVE_APPROVED_${leave._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];
      const sUser = await User.findById(studentUserId).select("name email status isDeleted").lean();
      if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
        const emailContent = getLeaveApprovedEmail({
          recipientName: student.nameEnglish || sUser.name || "Student",
          studentName: student.nameEnglish,
          startDate,
          endDate,
          remarks: leave.reviewRemarks,
          portalUrl: "/student/leave",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "LEAVE_APPROVED",
            to: sUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: sUser._id,
            dedupKey: `EMAIL_LEAVE_APP_${leave._id}_${sUser._id}`,
            metadata: { leaveId: leave._id },
          }).catch((e) => console.error("Non-fatal email error in notifyLeaveApproved:", e.message))
        );
      }

      const linkedParents = await getLinkedParentsForStudents([student._id]);
      for (const pUser of linkedParents) {
        const emailContent = getLeaveApprovedEmail({
          recipientName: pUser.name || "Parent",
          studentName: student.nameEnglish,
          startDate,
          endDate,
          remarks: leave.reviewRemarks,
          portalUrl: "/parent/leave",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "LEAVE_APPROVED",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_LEAVE_APP_${leave._id}_${pUser._id}`,
            metadata: { leaveId: leave._id },
          }).catch((e) => console.error("Non-fatal email error in notifyLeaveApproved:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyLeaveApproved:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyLeaveApproved:", err.message);
  }
};

/**
 * G. LEAVE REJECTED
 * Notifies student and linked parent via In-App & Email.
 */
const notifyLeaveRejected = async (leave, student) => {
  try {
    if (!leave || !student || !student.userId) return;

    const studentUserId = student.userId._id || student.userId;
    const parentUserIds = await getParentUserIdsForStudents([student._id]);
    const startDate = leave.dateRange?.startDate
      ? new Date(leave.dateRange.startDate).toLocaleDateString("en-IN")
      : "";
    const endDate = leave.dateRange?.endDate
      ? new Date(leave.dateRange.endDate).toLocaleDateString("en-IN")
      : "";
    const reasonMsg = leave.reviewRemarks ? ` Reason: ${leave.reviewRemarks}` : "";

    const notifications = [
      {
        userId: studentUserId,
        title: "Leave Request Rejected",
        message: `Your leave request for ${startDate} to ${endDate} was rejected.${reasonMsg}`,
        type: "LEAVE_REJECTED",
        link: "/student/leave",
        metadata: {
          leaveId: leave._id,
          dedupKey: `LEAVE_REJECTED_${leave._id}_${studentUserId}`,
        },
      },
    ];

    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Leave Request Rejected",
        message: `Leave application for your ward for ${startDate} to ${endDate} was rejected.${reasonMsg}`,
        type: "LEAVE_REJECTED",
        link: "/parent/leave",
        metadata: {
          leaveId: leave._id,
          dedupKey: `LEAVE_REJECTED_${leave._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];
      const sUser = await User.findById(studentUserId).select("name email status isDeleted").lean();
      if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
        const emailContent = getLeaveRejectedEmail({
          recipientName: student.nameEnglish || sUser.name || "Student",
          studentName: student.nameEnglish,
          startDate,
          endDate,
          remarks: leave.reviewRemarks,
          portalUrl: "/student/leave",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "LEAVE_REJECTED",
            to: sUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: sUser._id,
            dedupKey: `EMAIL_LEAVE_REJ_${leave._id}_${sUser._id}`,
            metadata: { leaveId: leave._id, remarks: leave.reviewRemarks },
          }).catch((e) => console.error("Non-fatal email error in notifyLeaveRejected:", e.message))
        );
      }

      const linkedParents = await getLinkedParentsForStudents([student._id]);
      for (const pUser of linkedParents) {
        const emailContent = getLeaveRejectedEmail({
          recipientName: pUser.name || "Parent",
          studentName: student.nameEnglish,
          startDate,
          endDate,
          remarks: leave.reviewRemarks,
          portalUrl: "/parent/leave",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "LEAVE_REJECTED",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_LEAVE_REJ_${leave._id}_${pUser._id}`,
            metadata: { leaveId: leave._id, remarks: leave.reviewRemarks },
          }).catch((e) => console.error("Non-fatal email error in notifyLeaveRejected:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyLeaveRejected:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyLeaveRejected:", err.message);
  }
};

/**
 * H. RESULT PUBLISHED
 * Respects resultPublicationDate from Phase 2.
 * Notifies students and parents when exam results are published via In-App & Email.
 */
const notifyResultPublished = async (exam, classId) => {
  try {
    if (!exam || !classId) return;

    // Respect Phase 2 Result Publication Scheduling:
    if (exam.resultPublicationDate && new Date(exam.resultPublicationDate) > new Date()) {
      return;
    }

    const students = await StudentProfile.find({
      classId,
      status: "ACTIVE",
    })
      .populate("userId", "name email status isDeleted")
      .lean();

    if (students.length === 0) return;

    const studentUserIds = students.map((s) => (s.userId && s.userId._id ? s.userId._id : s.userId)).filter(Boolean);
    const studentProfileIds = students.map((s) => s._id);
    const parentUserIds = await getParentUserIdsForStudents(studentProfileIds);

    const examTitle = exam.title || exam.name || "Examination";
    const notifications = [];

    // Notify Students (In-App)
    for (const uId of studentUserIds) {
      notifications.push({
        userId: uId,
        title: "Examination Results Published",
        message: `Official results for ${examTitle} are now available to view on your scorecard.`,
        type: "RESULT_PUBLISHED",
        link: "/student/results",
        metadata: {
          examId: exam._id,
          classId,
          dedupKey: `RESULT_PUBLISHED_${exam._id}_${uId}`,
        },
      });
    }

    // Notify Parents (In-App)
    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Examination Results Published",
        message: `Official results for ${examTitle} are now available for your ward.`,
        type: "RESULT_PUBLISHED",
        link: "/parent/analytics",
        metadata: {
          examId: exam._id,
          classId,
          dedupKey: `RESULT_PUBLISHED_${exam._id}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];

      for (const s of students) {
        const sUser = s.userId && typeof s.userId === "object" ? s.userId : null;
        if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
          const emailContent = getResultPublishedEmail({
            recipientName: s.nameEnglish || sUser.name || "Student",
            examTitle,
            portalUrl: "/student/results",
          });
          emailPromises.push(
            sendEventEmail({
              eventType: "RESULT_PUBLISHED",
              to: sUser.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
              userId: sUser._id,
              dedupKey: `EMAIL_RESULT_PUB_${exam._id}_${sUser._id}`,
              metadata: { examId: exam._id, classId },
            }).catch((e) => console.error("Non-fatal email error in notifyResultPublished:", e.message))
          );
        }
      }

      const linkedParents = await getLinkedParentsForStudents(studentProfileIds);
      for (const pUser of linkedParents) {
        const emailContent = getResultPublishedEmail({
          recipientName: pUser.name || "Parent",
          examTitle,
          portalUrl: "/parent/analytics",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "RESULT_PUBLISHED",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_RESULT_PUB_${exam._id}_${pUser._id}`,
            metadata: { examId: exam._id, classId },
          }).catch((e) => console.error("Non-fatal email error in notifyResultPublished:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyResultPublished:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyResultPublished:", err.message);
  }
};

/**
 * I. ATTENDANCE WARNING (BELOW 75%)
 * Notifies student and linked parent when attendance percentage drops below 75% via In-App & Email.
 */
const notifyAttendanceWarning = async (studentProfileId, percentage, date = new Date()) => {
  try {
    if (!studentProfileId || percentage == null) return;

    const student = await StudentProfile.findById(studentProfileId)
      .populate("userId", "name email status isDeleted")
      .lean();
    if (!student || !student.userId) return;

    const studentUserId = student.userId._id || student.userId;
    const parentUserIds = await getParentUserIdsForStudents([student._id]);
    const yearMonth = new Date(date).toISOString().slice(0, 7); // e.g., "2026-10"

    const notifications = [
      {
        userId: studentUserId,
        title: "Attendance Warning: Below 75%",
        message: `Your overall attendance is currently at ${percentage}%, which is below the mandatory 75% threshold. Please review your attendance record.`,
        type: "ATTENDANCE_WARNING",
        link: "/student/attendance",
        metadata: {
          studentId: student._id,
          percentage,
          month: yearMonth,
          dedupKey: `ATTENDANCE_WARNING_${student._id}_${yearMonth}_${studentUserId}`,
        },
      },
    ];

    for (const pId of parentUserIds) {
      notifications.push({
        userId: pId,
        title: "Attendance Warning: Below 75%",
        message: `Your ward's attendance is currently at ${percentage}%, which is below the required 75% threshold. Please review the attendance details.`,
        type: "ATTENDANCE_WARNING",
        link: "/parent/analytics",
        metadata: {
          studentId: student._id,
          percentage,
          month: yearMonth,
          dedupKey: `ATTENDANCE_WARNING_${student._id}_${yearMonth}_${pId}`,
        },
      });
    }

    await createManyNotifications(notifications);

    // Email Dispatch
    try {
      const emailPromises = [];
      const sUser = student.userId && typeof student.userId === "object" ? student.userId : await User.findById(studentUserId).lean();
      if (sUser && sUser.email && sUser.status === "ACTIVE" && !sUser.isDeleted) {
        const emailContent = getAttendanceWarningEmail({
          recipientName: student.nameEnglish || sUser.name || "Student",
          studentName: student.nameEnglish || "Student",
          percentage,
          portalUrl: "/student/attendance",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "ATTENDANCE_WARNING",
            to: sUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: sUser._id,
            dedupKey: `EMAIL_ATTENDANCE_WARN_${student._id}_${yearMonth}_${sUser._id}`,
            metadata: { studentId: student._id, percentage, month: yearMonth },
          }).catch((e) => console.error("Non-fatal email error in notifyAttendanceWarning:", e.message))
        );
      }

      const linkedParents = await getLinkedParentsForStudents([student._id]);
      for (const pUser of linkedParents) {
        const emailContent = getAttendanceWarningEmail({
          recipientName: pUser.name || "Parent",
          studentName: student.nameEnglish || "Student",
          percentage,
          portalUrl: "/parent/analytics",
        });
        emailPromises.push(
          sendEventEmail({
            eventType: "ATTENDANCE_WARNING",
            to: pUser.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            userId: pUser._id,
            dedupKey: `EMAIL_ATTENDANCE_WARN_${student._id}_${yearMonth}_${pUser._id}`,
            metadata: { studentId: student._id, percentage, month: yearMonth },
          }).catch((e) => console.error("Non-fatal email error in notifyAttendanceWarning:", e.message))
        );
      }

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyAttendanceWarning:", emailErr.message);
    }
  } catch (err) {
    console.error("Non-fatal error in notifyAttendanceWarning:", err.message);
  }
};

/**
 * J. TIMETABLE ASSIGNED
 * Notifies the assigned faculty member via In-App (Socket.IO + MongoDB) and optional Email.
 */
const notifyTimetableAssigned = async (entry) => {
  try {
    if (!entry || !entry.facultyId) return null;

    // Resolve Faculty Profile and linked User
    const facultyProfileId = entry.facultyId?._id || entry.facultyId;
    const facultyProfile = await FacultyProfile.findById(facultyProfileId)
      .populate("userId", "name email status isDeleted")
      .lean();

    if (!facultyProfile || !facultyProfile.userId) {
      return null;
    }

    const facultyUser = typeof facultyProfile.userId === "object" ? facultyProfile.userId : null;
    const facultyUserId = facultyUser ? facultyUser._id : facultyProfile.userId;

    if (!facultyUserId) return null;

    // Format human-friendly details
    const dayName = entry.dayOfWeek
      ? entry.dayOfWeek.charAt(0).toUpperCase() + entry.dayOfWeek.slice(1).toLowerCase()
      : "Assigned Day";
    const subjectName = entry.subjectId?.subjectName || entry.subjectId?.name || "Subject";
    const className = entry.classId?.name || "Class";
    const timeSlot = entry.startTime && entry.endTime ? ` (${entry.startTime} - ${entry.endTime})` : "";
    const roomInfo = entry.room ? ` in Room ${entry.room}` : "";

    const title = "New Timetable Assigned";
    const message = `A new timetable period has been assigned to you: ${subjectName} for ${className} on ${dayName}, Period ${entry.periodNumber}${timeSlot}${roomInfo}.`;
    const link = "/faculty/timetable";

    const dedupKey = `TIMETABLE_ASSIGN_${entry._id}_${facultyUserId}`;

    const notification = await createNotification({
      userId: facultyUserId,
      title,
      message,
      type: "TIMETABLE_ASSIGNED",
      link,
      metadata: {
        timetableId: entry._id?.toString() || entry._id,
        classId: (entry.classId?._id || entry.classId)?.toString(),
        subjectId: (entry.subjectId?._id || entry.subjectId)?.toString(),
        dayOfWeek: entry.dayOfWeek,
        periodNumber: entry.periodNumber,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room || "",
        dedupKey,
      },
    });

    // Email Dispatch (Asynchronous & Failure-Isolated)
    try {
      if (facultyUser && facultyUser.email && facultyUser.status === "ACTIVE" && !facultyUser.isDeleted) {
        const emailContent = getTimetableAssignedEmail({
          recipientName: facultyProfile.nameEnglish || facultyUser.name || "Faculty Member",
          subjectName,
          className,
          dayOfWeek: dayName,
          periodNumber: entry.periodNumber,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room || "",
          portalUrl: link,
        });

        sendEventEmail({
          eventType: "TIMETABLE_ASSIGNED",
          to: facultyUser.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          userId: facultyUser._id,
          dedupKey: `EMAIL_TIMETABLE_ASSIGN_${entry._id}_${facultyUser._id}`,
          metadata: { timetableId: entry._id },
        }).catch((e) => console.error("Non-fatal email error in notifyTimetableAssigned:", e.message));
      }
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyTimetableAssigned:", emailErr.message);
    }

    return notification;
  } catch (err) {
    console.error("Non-fatal error in notifyTimetableAssigned:", err.message);
    return null;
  }
};

/**
 * K. TIMETABLE UPDATED
 * Notifies the assigned faculty member when their timetable schedule is updated.
 */
const notifyTimetableUpdated = async (entry, options = {}) => {
  try {
    if (!entry || !entry.facultyId) return null;

    // If previousEntry provided, check if changes actually affect the faculty schedule
    const previous = options.previousEntry;
    if (previous) {
      const prevClassId = (previous.classId?._id || previous.classId)?.toString();
      const newClassId = (entry.classId?._id || entry.classId)?.toString();
      const prevSubjId = (previous.subjectId?._id || previous.subjectId)?.toString();
      const newSubjId = (entry.subjectId?._id || entry.subjectId)?.toString();

      const scheduleChanged =
        previous.dayOfWeek !== entry.dayOfWeek ||
        previous.periodNumber !== entry.periodNumber ||
        previous.startTime !== entry.startTime ||
        previous.endTime !== entry.endTime ||
        (previous.room || "") !== (entry.room || "") ||
        previous.status !== entry.status ||
        prevClassId !== newClassId ||
        prevSubjId !== newSubjId;

      if (!scheduleChanged) {
        return null; // Unrelated change; skip notification
      }
    }

    // Resolve Faculty Profile and linked User
    const facultyProfileId = entry.facultyId?._id || entry.facultyId;
    const facultyProfile = await FacultyProfile.findById(facultyProfileId)
      .populate("userId", "name email status isDeleted")
      .lean();

    if (!facultyProfile || !facultyProfile.userId) {
      return null;
    }

    const facultyUser = typeof facultyProfile.userId === "object" ? facultyProfile.userId : null;
    const facultyUserId = facultyUser ? facultyUser._id : facultyProfile.userId;

    if (!facultyUserId) return null;

    const dayName = entry.dayOfWeek
      ? entry.dayOfWeek.charAt(0).toUpperCase() + entry.dayOfWeek.slice(1).toLowerCase()
      : "Assigned Day";
    const subjectName = entry.subjectId?.subjectName || entry.subjectId?.name || "Subject";
    const className = entry.classId?.name || "Class";
    const timeSlot = entry.startTime && entry.endTime ? ` (${entry.startTime} - ${entry.endTime})` : "";
    const roomInfo = entry.room ? ` in Room ${entry.room}` : "";

    const title = "Timetable Updated";
    const message = `Your timetable schedule has been updated: ${subjectName} for ${className} on ${dayName}, Period ${entry.periodNumber}${timeSlot}${roomInfo}.`;
    const link = "/faculty/timetable";

    const updateVersion = entry.updatedAt ? new Date(entry.updatedAt).getTime() : Date.now();
    const dedupKey = `TIMETABLE_UPDATE_${entry._id}_${facultyUserId}_${updateVersion}`;

    const notification = await createNotification({
      userId: facultyUserId,
      title,
      message,
      type: "TIMETABLE_UPDATED",
      link,
      metadata: {
        timetableId: entry._id?.toString() || entry._id,
        classId: (entry.classId?._id || entry.classId)?.toString(),
        subjectId: (entry.subjectId?._id || entry.subjectId)?.toString(),
        dayOfWeek: entry.dayOfWeek,
        periodNumber: entry.periodNumber,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room || "",
        dedupKey,
      },
    });

    // Email Dispatch (Asynchronous & Failure-Isolated)
    try {
      if (facultyUser && facultyUser.email && facultyUser.status === "ACTIVE" && !facultyUser.isDeleted) {
        const emailContent = getTimetableUpdatedEmail({
          recipientName: facultyProfile.nameEnglish || facultyUser.name || "Faculty Member",
          subjectName,
          className,
          dayOfWeek: dayName,
          periodNumber: entry.periodNumber,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room || "",
          portalUrl: link,
        });

        sendEventEmail({
          eventType: "TIMETABLE_UPDATED",
          to: facultyUser.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          userId: facultyUser._id,
          dedupKey: `EMAIL_TIMETABLE_UPDATE_${entry._id}_${facultyUser._id}_${updateVersion}`,
          metadata: { timetableId: entry._id },
        }).catch((e) => console.error("Non-fatal email error in notifyTimetableUpdated:", e.message));
      }
    } catch (emailErr) {
      console.error("Non-fatal: email dispatch failed in notifyTimetableUpdated:", emailErr.message);
    }

    return notification;
  } catch (err) {
    console.error("Non-fatal error in notifyTimetableUpdated:", err.message);
    return null;
  }
};

module.exports = {
  createNotification,
  createManyNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notifyExamPublished,
  notifyExamRegistration,
  notifyPaymentSuccess,
  notifyHallTicketIssued,
  notifyLeaveSubmitted,
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifyResultPublished,
  notifyAttendanceWarning,
  notifyTimetableAssigned,
  notifyTimetableUpdated,
};
