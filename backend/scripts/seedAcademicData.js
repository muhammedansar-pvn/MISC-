require("dotenv").config();

const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const InstitutionProfile = require("../src/models/InstitutionProfile");
const Campus = require("../src/models/Campus");
const Class = require("../src/models/Class");

const seedAcademicData = async () => {
  try {
    await connectDB();

    // Find existing admin
    const admin = await User.findOne({
      username: "admin",
      role: "ADMIN",
    });

    if (!admin) {
      throw new Error(
        "Admin user not found. Run seedAdmin.js first."
      );
    }

    // Check existing institution
    let institution = await InstitutionProfile.findOne({
      institutionCode: "MISC-TEST",
    });

    if (!institution) {
      institution = await InstitutionProfile.create({
        userId: admin._id,
        institutionName: "MISC Test Institution",
        institutionCode: "MISC-TEST",
        type: "TEST",
        address: "Karanthur, Kozhikode, Kerala",
        contactNumber: "0000000000",
        email: "test@misc.markaz.in",
        status: "ACTIVE",
      });

      console.log("Test institution created.");
    } else {
      console.log("Test institution already exists.");
    }

    // Check existing campus
    let campus = await Campus.findOne({
      code: "MISC-CAMPUS",
    });

    if (!campus) {
      campus = await Campus.create({
        institutionId: institution._id,
        name: "MISC Test Campus",
        code: "MISC-CAMPUS",
        address: "Karanthur, Kozhikode, Kerala",
        contactNumber: "0000000000",
        email: "campus@misc.markaz.in",
        status: "ACTIVE",
      });

      console.log("Test campus created.");
    } else {
      console.log("Test campus already exists.");
    }

    // Check existing class
    let studentClass = await Class.findOne({
      campusId: campus._id,
      code: "STD-01",
      academicYear: 2026,
    });

    if (!studentClass) {
      studentClass = await Class.create({
        name: "Standard 1",
        code: "STD-01",
        campusId: campus._id,
        academicYear: 2026,
        status: "ACTIVE",
      });

      console.log("Test class created.");
    } else {
      console.log("Test class already exists.");
    }

    console.log("\nAcademic test data ready:");
    console.log("Institution ID:", institution._id);
    console.log("Campus ID:", campus._id);
    console.log("Class ID:", studentClass._id);

    process.exit(0);
  } catch (error) {
    console.error(
      "Academic seed failed:",
      error.message
    );

    process.exit(1);
  }
};

seedAcademicData();