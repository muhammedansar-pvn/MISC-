const http = require("http");
const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocketServer } = require("./socket");

const PORT = env.PORT || 5000;

connectDB();

const httpServer = http.createServer(app);

// Attach Socket.IO real-time server
initSocketServer(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`MISC Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server Startup Error:", error.message);
});

module.exports = server;