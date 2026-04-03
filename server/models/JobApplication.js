import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    status: {
      type:
         String,
 
            enum: ["P
    e   nding", "Longl
   i    sted", "Sh,
        "Offer",
        "Hired",
      ortlisted", "Rejected"],
      default: "Pending",
      index: true,
    },
    stage: {
      type: String,
      default: "Applied",
      index: true,
    },
    timeline: [
      {
        stage: { type: String, required: true },
        status: { type: String, required: true },
        note: { type: String, default: "" },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "System" },
      },
    ],
    interview: {
      scheduledAt: { type: Date, default: null },
      meetLink: { type: String, default: "" },
      reminderSent: { type: Boolean, default: false },
      notes: { type: String, default: "" },
    },
    feedback: [
      {
        interviewerName: { type: String, required: true },
        satisfaction: { type: Number, min: 1, max: 5, required: true },
        candidateScore: { type: Number, min: 1, max: 5, required: true },
        communication: { type: Number, min: 1, max: 5, required: true },
        technical: { type: Number, min: 1, max: 5, required: true },
        recommendation: {
          type: String,
          enum: ["Strong No", "No", "Maybe", "Yes", "Strong Yes"],
          required: true,
        },
        notes: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    date: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Compound indexes
JobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true }); // No duplicate apps per job/user
JobApplicationSchema.index({ companyId: 1, date: -1 }); // Fast recent apps lookup by company

// Safe model creation for serverless / hot reload environments
const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema);

export default JobApplication;
