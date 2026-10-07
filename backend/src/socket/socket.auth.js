const { verifyToken } = require("../shared/utils/jwt");
const User = require("../modules/users/user.model");

/**
 * Socket.IO Authentication Middleware.
 * Strictly verifies the JWT token during the initial connection handshake.
 * Rejects missing, invalid, expired, or malformed tokens.
 * Extracts authenticated user identity authoritative from the verified JWT.
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error("Authentication required: token missing from handshake"));
    }

    if (typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return next(new Error("Authentication required: malformed token"));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return next(new Error(`Authentication failed: ${jwtErr.message || "Invalid or expired token"}`));
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return next(new Error("Authentication failed: token payload missing user identifier"));
    }

    // Verify account exists and is not deleted/inactive
    const user = await User.findById(userId).select("role status isDeleted").lean();
    if (!user || user.isDeleted === true || (user.status !== "ACTIVE" && user.status !== "EMAIL_VERIFIED")) {
      return next(new Error("Authentication failed: user account inactive or deleted"));
    }

    // Attach verified user payload to the socket session
    socket.user = {
      userId: userId.toString(),
      role: user.role || decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return next(new Error("Internal authentication failure during socket handshake"));
  }
};

module.exports = {
  socketAuthMiddleware,
};
