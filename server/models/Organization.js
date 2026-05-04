import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: { 
      type: String, 
      default: "" 
    },
    logo: { 
      type: String, 
      default: "" 
    },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    settings: {
      allowPublicJobs: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      defaultJobVisibility: { type: String, enum: ["public", "private", "organization"], default: "public" }
    },
    subscription: {
      plan: { 
        type: String, 
        enum: ["free", "basic", "premium", "enterprise"], 
        default: "free" 
      },
      maxCompanies: { type: Number, default: 1 },
      maxUsers: { type: Number, default: 10 },
      maxJobs: { type: Number, default: 10 },
      expiresAt: { type: Date }
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Indexes for performance
organizationSchema.index({ slug: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ "subscription.plan": 1 });
organizationSchema.index({ email: 1 });

// Method to check if organization can add more users
organizationSchema.methods.canAddUser = async function() {
  const User = mongoose.model("User");
  const userCount = await User.countDocuments({ organizationId: this._id });
  return userCount < this.subscription.maxUsers;
};

// Method to check if organization can post more jobs
organizationSchema.methods.canPostJob = async function() {
  const Job = mongoose.model("Job");
  const jobCount = await Job.countDocuments({ organizationId: this._id });
  return jobCount < this.subscription.maxJobs;
};

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default Organization;
