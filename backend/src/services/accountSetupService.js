const crypto = require("crypto");
const AccountSetupToken = require("../models/AccountSetupToken");

const generateAccountSetupToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  await AccountSetupToken.create({
    userId,
    tokenHash,
    expiresAt,
  });

  const setupBaseUrl =
    process.env.SETUP_BASE_URL ||
    "http://localhost:5174/account-setup";

  const setupLink = `${setupBaseUrl}/${rawToken}`;

  return {
    setupLink,
    expiresAt,
  };
};

module.exports = {
  generateAccountSetupToken,
};