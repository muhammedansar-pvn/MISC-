require("dotenv").config();

const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { hashPassword } = require("../src/utils/password");

const seedAdmin = async () => {
  try {
    await connectDB();

    const username = "admin";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({ username });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      username,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      mobile: "0000000000",
    });

    console.log("Admin user created successfully.");
    console.log("Username:", username);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();