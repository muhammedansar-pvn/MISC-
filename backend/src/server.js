const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

const PORT = env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`MISC Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server Startup Error:", error.message);
});

module.exports = server;