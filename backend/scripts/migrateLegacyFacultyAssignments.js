require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Timetable = require("../src/modules/academics/timetable.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const { syncFacultyProfileCache } = require("../src/modules/academics/faculty-assignment.service");

async function migrateLegacyFacultyAssignments() {
  console.log("=== PHASE 1: MIGRATING LEGACY FACULTY ASSIGNMENTS ===");

  await connectDB();

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 1. Migrate from active Timetable entries
    console.log("\n1. Scanning Timetable entries for existing faculty-class-subject allocations...");
    const timetableEntries = await Timetable.find({
      status: "ACTIVE",
      isDeleted: { $ne: true },
      facultyId: { $ne: null },
      classId: { $ne: null },
      subjectId: { $ne: null },
    }).lean();

    console.log(`Found ${timetableEntries.length} timetable entries to inspect.`);

    for (const entry of timetableEntries) {
      try {
        const faculty = await FacultyProfile.findById(entry.facultyId);
        if (!faculty) {
          skippedCount++;
          continue;
        }

        const classDoc = await Class.findById(entry.classId);
        if (!classDoc) {
          skippedCount++;
          continue;
        }

        const subject = await Subject.findById(entry.subjectId);
        if (!subject) {
          skippedCount++;
          continue;
        }

        // Determine Academic Year
        let academicYearId = entry.academicYearId || classDoc.academicYearId;
        if (!academicYearId) {
          const currentYear = await AcademicYear.findOne({ isCurrent: true });
          if (currentYear) academicYearId = currentYear._id;
        }

        if (!academicYearId) {
          console.warn(`Skipping entry ${entry._id}: No academic year found.`);
          skippedCount++;
          continue;
        }

        // Check if assignment exists
        const existing = await FacultyAssignment.findOne({
          facultyId: faculty._id,
          academicYearId,
          classId: classDoc._id,
          subjectId: subject._id,
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await FacultyAssignment.create({
          facultyId: faculty._id,
          academicYearId,
          classId: classDoc._id,
          subjectId: subject._id,
          status: "ACTIVE",
          notes: "Auto-migrated from existing Timetable entries",
        });

        migratedCount++;
        await syncFacultyProfileCache(faculty._id);
      } catch (err) {
        console.error(`Error processing timetable entry ${entry._id}:`, err.message);
        errorCount++;
      }
    }

    // 2. Scan FacultyProfile with unambiguous 1-to-1 assignments
    console.log("\n2. Scanning FacultyProfiles with 1-to-1 single class and single subject assignments...");
    const facultyProfiles = await FacultyProfile.find({
      status: "ACTIVE",
      isDeleted: { $ne: true },
    }).lean();

    for (const fac of facultyProfiles) {
      if (
        fac.assignedClasses &&
        fac.assignedClasses.length === 1 &&
        fac.assignedSubjects &&
        fac.assignedSubjects.length === 1
      ) {
        try {
          const classId = fac.assignedClasses[0];
          const subjectId = fac.assignedSubjects[0];

          const classDoc = await Class.findById(classId);
          const subjectDoc = await Subject.findById(subjectId);

          if (!classDoc || !subjectDoc) continue;

          let academicYearId = classDoc.academicYearId;
          if (!academicYearId) {
            const currentYear = await AcademicYear.findOne({ isCurrent: true });
            if (currentYear) academicYearId = currentYear._id;
          }
          if (!academicYearId) continue;

          const existing = await FacultyAssignment.findOne({
            facultyId: fac._id,
            academicYearId,
            classId: classDoc._id,
            subjectId: subjectDoc._id,
          });

          if (!existing) {
            await FacultyAssignment.create({
              facultyId: fac._id,
              academicYearId,
              classId: classDoc._id,
              subjectId: subjectDoc._id,
              status: "ACTIVE",
              notes: "Auto-migrated from unambiguous FacultyProfile single assignment",
            });
            migratedCount++;
            await syncFacultyProfileCache(fac._id);
          }
        } catch (err) {
          console.error(`Error processing faculty profile ${fac._id}:`, err.message);
          errorCount++;
        }
      }
    }

    console.log("\n=== MIGRATION SUMMARY ===");
    console.log(`Newly Migrated Assignments: ${migratedCount}`);
    console.log(`Skipped / Already Present: ${skippedCount}`);
    console.log(`Errors Encountered:        ${errorCount}`);
    console.log("========================\n");
  } catch (globalErr) {
    console.error("Migration failed:", globalErr);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

if (require.main === module) {
  migrateLegacyFacultyAssignments().then(() => process.exit(0));
}

module.exports = migrateLegacyFacultyAssignments;
