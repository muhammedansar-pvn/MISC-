/**
 * File Access Control Verification
 * Validates whether the requesting authenticated user has authorization
 * to access a given uploaded file based on domain ownership models.
 */
async function canAccessUploadedFile(filename, user) {
  if (!user || !filename) return false;

  // 1. Full access for administrators and academic leadership
  if (["ADMIN", "PRINCIPAL", "HOD"].includes(user.role)) {
    return true;
  }

  const cleanFilename = filename.trim();
  const fileRegex = new RegExp(cleanFilename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:$|[?#])", "i");

  const userId = user.userId || user.id ? (user.userId || user.id).toString() : null;
  const studentId = user.studentId ? user.studentId.toString() : null;
  const facultyId = user.facultyId ? user.facultyId.toString() : null;
  const parentStudentIds = (user.parentStudentIds || []).map((id) => id.toString());
  const userClassId = user.classId ? user.classId.toString() : null;

  // 2. Check Assignment Submissions (Highest privacy: owner student, linked parent, assigned faculty)
  try {
    const AssignmentSubmission = require("../../modules/assignments/assignment-submission.model");
    const submission = await AssignmentSubmission.findOne({ "submittedFile.fileUrl": fileRegex })
      .populate("assignmentId")
      .lean();

    if (submission) {
      // Owner student
      if (studentId && submission.studentId && submission.studentId.toString() === studentId) {
        return true;
      }
      // Linked parent of submitting student
      if (submission.studentId && parentStudentIds.includes(submission.studentId.toString())) {
        return true;
      }
      // Faculty responsible for grading the assignment
      if (
        facultyId &&
        submission.assignmentId &&
        submission.assignmentId.facultyId &&
        submission.assignmentId.facultyId.toString() === facultyId
      ) {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.error("[file-access] Error checking AssignmentSubmission:", err.message);
  }

  // 3. Check Student Profile Photos
  try {
    const StudentProfile = require("../../modules/students/student.model");
    const studentWithPhoto = await StudentProfile.findOne({ photo: fileRegex }).lean();

    if (studentWithPhoto) {
      if (studentId && studentWithPhoto._id.toString() === studentId) return true;
      if (userId && studentWithPhoto.userId && studentWithPhoto.userId.toString() === userId) return true;
      if (parentStudentIds.includes(studentWithPhoto._id.toString())) return true;
      if (studentWithPhoto.parentUserId && studentWithPhoto.parentUserId.toString() === userId) return true;
      if (["FACULTY", "HOD", "PRINCIPAL"].includes(user.role)) return true;
      return false;
    }
  } catch (err) {
    console.error("[file-access] Error checking StudentProfile photo:", err.message);
  }

  // 4. Check Faculty Profile Photos (Visible to all authenticated campus roles)
  try {
    const FacultyProfile = require("../../modules/faculty/faculty.model");
    const facultyWithPhoto = await FacultyProfile.findOne({ photo: fileRegex }).lean();
    if (facultyWithPhoto) {
      return true;
    }
  } catch (err) {
    console.error("[file-access] Error checking FacultyProfile photo:", err.message);
  }

  // 5. Check Study Materials
  try {
    const StudyMaterial = require("../../modules/study-materials/study-material.model");
    const studyMaterial = await StudyMaterial.findOne({ fileUrl: fileRegex }).lean();

    if (studyMaterial) {
      if (facultyId && studyMaterial.facultyId && studyMaterial.facultyId.toString() === facultyId) return true;
      if (["FACULTY", "HOD", "PRINCIPAL"].includes(user.role)) return true;
      if (user.role === "STUDENT") {
        if (!studyMaterial.classId || (userClassId && studyMaterial.classId.toString() === userClassId)) return true;
      }
      if (user.role === "PARENT" && parentStudentIds.length > 0) {
        const StudentProfile = require("../../modules/students/student.model");
        const linkedStudents = await StudentProfile.find({ _id: { $in: parentStudentIds } }).select("classId").lean();
        const parentClassIds = linkedStudents.map((s) => s.classId?.toString()).filter(Boolean);
        if (studyMaterial.classId && parentClassIds.includes(studyMaterial.classId.toString())) return true;
      }
      return false;
    }
  } catch (err) {
    console.error("[file-access] Error checking StudyMaterial:", err.message);
  }

  // 6. Check Assignment attachments
  try {
    const Assignment = require("../../modules/assignments/assignment.model");
    const assignment = await Assignment.findOne({ "attachments.fileUrl": fileRegex }).lean();

    if (assignment) {
      if (facultyId && assignment.facultyId && assignment.facultyId.toString() === facultyId) return true;
      if (["FACULTY", "HOD", "PRINCIPAL"].includes(user.role)) return true;
      if (user.role === "STUDENT") {
        if (!assignment.classId || (userClassId && assignment.classId.toString() === userClassId)) return true;
      }
      if (user.role === "PARENT" && parentStudentIds.length > 0) {
        const StudentProfile = require("../../modules/students/student.model");
        const linkedStudents = await StudentProfile.find({ _id: { $in: parentStudentIds } }).select("classId").lean();
        const parentClassIds = linkedStudents.map((s) => s.classId?.toString()).filter(Boolean);
        if (assignment.classId && parentClassIds.includes(assignment.classId.toString())) return true;
      }
      return false;
    }
  } catch (err) {
    console.error("[file-access] Error checking Assignment:", err.message);
  }

  // 7. Check Syllabuses (Academic materials accessible to all enrolled members)
  try {
    const Syllabus = require("../../modules/academics/syllabus.model");
    const syllabus = await Syllabus.findOne({ fileUrl: fileRegex }).lean();
    if (syllabus) {
      return true;
    }
  } catch (err) {
    console.error("[file-access] Error checking Syllabus:", err.message);
  }

  // 8. Check Download Resources (General guidelines and announcements)
  try {
    const DownloadResource = require("../../modules/downloads/download-resource.model");
    const downloadResource = await DownloadResource.findOne({ fileUrl: fileRegex }).lean();
    if (downloadResource) {
      return true;
    }
  } catch (err) {
    console.error("[file-access] Error checking DownloadResource:", err.message);
  }

  // 9. If file is not mapped to any recognized document or model, deny non-admins
  return false;
}

module.exports = {
  canAccessUploadedFile,
};
