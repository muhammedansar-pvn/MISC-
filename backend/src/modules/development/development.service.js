const StudentDevelopmentScore = require("./student-development-score.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const ParentProfile = require("../parents/parent.model");

/**
 * Records or updates a student's development score for an academic term.
 * Enforces server-side authorization: Asatitha must be assigned to student's class or be their mentor.
 */
const recordDevelopmentScore = async (scoreData, reqUser) => {
  const {
    studentId,
    academicYearId,
    term,
    academicScore = 0,
    linguisticScore = {},
    spiritualScore = 0,
    skillScore = 0,
    leadershipScore = 0,
    remarks,
  } = scoreData;

  const student = await StudentProfile.findById(studentId);
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }

  let evaluatorProfileId = null;

  if (reqUser.role !== "ADMIN") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    if (!faculty) {
      const err = new Error("Faculty profile not found");
      err.statusCode = 403;
      throw err;
    }

    evaluatorProfileId = faculty._id;

    const isClassTeacher =
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());

    const isMentor =
      student.mentorId && student.mentorId.toString() === faculty._id.toString();

    if (!isClassTeacher && !isMentor) {
      const err = new Error(
        "Unauthorized: student does not belong to your assigned classes or mentees"
      );
      err.statusCode = 403;
      throw err;
    }
  }

  // Compute linguistic overall if not explicitly provided
  const arabic = Number(linguisticScore.arabic) || 0;
  const english = Number(linguisticScore.english) || 0;
  const urdu = Number(linguisticScore.urdu) || 0;
  const computedLinguisticOverall =
    linguisticScore.overall !== undefined
      ? Number(linguisticScore.overall)
      : Math.round(((arabic + english + urdu) / 3) * 100) / 100;

  const fullLinguisticScore = {
    arabic,
    english,
    urdu,
    overall: computedLinguisticOverall,
  };

  // Compute overall development score across 5 areas
  const computedOverallDev =
    scoreData.overallDevelopmentScore !== undefined
      ? Number(scoreData.overallDevelopmentScore)
      : Math.round(
          ((academicScore +
            fullLinguisticScore.overall +
            spiritualScore +
            skillScore +
            leadershipScore) /
            5) *
            100
        ) / 100;

  const updatePayload = {
    studentId,
    academicYearId,
    term,
    academicScore,
    linguisticScore: fullLinguisticScore,
    spiritualScore,
    skillScore,
    leadershipScore,
    overallDevelopmentScore: computedOverallDev,
    remarks,
  };

  if (evaluatorProfileId) {
    updatePayload.evaluatedBy = evaluatorProfileId;
  }

  const scoreDoc = await StudentDevelopmentScore.findOneAndUpdate(
    { studentId, academicYearId, term },
    updatePayload,
    { upsert: true, new: true, runValidators: true }
  ).populate("studentId", "nameEnglish registrationNumber classId house disciplineScore")
   .populate("academicYearId", "yearName yearCode");

  // Keep StudentProfile.skills synchronized
  student.skills = {
    quran: spiritualScore,
    arabic,
    english,
    urdu,
    communication: skillScore,
    leadership: leadershipScore,
  };
  await student.save();

  return scoreDoc;
};

/**
 * Returns development scores for the authenticated student.
 */
const getMyDevelopmentScores = async (studentId) => {
  return StudentDevelopmentScore.find({ studentId })
    .populate("academicYearId", "yearName yearCode")
    .sort({ createdAt: -1 });
};

/**
 * Returns development scores for a target student with RBAC validation.
 */
const getStudentDevelopmentScores = async (studentId, reqUser) => {
  if (reqUser.role === "STUDENT") {
    if (!reqUser.studentId || reqUser.studentId.toString() !== studentId.toString()) {
      const err = new Error("Access denied: students can only access their own scores");
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
  } else if (reqUser.role === "ASATITHA" || reqUser.role === "FACULTY") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    const student = await StudentProfile.findById(studentId);
    if (!faculty || !student) {
      const err = new Error("Profile not found");
      err.statusCode = 404;
      throw err;
    }
    const isClassTeacher =
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());
    const isMentor =
      student.mentorId && student.mentorId.toString() === faculty._id.toString();

    if (!isClassTeacher && !isMentor) {
      const err = new Error("Unauthorized: student does not belong to your assigned classes or mentees");
      err.statusCode = 403;
      throw err;
    }
  }

  return StudentDevelopmentScore.find({ studentId })
    .populate("academicYearId", "yearName yearCode")
    .populate("evaluatedBy", "facultyId department")
    .sort({ createdAt: -1 });
};

module.exports = {
  recordDevelopmentScore,
  getMyDevelopmentScores,
  getStudentDevelopmentScores,
};
