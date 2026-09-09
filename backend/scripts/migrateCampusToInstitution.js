require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

const migrateCampusToInstitution = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    console.log("Starting Campus to Institution Migration Audit...");

    // Check if campuses collection exists
    const collections = await db.listCollections({ name: "campuses" }).toArray();
    
    if (collections.length === 0) {
      console.log("No 'campuses' collection found in database. Nothing to migrate.");
      process.exit(0);
    }

    const campuses = await db.collection("campuses").find({}).toArray();
    console.log(`Found ${campuses.length} records in campuses collection.`);

    if (campuses.length === 0) {
      console.log("Campuses collection is empty. No document migration needed.");
      process.exit(0);
    }

    // Map of campusId string -> institutionId ObjectId
    const campusMap = new Map();
    for (const campus of campuses) {
      if (campus.institutionId) {
        campusMap.set(campus._id.toString(), campus.institutionId);
      }
    }

    console.log(`Mapped ${campusMap.size} campus IDs to institution IDs.`);

    // 1. Migrate classes
    const classes = await db.collection("classes").find({ campusId: { $exists: true } }).toArray();
    let classUpdateCount = 0;
    for (const cls of classes) {
      const instId = campusMap.get(cls.campusId.toString());
      if (instId) {
        await db.collection("classes").updateOne(
          { _id: cls._id },
          { 
            $set: { institutionId: instId },
            $unset: { campusId: "" }
          }
        );
        classUpdateCount++;
      }
    }
    console.log(`Migrated ${classUpdateCount} class documents.`);

    // 2. Migrate studentProfiles
    const students = await db.collection("studentProfiles").find({ campusId: { $exists: true } }).toArray();
    let studentUpdateCount = 0;
    for (const student of students) {
      const instId = campusMap.get(student.campusId.toString());
      if (instId) {
        await db.collection("studentProfiles").updateOne(
          { _id: student._id },
          { 
            $set: { institutionId: instId },
            $unset: { campusId: "" }
          }
        );
        studentUpdateCount++;
      }
    }
    console.log(`Migrated ${studentUpdateCount} studentProfile documents.`);

    // 3. Migrate facultyProfiles
    const faculty = await db.collection("facultyProfiles").find({ campusId: { $exists: true } }).toArray();
    let facultyUpdateCount = 0;
    for (const fac of faculty) {
      const instId = campusMap.get(fac.campusId.toString());
      if (instId) {
        await db.collection("facultyProfiles").updateOne(
          { _id: fac._id },
          { 
            $set: { institutionId: instId },
            $unset: { campusId: "" }
          }
        );
        facultyUpdateCount++;
      }
    }
    console.log(`Migrated ${facultyUpdateCount} facultyProfile documents.`);

    console.log("Migration complete. Note: 'campuses' collection was preserved.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateCampusToInstitution();
