require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

async function check() {
  await connectDB();
  const db = mongoose.connection.db;

  const users = await db.collection("users").find({}).toArray();
  for (const u of users) {
    if (!u.email || u.email === "" || !u.username) {
      const studentProf = await db.collection("studentProfiles").findOne({ userId: u._id });
      const facProf = await db.collection("facultyProfiles").findOne({ userId: u._id });
      console.log(
        u._id.toString(),
        "| username:", u.username,
        "| email:", u.email,
        "| role:", u.role,
        "| studentProf:", studentProf ? (studentProf.fullName || studentProf.admissionNo) : null,
        "| facProf:", facProf ? (facProf.fullName || facProf.employeeId) : null
      );
    }
  }

  await mongoose.disconnect();
}

check();
