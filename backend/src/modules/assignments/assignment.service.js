const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Assignment = require("./assignment.model");
const AssignmentSubmission = require("./assignment-submission.model");
const StudentProfile = require("../students/student.model");
const Class = require("../academics/class.model");
const AcademicYear = require("../academics/academic-year.model");
const { isFacultyAssigned, resolveFacultyProfileId } = require("../academics/academic-auth.service");
const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

exports.createAssignment = async (data, files = []) => {
  await assertFacultyAvailableForAssignment(data.facultyId);

  let academicYearId = data.academicYearId;
  if (!academicYearId && data.classId) {
    const cls = await Class.findById(data.classId).select("academicYearId");
    if (cls?.academicYearId) {
      academicYearId = cls.academicYearId;
    }
  }

  if (!academicYearId) {
    const activeYear = await AcademicYear.findOne({ status: "ACTIVE", isCurrent: true }).select("_id");
    academicYearId = activeYear?._id;
  }

  if (!academicYearId) {
    const fallbackYear = await AcademicYear.findOne({ status: "ACTIVE" }).select("_id");
    academicYearId = fallbackYear?._id;
  }

  const attachments = (files || []).map((f) => ({
    fileName: f.originalname,
    fileUrl: `/uploads/${f.filename}`,
    fileType: f.mimetype,
    fileSize: f.size,
  }));

  const maxMarks = data.maxMarks !== undefined && data.maxMarks !== null && !isNaN(data.maxMarks)
    ? Math.max(1, Number(data.maxMarks))
    : 100;

  const assignment = await Assignment.create({
    title: data.title,
    description: data.description || "",
    classId: data.classId,
    subjectId: data.subjectId,
    facultyId: data.facultyId,
    academicYearId,
    maxMarks,
    dueDate: new Date(data.dueDate),
    attachments,
  });

  return await Assignment.findById(assignment._id)
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId")
    .populate("academicYearId", "yearName yearCode status");
};

exports.getAssignments = async (filter = {}, query = {}, user = null) => {
  const { page, limit, skip } = parsePagination(query);

  const mongoFilter = { isDeleted: false };
  if (filter.classId) mongoFilter.classId = filter.classId;
  if (filter.subjectId) mongoFilter.subjectId = filter.subjectId;
  if (filter.facultyId) mongoFilter.facultyId = filter.facultyId;
  if (filter.academicYearId) mongoFilter.academicYearId = filter.academicYearId;

  // If user is STUDENT, strictly enforce student's enrolled classId
  if (user?.role === "STUDENT") {
    let studentProfileId = user.studentId;
    let studentClassId = user.classId;
    if (!studentClassId || !studentProfileId) {
      const sp = await StudentProfile.findOne({ userId: user.userId || user.id });
      if (sp) {
        studentProfileId = sp._id;
        studentClassId = sp.classId;
      }
    }

    if (!studentClassId) {
      // If student is not enrolled in a class, return empty results
      return formatPaginatedResponse({ data: [], total: 0, page, limit });
    }

    mongoFilter.classId = studentClassId;
  }

  const [assignments, total] = await Promise.all([
    Assignment.find(mongoFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("classId", "name code")
      .populate("subjectId", "subjectName subjectCode")
      .populate("facultyId", "nameEnglish facultyId")
      .populate("academicYearId", "yearName yearCode status"),
    Assignment.countDocuments(mongoFilter),
  ]);

  // If user is STUDENT, optionally attach submission status for each assignment
  if (user?.role === "STUDENT") {
    const sp = await StudentProfile.findOne({ userId: user.userId || user.id }).select("_id");
    if (sp && assignments.length > 0) {
      const assignmentIds = assignments.map((a) => a._id);
      const studentSubmissions = await AssignmentSubmission.find({
        assignmentId: { $in: assignmentIds },
        studentId: sp._id,
      }).lean();

      const subMap = new Map();
      studentSubmissions.forEach((s) => subMap.set(s.assignmentId.toString(), s));

      const assignmentsWithSubmission = assignments.map((a) => {
        const doc = a.toObject();
        const sub = subMap.get(a._id.toString());
        doc.mySubmission = sub || null;
        return doc;
      });

      return formatPaginatedResponse({ data: assignmentsWithSubmission, total, page, limit });
    }
  }

  return formatPaginatedResponse({ data: assignments, total, page, limit });
};

exports.getAssignmentById = async (id, user = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const assignment = await Assignment.findOne({ _id: id, isDeleted: false })
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId")
    .populate("academicYearId", "yearName yearCode status");

  if (!assignment) return null;

  // If student is requesting, enforce that it belongs to their class
  if (user?.role === "STUDENT") {
    const sp = await StudentProfile.findOne({ userId: user.userId || user.id }).select("classId");
    if (!sp || !sp.classId || sp.classId.toString() !== assignment.classId._id.toString()) {
      const err = new Error("Access denied: You are not enrolled in this class");
      err.status = 403;
      throw err;
    }
  }

  return assignment;
};

exports.updateAssignment = async (id, updateData, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Invalid ID", status: 400 };

  const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) return { error: "Assignment not found", status: 404 };

  // Authorization: Only Admin, Principal, HOD, or owning Faculty can update
  if (user.role === "FACULTY") {
    const facultyProfileId = await resolveFacultyProfileId(user.facultyId || user.userId || user.id);
    if (!facultyProfileId || assignment.facultyId.toString() !== facultyProfileId.toString()) {
      return { error: "Unauthorized: You can only update your own assignments", status: 403 };
    }
  }

  // If changing classId or subjectId, ensure no student submissions exist yet
  if (
    (updateData.classId && updateData.classId.toString() !== assignment.classId.toString()) ||
    (updateData.subjectId && updateData.subjectId.toString() !== assignment.subjectId.toString())
  ) {
    const submissionCount = await AssignmentSubmission.countDocuments({ assignmentId: id });
    if (submissionCount > 0) {
      return {
        error: "Cannot change class or subject for an assignment with existing submissions",
        status: 400,
      };
    }
  }

  if (updateData.title) assignment.title = updateData.title.trim();
  if (updateData.description !== undefined) assignment.description = updateData.description.trim();
  if (updateData.dueDate) assignment.dueDate = new Date(updateData.dueDate);
  if (updateData.maxMarks !== undefined && updateData.maxMarks !== null && !isNaN(updateData.maxMarks)) {
    assignment.maxMarks = Math.max(1, Number(updateData.maxMarks));
  }
  if (updateData.classId) assignment.classId = updateData.classId;
  if (updateData.subjectId) assignment.subjectId = updateData.subjectId;

  await assignment.save();

  const updated = await Assignment.findById(id)
    .populate("classId", "name code")
    .populate("subjectId", "subjectName subjectCode")
    .populate("facultyId", "nameEnglish facultyId")
    .populate("academicYearId", "yearName yearCode status");

  return { success: true, data: updated };
};

exports.deleteAssignment = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: "Invalid ID", status: 400 };

  const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) return { error: "Assignment not found", status: 404 };

  // Only Admin, Principal, HOD, or the owning Faculty can delete
  if (user.role === "FACULTY") {
    const facultyProfileId = await resolveFacultyProfileId(user.facultyId || user.userId || user.id);
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
  let studentProfile = null;
  if (studentUser.studentId) {
    studentProfile = await StudentProfile.findById(studentUser.studentId);
  }
  if (!studentProfile) {
    studentProfile = await StudentProfile.findOne({ userId: studentUser.userId || studentUser.id });
  }

  if (!studentProfile) {
    return { error: "Student profile not found", status: 404 };
  }

  // Validate student's enrolled class matches assignment.classId
  if (!studentProfile.classId || studentProfile.classId.toString() !== assignment.classId.toString()) {
    // If a file was uploaded in this invalid request, clean it up from disk
    if (file && file.filename) {
      try {
        const filePath = path.join(__dirname, "../../../uploads", file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        // non-fatal cleanup
      }
    }
    return {
      error: "Access denied: You can only submit assignments for your enrolled class",
      status: 400,
    };
  }

  // Check if an existing submission exists
  const existingSubmission = await AssignmentSubmission.findOne({
    assignmentId,
    studentId: studentProfile._id,
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
    { assignmentId, studentId: studentProfile._id },
    { $set: updateDoc },
    { new: true, upsert: true, runValidators: true }
  )
    .populate("studentId", "nameEnglish registrationNumber photo")
    .populate("assignmentId", "title dueDate maxMarks");

  return { success: true, data: submission };
};

exports.getAssignmentSubmissions = async (assignmentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: "Invalid assignment ID", status: 400 };
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) return { error: "Assignment not found", status: 404 };

  // Authorization check for faculty
  if (user.role === "FACULTY") {
    const facultyProfileId = await resolveFacultyProfileId(user.facultyId || user.userId || user.id);
    if (!facultyProfileId) {
      return { error: "Faculty profile not found", status: 404 };
    }

    const isCreator = assignment.facultyId.toString() === facultyProfileId.toString();
    const isAssigned = await isFacultyAssigned({
      facultyId: facultyProfileId,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
    });

    if (!isCreator && !isAssigned) {
      return {
        error: "Access denied: You are not authorized to view submissions for this assignment",
        status: 403,
      };
    }
  }

  const submissions = await AssignmentSubmission.find({ assignmentId })
    .sort({ submittedAt: -1 })
    .populate("studentId", "nameEnglish registrationNumber photo")
    .populate("gradedBy", "nameEnglish facultyId");

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
    .populate("assignmentId", "title dueDate maxMarks")
    .populate("gradedBy", "nameEnglish");

  return { success: true, data: submission };
};

exports.gradeSubmission = async (assignmentId, submissionId, gradeData, user) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: "Invalid assignment ID", status: 400 };
  }
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    return { error: "Invalid submission ID", status: 400 };
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) {
    return { error: "Assignment not found", status: 404 };
  }

  // Authorization check for faculty
  let facultyProfileId = null;
  if (user.role === "FACULTY") {
    facultyProfileId = await resolveFacultyProfileId(user.facultyId || user.userId || user.id);
    if (!facultyProfileId) {
      return { error: "Faculty profile not found", status: 404 };
    }

    const isCreator = assignment.facultyId.toString() === facultyProfileId.toString();
    const isAssigned = await isFacultyAssigned({
      facultyId: facultyProfileId,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
    });

    if (!isCreator && !isAssigned) {
      return {
        error: "Access denied: You are not authorized to grade this assignment",
        status: 403,
      };
    }
  } else if (["ADMIN", "PRINCIPAL", "HOD"].includes(user.role)) {
    facultyProfileId = await resolveFacultyProfileId(user.userId || user.id);
  }

  // Validate marks
  if (gradeData.marks === undefined || gradeData.marks === null || isNaN(gradeData.marks)) {
    return { error: "Marks are required and must be a valid number", status: 400 };
  }

  const marks = Number(gradeData.marks);
  if (marks < 0) {
    return { error: "Marks cannot be negative", status: 400 };
  }

  const maxMarks = assignment.maxMarks || 100;
  if (marks > maxMarks) {
    return {
      error: `Marks cannot exceed maximum permitted marks (${maxMarks})`,
      status: 400,
    };
  }

  const submission = await AssignmentSubmission.findOne({
    _id: submissionId,
    assignmentId,
  });

  if (!submission) {
    return { error: "Submission not found for this assignment", status: 404 };
  }

  submission.marks = marks;
  submission.feedback = gradeData.feedback ? gradeData.feedback.trim() : "";
  submission.status = "GRADED";
  if (facultyProfileId) {
    submission.gradedBy = facultyProfileId;
  }
  submission.gradedAt = new Date();

  await submission.save();

  const populated = await AssignmentSubmission.findById(submission._id)
    .populate("studentId", "nameEnglish registrationNumber photo")
    .populate("gradedBy", "nameEnglish facultyId")
    .populate("assignmentId", "title dueDate maxMarks");

  return { success: true, message: "Submission graded successfully", data: populated };
};
