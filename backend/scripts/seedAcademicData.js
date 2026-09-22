require("dotenv").config();

const connectDB = require("../src/config/db");

const User = require("../src/modules/users/user.model");
const InstitutionProfile = require("../src/modules/institutions/institution.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");

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

    // Check existing academic year
    let academicYear = await AcademicYear.findOne({
      yearCode: "AY2026",
    });

    if (!academicYear) {
      academicYear = await AcademicYear.create({
        yearName: "2026-2027",
        yearCode: "AY2026",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-03-31"),
        isCurrent: true,
        status: "ACTIVE",
      });
      console.log("Academic year AY2026 created.");
    } else {
      console.log("Academic year AY2026 already exists.");
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
        type: "DIRECT",
        address: "Karanthur, Kozhikode, Kerala",
        contactNumber: "0000000000",
        email: "test@misc.markaz.in",
        status: "ACTIVE",
      });

      console.log("Test institution created.");
    } else {
      console.log("Test institution already exists.");
    }

    // Check existing class
    let studentClass = await Class.findOne({
      institutionId: institution._id,
      code: "STD-01",
      academicYearId: academicYear._id,
    });

    if (!studentClass) {
      studentClass = await Class.create({
        name: "Standard 1",
        code: "STD-01",
        institutionId: institution._id,
        academicYearId: academicYear._id,
        status: "ACTIVE",
      });

      console.log("Test class created.");
    } else {
      console.log("Test class already exists.");
    }

    console.log("\nAcademic test data ready:");
    console.log("Academic Year ID:", academicYear._id);
    console.log("Institution ID:", institution._id);
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