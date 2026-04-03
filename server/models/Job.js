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
