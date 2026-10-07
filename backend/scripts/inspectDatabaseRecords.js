const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

async function inspectCollections() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB:", mongoose.connection.name);

  const collections = [
    "users",
    "studentProfiles",
    "parentProfiles",
    "facultyProfiles",
    "institutionProfiles",
    "academicYears",
    "classes",
    "subjects",
    "facultyAssignments",
    "timetables",
    "exams",
    "examSchedules",
    "examRegistrations",
    "leaves",
    "attendanceRecords",
    "payments",
    "notifications",
    "emailevents",
    "syllabuses",
    "enquiries",
    "accountSetupTokens",
    "instituteSettings",
    "campuses",
    "studentDevelopmentScores",
    "markCorrectionRequests",
  ];

  for (const name of collections) {
    const col = mongoose.connection.db.collection(name);
    const docs = await col.find({}).toArray();
    console.log(`\n==================================================`);
    console.log(`COLLECTION: ${name} (Total: ${docs.length})`);
    console.log(`==================================================`);
    for (const d of docs) {
      // summarize essential fields
      const summary = {
        _id: d._id.toString(),
        createdAt: d.createdAt,
      };
      if (d.email) summary.email = d.email;
      if (d.username) summary.username = d.username;
      if (d.role) summary.role = d.role;
      if (d.name) summary.name = d.name;
      if (d.fullName) summary.fullName = d.fullName;
      if (d.nameEnglish) summary.nameEnglish = d.nameEnglish;
      if (d.admissionNumber) summary.admissionNumber = d.admissionNumber;
      if (d.studentId) summary.studentId = d.studentId;
      if (d.parentName) summary.parentName = d.parentName;
      if (d.code) summary.code = d.code;
      if (d.yearCode) summary.yearCode = d.yearCode;
      if (d.subjectCode) summary.subjectCode = d.subjectCode;
      if (d.dayOfWeek) summary.dayOfWeek = d.dayOfWeek;
      if (d.periodNumber) summary.periodNumber = d.periodNumber;
      if (d.title) summary.title = d.title;
      if (d.type) summary.type = d.type;
      if (d.recipientEmail) summary.recipientEmail = d.recipientEmail;
      if (d.recipientId) summary.recipientId = d.recipientId?.toString?.();
      if (d.status) summary.status = d.status;
      if (d.transactionId) summary.transactionId = d.transactionId;
      if (d.amount) summary.amount = d.amount;
      if (d.event) summary.event = d.event;
      console.log(JSON.stringify(summary));
    }
  }

  await mongoose.disconnect();
}

inspectCollections().catch(console.error);
