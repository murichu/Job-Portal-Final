import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Detect environment (serverless vs local)
// AWS Lambda & Vercel usually only allow writes to /tmp
const isServerless = process.env.AWS_EXECUTION_ENV || process.env.VERCEL;

const uploadsDir = isServerless
  ? path.join("/tmp", "uploads")
  : path.resolve("uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error("Invalid file extension."), null);
    }

    // Use a generated filename to avoid collisions and prevent exposing user file names.
    cb(null, `${randomUUID()}${fileExtension}`);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png, and .pdf files are allowed"), false);
  }
};

// Limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
  files: 1,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Error handler
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 10MB.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Only 1 file allowed.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "File upload error: " + err.message,
        });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export default upload;
