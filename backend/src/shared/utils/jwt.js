const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
