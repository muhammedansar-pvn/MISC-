const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with sanitized filenames and collision-resistant suffixes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || "file"}-${uniqueSuffix}${ext}`);
  },
});

// Dangerous file extensions to reject (per BE-03)
const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".sh", ".bat", ".cmd", ".msi", ".php", ".phtml", ".pl", ".py",
  ".js", ".mjs", ".cjs", ".vbs", ".ps1", ".scr", ".jar", ".dll", ".so", ".bin"
]);

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
  ".xls", ".xlsx", ".csv", ".ods",
  ".ppt", ".pptx", ".odp",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".mp3", ".wav", ".mp4", ".webm"
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type ${ext} is blocked for security reasons.`));
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File extension ${ext} is not allowed. Allowed types include PDF, documents, spreadsheets, images, and archives.`));
  }

  cb(null, true);
};

// 25MB max size per BE-03
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter,
});

/**
 * Middleware factory with clean error interception for Multer errors
 */
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "File exceeds maximum permitted size of 25MB.",
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed.",
        });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleUpload,
  uploadSingle: (fieldName) => handleUpload(upload.single(fieldName)),
  uploadArray: (fieldName, maxCount = 5) => handleUpload(upload.array(fieldName, maxCount)),
};
