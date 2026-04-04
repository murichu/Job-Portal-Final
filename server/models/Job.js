import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    // Legacy field retained for backward compatibility in old UI flows/reports.
    salary: { type: Number, default: 0 },
    salaryMode: { type: String, enum: ["fixed", "range"], default: "fixed" },
    salaryAmount: { type: Number, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryVisible: { type: Boolean, default: true },
    isNegotiable: { type: Boolean, default: false },
    uniqueId: {
      type: String,
      unique: true,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    jobStatus: { type: String, enum: ["draft", "active", "expired"], default: "draft" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedForApprovalAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvalNote: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    date: { type: Date, required: true },
    deadline: { type: Date, required: true },
    visible: { type: Boolean, default: true },
    repostedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;
