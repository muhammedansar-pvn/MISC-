const path = require("path");
const fs = require("fs");
const { verifyToken, verifyFileAccessToken, generateFileAccessToken } = require("../shared/utils/jwt");

const uploadDir = path.resolve(__dirname, "../../uploads");

/**
 * Middleware to protect uploaded files.
 * Replaces unauthenticated static file exposure with token-verified access.
 * Supports:
 *   1) Standard Authorization header: Bearer <jwt>
 *   2) Signed query token: ?token=<signed_file_token_or_jwt>
 */
const servePrivateUploads = (req, res) => {
  // 1. Extract token from Authorization header or URL query parameter
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: File access requires authentication or a valid signed URL token",
    });
  }

  // 2. Resolve requested filename and sanitize against path traversal
  const rawPath = (req.path || "").replace(/^\/+/, "");
  const normalizedPath = path.normalize(rawPath);

  if (normalizedPath.startsWith("..") || path.isAbsolute(normalizedPath)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid file path",
    });
  }

  const requestedFilename = path.basename(normalizedPath);

  // 3. Cryptographically verify token
  let authorized = false;

  // Check if token is a dedicated signed file access token
  try {
    const decodedFile = verifyFileAccessToken(token);
    if (decodedFile && decodedFile.purpose === "FILE_ACCESS") {
      if (decodedFile.file === requestedFilename || decodedFile.file === normalizedPath) {
        authorized = true;
      }
    }
  } catch (err) {
    // Fall through to test if it's an authenticated session JWT
  }

  // If not a signed file token, check if it's a valid user session token
  if (!authorized) {
    try {
      const decodedUser = verifyToken(token);
      if (decodedUser && (decodedUser.userId || decodedUser.id)) {
        authorized = true;
      }
    } catch (err) {
      // Invalid user token
    }
  }

  if (!authorized) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired file access token",
    });
  }

  // 4. Verify file existence on disk
  const fullPath = path.resolve(uploadDir, normalizedPath);
  if (!fullPath.startsWith(uploadDir) || !fs.existsSync(fullPath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  // 5. Send file with strict security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  return res.sendFile(fullPath);
};

module.exports = {
  servePrivateUploads,
  generateFileAccessToken,
};
