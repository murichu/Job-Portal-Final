import mongoose from "mongoose";

const statusSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    token: { type: String, required: true, unique: true },
    services: [{ type: String }],
  },
  { timestamps: true }
);

const StatusSubscriber = mongoose.models.StatusSubscriber || mongoose.model("StatusSubscriber", statusSubscriberSchema);
export default StatusSubscriber;
