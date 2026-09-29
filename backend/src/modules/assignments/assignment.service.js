const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Assignment = require("./assignment.model");
const AssignmentSubmission = require("./assignment-submission.model");
const FacultyProfile = require("../faculty/faculty.model");
const StudentProfile = require("../students/student.model");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

exports.createAssignment = async (data, files = []) => {
  const attachments = (files || []).map((f) => ({
    fileName: f.originalname,
    fileUrl: `/uploads/${f.filename}`,
    fileType: f.mimetype,
    fileSize: f.size,
  }));

  const assignment = await Assignment.create({
    title: data.title,
    description: data.description || "",
    classId: data.classId,
    subjectId: data.subjectId,
    facultyId: data.facultyId,
    dueDate: new Date(data.dueDate),
    attachments,
  });

  return await Assignment.findById(assignment._id)
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId");
};

exports.getAssignments = async (filter = {}, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const mongoFilter = { isDeleted: false };
  if (filter.classId) mongoFilter.classId = filter.classId;
  if (filter.subjectId) mongoFilter.subjectId = filter.subjectId;
  if (filter.facultyId) mongoFilter.facultyId = filter.facultyId;

  const [assignments, total] = await Promise.all([
    Assignment.find(mongoFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("classId", "name code")
      .populate("subjectId", "subjectName subjectCode")
      .populate("facultyId", "nameEnglish facultyId"),
    Assignment.countDocuments(mongoFilter),
  ]);

  return formatPaginatedResponse({ data: assignments, total, page, limit });
};

exports.getAssignmentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Assignment.findOne({ _id: id, isDeleted: false })
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId");
};

exports.deleteAssignment = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Invalid ID", status: 400 };

  const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) return { error: "Assignment not found", status: 404 };

  // Only Admin or the owning Faculty can delete
  if (user.role === "FACULTY") {
    let facultyProfileId = user.facultyId;
    if (!facultyProfileId) {
      const fp = await FacultyProfile.findOne({ userId: user.userId || user.id });
      facultyProfileId = fp?._id;
    }
    if (!facultyProfileId || assignment.facultyId.toString() !== facultyProfileId.toString()) {
      return { error: "Unauthorized: You can only delete your own assignments", status: 403 };
    }
  }

  assignment.isDeleted = true;
  await assignment.save();

  return { success: true, message: "Assignment deleted successfully" };
};

exports.submitAssignment = async (assignmentId, studentUser, body = {}, file = null) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: "Invalid assignment ID", status: 400 };
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) {
    return { error: "Assignment not found", status: 404 };
  }

  // Resolve StudentProfile
  let studentProfileId = studentUser.studentId;
  if (!studentProfileId) {
    const sp = await StudentProfile.findOne({ userId: studentUser.userId || studentUser.id });
    studentProfileId = sp?._id;
  }
  if (!studentProfileId) {
    return { error: "Student profile not found", status: 404 };
  }

  // Check if an existing submission exists
  const existingSubmission = await AssignmentSubmission.findOne({
    assignmentId,
    studentId: studentProfileId,
  });

  // Block resubmission if already evaluated/graded
  if (existingSubmission && existingSubmission.status === "GRADED") {
    // If a new file was uploaded in this rejected request, clean it up from disk
    if (file && file.filename) {
      try {
        const filePath = path.join(__dirname, "../../../uploads", file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        // non-fatal cleanup
      }
    }
    return {
      error: "This assignment has already been evaluated and graded. Resubmission is not permitted.",
      status: 400,
    };
  }

  const now = new Date();
  const isLate = now > new Date(assignment.dueDate);
  const status = isLate ? "LATE" : "SUBMITTED";

  const updateDoc = {
    submittedAt: now,
    status,
  };

  if (body.link) {
    updateDoc.link = body.link;
  }

  if (file) {
    updateDoc.submittedFile = {
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
    };

    // If updating with a new file, clean up the previous file from disk
    if (existingSubmission?.submittedFile?.fileUrl) {
      try {
        const oldFilePath = path.join(__dirname, "../../..", existingSubmission.submittedFile.fileUrl);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      } catch (e) {
        // non-fatal cleanup
      }
    }
  }

  if (!updateDoc.link && !updateDoc.submittedFile && !existingSubmission?.submittedFile && !existingSubmission?.link) {
    return { error: "Must provide either a file upload or a submission link", status: 400 };
  }

  const submission = await AssignmentSubmission.findOneAndUpdate(
    { assignmentId, studentId: studentProfileId },
    { $set: updateDoc },
    { new: true, upsert: true, runValidators: true }
  )
    .populate("studentId", "nameEnglish registrationNumber")
    .populate("assignmentId", "title dueDate");

  return { success: true, data: submission };
};

exports.getAssignmentSubmissions = async (assignmentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: "Invalid assignment ID", status: 400 };
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) return { error: "Assignment not found", status: 404 };

  const submissions = await AssignmentSubmission.find({ assignmentId })
    .sort({ submittedAt: -1 })
    .populate("studentId", "nameEnglish registrationNumber");

  return { success: true, data: submissions };
};

exports.getStudentSubmission = async (assignmentId, studentUser) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: "Invalid assignment ID", status: 400 };
  }

  let studentProfileId = studentUser.studentId;
  if (!studentProfileId) {
    const sp = await StudentProfile.findOne({ userId: studentUser.userId || studentUser.id });
    studentProfileId = sp?._id;
  }

  if (!studentProfileId) {
    return { error: "Student profile not found", status: 404 };
  }

  const submission = await AssignmentSubmission.findOne({
    assignmentId,
    studentId: studentProfileId,
  })
    .populate("assignmentId", "title dueDate")
    .populate("gradedBy", "nameEnglish");

  return { success: true, data: submission };
};
