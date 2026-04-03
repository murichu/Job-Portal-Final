import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Company name
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, required: true }, // Logo
    password: { type: String, required: true },
    recruiterName: { type: String, required: true },
    recruiterPosition: { type: String, required: true },
    companyPhone: { type: String, required: true },
    companyLocation: { type: String, required: true },
    website: { type: String, default: "" },
    about: { type: String, default: "" },
    culture: { type: String, default: "" },
    benefits: [{ type: String }],
    teamHighlights: [{ type: String }],
    interviewStages: {
      type: [String],
      default: ["Applied", "Longlisted", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"],
    },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
