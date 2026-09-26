const MentorAssignment = require("./mentor-assignment.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const ParentProfile = require("../parents/parent.model");

/**
 * Assigns or updates a student's mentor for an academic year.
 * Only ADMIN or authorized staff can assign mentors.
 */
const assignMentor = async ({
  mentorId,
  studentId,
  academicYearId,
  monitoringCategory = "NORMAL",
  notes,
  assignedBy,
}) => {
  const mentor = await FacultyProfile.findById(mentorId);
  if (!mentor) {
    throw new Error("Mentor faculty profile not found");
  }

  const student = await StudentProfile.findById(studentId);
  if (!student) {
    throw new Error("Student profile not found");
  }

  const assignment = await MentorAssignment.findOneAndUpdate(
    { studentId, academicYearId },
    {
      mentorId,
      studentId,
      academicYearId,
      monitoringCategory,
      notes,
      assignedBy,
    },
    { upsert: true, new: true, runValidators: true }
  ).populate("mentorId", "facultyId department userId")
   .populate("studentId", "nameEnglish registrationNumber classId house disciplineScore");

  // Keep StudentProfile.mentorId in sync
  await StudentProfile.findByIdAndUpdate(studentId, { mentorId });

  return assignment;
};

/**
 * Retrieves all mentees assigned to the authenticated Asatitha/Faculty.
 */
const getMyMentees = async (userId) => {
  const faculty = await FacultyProfile.findOne({ userId });
  if (!faculty) {
    throw new Error("Faculty profile not found for user");
  }

  return MentorAssignment.find({ mentorId: faculty._id })
    .populate({
      path: "studentId",
      select: "nameEnglish registrationNumber classId house disciplineScore skills parentUserId",
      populate: { path: "classId", select: "name code" },
    })
    .populate("academicYearId", "yearName yearCode")
    .sort({ monitoringCategory: -1, createdAt: -1 });
};

/**
 * Updates a mentee's monitoring category and/or notes.
 * Enforces that only the assigned mentor or an ADMIN can update.
 */
const updateMenteeMonitoring = async (assignmentId, reqUser, { monitoringCategory, notes }) => {
  const assignment = await MentorAssignment.findById(assignmentId);
  if (!assignment) {
    throw new Error("Mentor assignment not found");
  }

  if (reqUser.role !== "ADMIN") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    if (!faculty || !assignment.mentorId.equals(faculty._id)) {
      const err = new Error("Unauthorized: you are not the assigned mentor for this student");
      err.statusCode = 403;
      throw err;
    }
  }

  if (monitoringCategory) {
    assignment.monitoringCategory = monitoringCategory;
  }
  if (typeof notes === "string") {
    assignment.notes = notes;
  }

  await assignment.save();
  return assignment.populate("studentId", "nameEnglish registrationNumber classId house disciplineScore");
};

/**
 * Retrieves mentor assignment for a student.
 * Validates requester's relationship (Student self, Parent child, or assigned Asatitha).
 */
const getStudentMentor = async (studentId, reqUser) => {
  if (reqUser.role === "STUDENT") {
    if (!reqUser.studentId || reqUser.studentId.toString() !== studentId.toString()) {
      const err = new Error("Access denied: students can only access their own mentor information");
      err.statusCode = 403;
      throw err;
    }
  } else if (reqUser.role === "PARENT") {
    const parent = await ParentProfile.findOne({ userId: reqUser.userId });
    if (!parent || !parent.studentIds.map((id) => id.toString()).includes(studentId.toString())) {
      const err = new Error("Access denied: student is not linked to your parent account");
      err.statusCode = 403;
      throw err;
    }
  }

  const assignment = await MentorAssignment.findOne({ studentId })
    .populate({
      path: "mentorId",
      select: "facultyId department userId",
      populate: { path: "userId", select: "name email mobile" },
    })
    .populate("academicYearId", "yearName yearCode");

  return assignment;
};

module.exports = {
  assignMentor,
  getMyMentees,
  updateMenteeMonitoring,
  getStudentMentor,
};
