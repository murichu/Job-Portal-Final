import mongoose from "mongoose";

const fileDownloadSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requesterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    fileType: {
      type: String,
      enum: ["resume"],
      required: true,
      index: true,
    },
    fileUrlHash: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "denied", "expired", "invalid"],
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

fileDownloadSchema.index({ ownerUserId: 1, fileType: 1, createdAt: -1 });
fileDownloadSchema.index({ status: 1, createdAt: -1 });

const FileDownload =
  mongoose.models.FileDownload || mongoose.model("FileDownload", fileDownloadSchema);

export default FileDownload;
