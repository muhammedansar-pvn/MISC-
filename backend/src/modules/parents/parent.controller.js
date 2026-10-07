const ParentProfile = require("./parent.model");
const StudentProfile = require("../students/student.model");
const User = require("../users/user.model");

/**
 * Get authenticated parent profile with linked students
 */
const getMyProfile = async (req, res) => {
  try {
    const parentUserId = req.user.userId || req.user.id;
    let parentProfile = await ParentProfile.findOne({
      userId: parentUserId,
      isDeleted: { $ne: true },
    }).populate({
      path: "studentIds",
      match: { isDeleted: { $ne: true } },
      select: "nameEnglish registrationNumber classId dateOfBirth admissionYear photo status",
      populate: { path: "classId", select: "name code" },
    });

    // Self-healing fallback: Ensure ParentProfile exists for authenticated PARENT
    if (!parentProfile && req.user.role === "PARENT") {
      const parentUser = await User.findById(parentUserId);
      if (parentUser && parentUser.role === "PARENT") {
        const linkedStudents = await StudentProfile.find({
          parentUserId: parentUser._id,
          isDeleted: { $ne: true },
        }).select("_id");

        parentProfile = await ParentProfile.create({
          userId: parentUser._id,
          name: parentUser.name,
          relationType: "FATHER",
          contactNumber: parentUser.mobile || undefined,
          studentIds: linkedStudents.map((s) => s._id),
          status: "ACTIVE",
          isDeleted: false,
        });

        parentProfile = await ParentProfile.findById(parentProfile._id).populate({
          path: "studentIds",
          select: "nameEnglish registrationNumber classId dateOfBirth admissionYear photo status",
          populate: { path: "classId", select: "name code" },
        });
      }
    }

    if (!parentProfile) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    // Auto-sync: Ensure any students linked via parentUserId are registered in studentIds array
    const currentStudentIds = (parentProfile.studentIds || []).map((s) => (s._id || s).toString());
    const dbLinkedStudents = await StudentProfile.find({
      parentUserId: parentUserId,
      isDeleted: { $ne: true },
    }).select("_id");

    let needsReSync = false;
    for (const st of dbLinkedStudents) {
      if (!currentStudentIds.includes(st._id.toString())) {
        parentProfile.studentIds.push(st._id);
        needsReSync = true;
      }
    }

    if (needsReSync) {
      await parentProfile.save();
      parentProfile = await ParentProfile.findById(parentProfile._id).populate({
        path: "studentIds",
        select: "nameEnglish registrationNumber classId dateOfBirth admissionYear photo status",
        populate: { path: "classId", select: "name code" },
      });
    }

    return res.status(200).json({
      success: true,
      parent: parentProfile,
      data: {
        parent: parentProfile,
      },
    });
  } catch (error) {
    console.error("Get parent profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve parent profile" });
  }
};

/**
 * Get linked students for the authenticated parent
 */
const getMyStudents = async (req, res) => {
  try {
    const parentUserId = req.user.userId || req.user.id;
    let parentProfile = await ParentProfile.findOne({
      userId: parentUserId,
      isDeleted: { $ne: true },
    }).populate({
      path: "studentIds",
      match: { isDeleted: { $ne: true } },
      select: "nameEnglish nameArabic registrationNumber classId dateOfBirth admissionYear photo status disciplineScore",
      populate: { path: "classId", select: "name code" },
    });

    if (!parentProfile && req.user.role === "PARENT") {
      // Trigger self-healing
      await getMyProfile(req, {
        status: () => ({ json: () => {} }),
      });
      parentProfile = await ParentProfile.findOne({
        userId: parentUserId,
        isDeleted: { $ne: true },
      }).populate({
        path: "studentIds",
        match: { isDeleted: { $ne: true } },
        select: "nameEnglish nameArabic registrationNumber classId dateOfBirth admissionYear photo status disciplineScore",
        populate: { path: "classId", select: "name code" },
      });
    }

    if (!parentProfile) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    const students = (parentProfile.studentIds || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      students,
      data: {
        students,
      },
    });
  } catch (error) {
    console.error("Get parent students error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve linked students" });
  }
};

/**
 * Get specific linked student details with strict IDOR verification
 */
const getLinkedStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentStudentIds = (req.user.parentStudentIds || []).map((id) => id.toString());

    if (!parentStudentIds.includes(studentId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to view this student",
      });
    }

    const student = await StudentProfile.findOne({
      _id: studentId,
      isDeleted: { $ne: true },
    })
      .populate("userId", "name email mobile")
      .populate("classId", "name code")
      .populate("institutionId", "name code");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      student,
      data: {
        student,
      },
    });
  } catch (error) {
    console.error("Get linked student by id error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve student details" });
  }
};

/**
 * Get syllabus for a specific linked student with strict IDOR authorization
 */
const getLinkedStudentSyllabus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentStudentIds = (req.user.parentStudentIds || []).map((id) => id.toString());

    if (!parentStudentIds.includes(studentId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to view this student's syllabus",
      });
    }

    const student = await StudentProfile.findOne({
      _id: studentId,
      isDeleted: { $ne: true },
    })
      .populate("classId", "name code")
      .select("nameEnglish registrationNumber classId");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (!student.classId) {
      return res.status(200).json({
        success: true,
        student,
        data: [],
        syllabuses: [],
      });
    }

    const Syllabus = require("../academics/syllabus.model");
    const query = {
      classId: student.classId._id || student.classId,
      status: { $in: ["ACTIVE", "PUBLISHED"] },
      isDeleted: { $ne: true },
    };

    if (req.query.subjectId) {
      query.subjectId = req.query.subjectId;
    }
    if (req.query.academicYearId) {
      query.academicYearId = req.query.academicYearId;
    }
    if (req.query.examType) {
      query.examType = req.query.examType;
    }

    const syllabuses = await Syllabus.find(query)
      .populate("subjectId", "subjectName subjectCode category")
      .populate("classId", "name code")
      .populate("academicYearId", "yearName yearCode")
      .populate("institutionId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      student,
      data: syllabuses,
      syllabuses,
    });
  } catch (error) {
    console.error("Get linked student syllabus error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve student syllabus" });
  }
};

module.exports = {
  getMyProfile,
  getMyStudents,
  getLinkedStudentById,
  getLinkedStudentSyllabus,
};
