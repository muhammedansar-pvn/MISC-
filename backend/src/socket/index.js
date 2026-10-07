const { Server } = require("socket.io");
const env = require("../config/env");
const { socketAuthMiddleware } = require("./socket.auth");

let io = null;

const allowedOrigins = [
  env.APP_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

/**
 * Initializes Socket.IO attached to the provided HTTP server.
 */
const initSocketServer = (httpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        return callback(new Error("CORS policy violation: Socket Origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply JWT authentication middleware during connection handshake
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.user?.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Join private room dedicated exclusively to this authenticated user
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    if (env.NODE_ENV !== "production") {
      console.log(`[Socket.IO] Authenticated socket connected: ${socket.id} -> Room: ${userRoom}`);
    }

    socket.on("disconnect", (reason) => {
      if (env.NODE_ENV !== "production") {
        console.log(`[Socket.IO] Socket disconnected: ${socket.id} (${reason})`);
      }
    });
  });

  return io;
};

/**
 * Retrieve the active Socket.IO server instance.
 */
const getIO = () => {
  return io;
};

/**
 * Emits an event to a specific user's private room (`user:${userId}`).
 * Multiple tabs/devices for the same user will all receive this event.
 * Fail-safe: if Socket.IO is not initialized or delivery fails, returns false without throwing.
 */
const emitToUser = (userId, event, data) => {
  try {
    if (!io || !userId) {
      return false;
    }

    const room = `user:${userId.toString()}`;
    io.to(room).emit(event, data);
    return true;
  } catch (err) {
    console.error(`[Socket.IO] Non-fatal emission failure to user ${userId}:`, err.message);
    return false;
  }
};

/**
 * Gracefully closes the Socket.IO server instance (useful for test teardown).
 */
const closeSocketServer = async () => {
  if (io) {
    await new Promise((resolve) => io.close(resolve));
    io = null;
  }
};

module.exports = {
  initSocketServer,
  getIO,
  emitToUser,
  closeSocketServer,
};
