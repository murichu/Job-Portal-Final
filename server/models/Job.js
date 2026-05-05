import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const jobSchema = new mongoose.Schema(
  {
    // ✅ UNIQUE ID (AUTO-GENERATED — FIXES YOUR ERROR)
    uniqueId: {
      type: String,
      unique: true,
      required: true,
      default: () => `JOB-${uuidv4()}`,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    level: { type: String, required: true },

    // Legacy field
    salary: { type: Number, default: 0 },

    salaryMode: {
      type: String,
      enum: ["fixed", "range"],
      default: "fixed",
    },

    salaryAmount: { type: Number, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },

    salaryVisible: { type: Boolean, default: true },
    isNegotiable: { type: Boolean, default: false },

    date: { type: Date, required: true },
    deadline: { type: Date, required: true },
    approvalStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    approvalNote: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    jobStatus: {
      type: String,
      enum: ["draft", "active", "expired"],
      default: "draft",
      index: true,
    },

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
