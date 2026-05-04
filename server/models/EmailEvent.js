import mongoose from "mongoose";

const emailEventSchema = new mongoose.Schema(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    template: { type: String, default: "custom", index: true },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "opened", "clicked"],
      default: "queued",
      index: true,
    },
    messageId: { type: String, default: "", index: true },
    trackingId: { type: String, required: true, unique: true, index: true },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    nextRetryAt: { type: Date, default: null, index: true },
    lastError: { type: String, default: "" },
    openedAt: { type: Date, default: null },
    clickedAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const EmailEvent = mongoose.models.EmailEvent || mongoose.model("EmailEvent", emailEventSchema);
export default EmailEvent;
