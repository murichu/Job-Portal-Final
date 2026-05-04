import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: String,
  subject: String,
  content: String,
  recipients: [String],
  status: { type: String, enum: ["draft", "sending", "sent"], default: "draft" }
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
