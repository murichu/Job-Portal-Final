import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["investigating", "identified", "monitoring", "resolved"],
      default: "investigating",
      index: true,
    },
    severity: {
      type: String,
      enum: ["minor", "major", "critical"],
      default: "minor",
      index: true,
    },
    affectedServices: [{ type: String }],
    message: { type: String, required: true },
    updates: [
      {
        status: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      },
    ],
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Incident = mongoose.models.Incident || mongoose.model("Incident", incidentSchema);
export default Incident;
