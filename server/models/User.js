import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true, // Add index for faster queries
    },
    image: { type: String, required: true },
    password: { 
      type: String, 
      required: true,
      select: false // Don't include password in queries by default
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: { 
      type: Date, 
      default: Date.now 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    resume: { 
      type: String, 
      default: "" 
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null
    },
    role: {
      type: String,
      enum: ["user", "admin", "owner"],
      default: "user"
    },
    permissions: [{
      type: String,
      enum: ["jobs.create", "jobs.edit", "jobs.delete", "jobs.view_all", 
             "applications.view", "applications.manage", "reports.view",
             "company.manage", "organization.manage", "users.manage"]
    }]
  },
  { timestamps: true }
);

// Add compound index for email and isActive
userSchema.index({ email: 1, isActive: 1 });

// Add method to check if user is active
userSchema.methods.isActiveUser = function() {
  return this.isActive;
};

// Add method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
