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

// Profile photo upload filter & limits (5MB, strictly jpg/jpeg/png/webp)
const PHOTO_ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PHOTO_ALLOWED_MIMETYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const photoFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!PHOTO_ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error("Invalid image format. Only JPEG, PNG, and WebP images are allowed."));
  }
  if (!PHOTO_ALLOWED_MIMETYPES.has(file.mimetype)) {
    return cb(new Error("Invalid image MIME type. Only JPEG, PNG, and WebP images are allowed."));
  }
  cb(null, true);
};

const photoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile photos
  },
  fileFilter: photoFileFilter,
});

const handlePhotoUpload = (photoUploadMiddleware) => {
  return (req, res, next) => {
    photoUploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "Profile photo exceeds maximum permitted size of 5MB.",
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "Profile photo upload failed.",
        });
      }
      next();
    });
  };
};

/**
 * Safely remove an uploaded file from disk
 */
const removeUploadedFile = (filePath) => {
  if (!filePath || typeof filePath !== "string") return;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return;
  try {
    const cleanRelative = filePath.replace(/^\/?uploads\/?/, "");
    const fullPath = path.resolve(uploadDir, cleanRelative);
    if (fullPath.startsWith(uploadDir) && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn("Failed to remove old file:", filePath, err.message);
  }
};

module.exports = {
  upload,
  handleUpload,
  uploadSingle: (fieldName) => handleUpload(upload.single(fieldName)),
  uploadArray: (fieldName, maxCount = 5) => handleUpload(upload.array(fieldName, maxCount)),
  uploadProfilePhoto: (fieldName = "photo") => handlePhotoUpload(photoUpload.single(fieldName)),
  removeUploadedFile,
};
