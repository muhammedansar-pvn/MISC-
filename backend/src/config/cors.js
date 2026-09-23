const cors = require("cors");
const env = require("./env");

const allowedOrigins = [
  env.APP_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("CORS policy violation: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = cors(corsOptions);
