const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const AccountSetupToken = require("../src/models/AccountSetupToken");
const User = require("../src/models/User");

async function inspectToken0938() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for inspection");

  const startTime = new Date("2026-09-18T09:30:00.000Z");
  const endTime = new Date("2026-09-18T09:45:00.000Z");

  const tokens = await AccountSetupToken.find({
    createdAt: { $gte: startTime, $lte: endTime },
  }).populate("userId");

  console.log(`Found ${tokens.length} AccountSetupToken records created between 09:30 and 09:45 UTC:`);
  console.log(JSON.stringify(tokens, null, 2));

  // Also query all AccountSetupToken records sorted by createdAt desc (last 10)
  const recentTokens = await AccountSetupToken.find().sort({ createdAt: -1 }).limit(10).populate("userId");
  console.log("\nLast 10 AccountSetupToken records in database:");
  console.log(JSON.stringify(recentTokens, null, 2));

  await mongoose.disconnect();
}

inspectToken0938().catch((err) => {
  console.error("Inspection error:", err);
  process.exit(1);
});
