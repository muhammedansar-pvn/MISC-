const FacultyAssignment = require("./faculty-assignment.model");
const FacultyProfile = require("../faculty/faculty.model");
const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
const AcademicYear = require("./academic-year.model");
const Class = require("./class.model");
const Subject = require("./subject.model");
const StudentProfile = require("../students/student.model");
const { resolveFacultyProfileId } = require("./academic-auth.service");

/**
 * Creates a linked Faculty Assignment after verifying referential integrity.
 */
const createAssignment = async ({
  facultyId,
  academicYearId,
  classId,
  subjectId,
  status = "ACTIVE",
  notes = "",
  assignedBy = null,
}) => {
  // 1. Verify existence of faculty
  const faculty = status === "ACTIVE"
    ? await assertFacultyAvailableForAssignment(facultyId)
    : await FacultyProfile.findById(facultyId);
  if (!faculty) {
    const error = new Error("Faculty profile not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify existence of academic year
  const academicYear = await AcademicYear.findById(academicYearId);
  if (!academicYear) {
    const error = new Error("Academic Year not found");
    error.statusCode = 404;
    throw error;
  }

  // 3. Verify existence of class
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }

  // Ensure class belongs to the chosen academic year
  if (classDoc.academicYearId && classDoc.academicYearId.toString() !== academicYearId.toString()) {
    const error = new Error(
      `Class "${classDoc.name}" does not belong to the selected academic year`
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Verify existence of subject
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  // 4b. Verify subject is assigned to this class
  if (Array.isArray(subject.classes) && subject.classes.length > 0) {
    const isAssigned = subject.classes.some((c) => c.toString() === classId.toString());
    if (!isAssigned) {
      const error = new Error(
        `Subject "${subject.subjectName || subject.name}" is not assigned to class "${classDoc.name}"`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 5. Check for existing assignment
  const existing = await FacultyAssignment.findOne({
    facultyId,
    academicYearId,
    classId,
    subjectId,
  });

  if (existing) {
    if (existing.status === "ACTIVE" && status === "ACTIVE") {
      const error = new Error(
        "This faculty member is already assigned to teach this subject for this class in the selected academic year."
      );
      error.statusCode = 409;
      throw error;
    }

    // Reactivate or update existing assignment
    existing.status = status;
    if (notes) existing.notes = notes;
    if (assignedBy) existing.assignedBy = assignedBy;
    await existing.save();

    await syncFacultyProfileCache(facultyId);
    return getAssignmentById(existing._id);
  }

  // 6. Create new assignment
  const assignment = await FacultyAssignment.create({
    facultyId,
    academicYearId,
    classId,
    subjectId,
    status,
    notes,
    assignedBy,
  });

  // 7. Sync backward-compatible cache in FacultyProfile
  await syncFacultyProfileCache(facultyId);

  return getAssignmentById(assignment._id);
};

/**
 * Synchronize FacultyProfile assignedClasses & assignedSubjects caches
 */
const syncFacultyProfileCache = async (facultyProfileId) => {
  try {
    const activeAssignments = await FacultyAssignment.find({
      facultyId: facultyProfileId,
      status: "ACTIVE",
    });

    const distinctClassIds = [
      ...new Set(activeAssignments.map((a) => a.classId.toString())),
    ];
    const distinctSubjectIds = [
      ...new Set(activeAssignments.map((a) => a.subjectId.toString())),
    ];

    await FacultyProfile.findByIdAndUpdate(facultyProfileId, {
      $set: {
        assignedClasses: distinctClassIds,
        assignedSubjects: distinctSubjectIds,
      },
    });
  } catch (err) {
    console.error("Failed to sync faculty profile cache:", err);
  }
};

/**
 * List assignments with filtering and pagination.
 */
const getAssignments = async (filter = {}, pagination = null) => {
  const query = {};

  if (filter.facultyId) query.facultyId = filter.facultyId;
  if (filter.academicYearId) query.academicYearId = filter.academicYearId;
  if (filter.classId) query.classId = filter.classId;
  if (filter.subjectId) query.subjectId = filter.subjectId;
  if (filter.status) query.status = filter.status;

  const total = await FacultyAssignment.countDocuments(query);

  let queryBuilder = FacultyAssignment.find(query)
    .populate({
      path: "facultyId",
      select: "nameEnglish nameArabic designation facultyId contactNumber photo department",
    })
    .populate({
      path: "academicYearId",
      select: "yearName yearCode isCurrent status",
    })
    .populate({
      path: "classId",
      select: "name code department status",
    })
    .populate({
      path: "subjectId",
      select: "name subjectName code subjectCode category type credits",
    })
    .populate({
      path: "assignedBy",
      select: "name email",
    })
    .sort({ createdAt: -1 });

  if (pagination && pagination.limit) {
    queryBuilder = queryBuilder.skip(pagination.skip || 0).limit(pagination.limit);
  }

  const data = await queryBuilder.lean();
  return { data, total };
};

/**
 * Get assignment by ID.
 */
const getAssignmentById = async (id) => {
  return FacultyAssignment.findById(id)
    .populate({
      path: "facultyId",
      select: "nameEnglish nameArabic designation facultyId contactNumber photo department",
    })
    .populate({
      path: "academicYearId",
      select: "yearName yearCode isCurrent status",
    })
    .populate({
      path: "classId",
      select: "name code department status",
    })
    .populate({
      path: "subjectId",
      select: "name subjectName code subjectCode category type credits",
    })
    .populate({
      path: "assignedBy",
      select: "name email",
    })
    .lean();
};

/**
 * Delete / Unassign an assignment.
 */
const deleteAssignment = async (id) => {
  const assignment = await FacultyAssignment.findById(id);
  if (!assignment) {
    const error = new Error("Faculty assignment not found");
    error.statusCode = 404;
    throw error;
  }

  const facultyProfileId = assignment.facultyId;
  await FacultyAssignment.findByIdAndDelete(id);

  // Sync caches
  await syncFacultyProfileCache(facultyProfileId);
  return { success: true };
};

/**
 * Get all active assignments for a given faculty member.
 */
const getFacultyMyAssignments = async (facultyIdOrUserId, academicYearId = null) => {
  const profileId = await resolveFacultyProfileId(facultyIdOrUserId);
  if (!profileId) return [];

  const query = {
    facultyId: profileId,
    status: "ACTIVE",
  };
  if (academicYearId) query.academicYearId = academicYearId;

  return FacultyAssignment.find(query)
    .populate("academicYearId", "yearName yearCode isCurrent")
    .populate("classId", "name code department")
    .populate("subjectId", "name subjectName code subjectCode category type credits")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get distinct assigned classes for a faculty member, with enrolled student count and subjects taught.
 */
const getFacultyMyClasses = async (facultyIdOrUserId, academicYearId = null) => {
  const profileId = await resolveFacultyProfileId(facultyIdOrUserId);
  if (!profileId) return [];

  const query = {
    facultyId: profileId,
    status: "ACTIVE",
  };
  if (academicYearId) query.academicYearId = academicYearId;

  const assignments = await FacultyAssignment.find(query)
    .populate("classId", "name code department status academicYearId")
    .populate("subjectId", "name subjectName code subjectCode category type credits")
    .populate("academicYearId", "yearName yearCode isCurrent")
    .lean();

  // If no assignments found via FacultyAssignment, fallback to legacy FacultyProfile.assignedClasses
  if (assignments.length === 0) {
    const profile = await FacultyProfile.findById(profileId)
      .populate("assignedClasses", "name code department status academicYearId")
      .populate("assignedSubjects", "name subjectName code subjectCode category type credits")
      .lean();

    if (profile && profile.assignedClasses && profile.assignedClasses.length > 0) {
      const result = [];
      for (const cls of profile.assignedClasses) {
        if (!cls) continue;
        const studentCount = await StudentProfile.countDocuments({
          classId: cls._id,
          status: "ACTIVE",
          isDeleted: { $ne: true },
        });

        result.push({
          _id: cls._id,
          classId: cls._id,
          name: cls.name,
          code: cls.code,
          department: cls.department || "General",
          academicYear: cls.academicYearId,
          studentCount,
          subjects: profile.assignedSubjects || [],
        });
      }
      return result;
    }
    return [];
  }

  // Group by classId
  const classMap = new Map();

  for (const asgn of assignments) {
    if (!asgn.classId) continue;
    const cidStr = asgn.classId._id.toString();

    if (!classMap.has(cidStr)) {
      classMap.set(cidStr, {
        _id: asgn.classId._id,
        classId: asgn.classId._id,
        name: asgn.classId.name,
        code: asgn.classId.code,
        department: asgn.classId.department || "General",
        academicYear: asgn.academicYearId || asgn.classId.academicYearId,
        subjects: [],
        studentCount: 0,
      });
    }

    if (asgn.subjectId) {
      const classEntry = classMap.get(cidStr);
      const subExists = classEntry.subjects.some(
        (s) => s._id.toString() === asgn.subjectId._id.toString()
      );
      if (!subExists) {
        classEntry.subjects.push({
          _id: asgn.subjectId._id,
          name: asgn.subjectId.name || asgn.subjectId.subjectName,
          code: asgn.subjectId.code || asgn.subjectId.subjectCode,
          category: asgn.subjectId.category,
          credits: asgn.subjectId.credits,
          assignmentId: asgn._id,
        });
      }
    }
  }

  // Populate student counts
  const result = Array.from(classMap.values());
  for (const item of result) {
    item.studentCount = await StudentProfile.countDocuments({
      classId: item._id,
      status: "ACTIVE",
      isDeleted: { $ne: true },
    });
  }

  return result;
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  getFacultyMyAssignments,
  getFacultyMyClasses,
  syncFacultyProfileCache,
};
