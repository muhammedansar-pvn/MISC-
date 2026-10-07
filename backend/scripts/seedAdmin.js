require("dotenv").config();

const connectDB = require("../src/config/db");
const User = require("../src/modules/users/user.model");
const { hashPassword } = require("../src/shared/utils/password");

const seedAdmin = async () => {
  try {
    await connectDB();

    const username = process.env.ADMIN_INITIAL_USERNAME || "admin";
    const password = process.env.ADMIN_INITIAL_PASSWORD || (process.env.NODE_ENV === "production" ? null : "Admin@12345");

    if (!password) {
      throw new Error("ADMIN_INITIAL_PASSWORD environment variable is required to seed admin in production.");
    }

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

    console.log(`Admin user '${username}' created successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();