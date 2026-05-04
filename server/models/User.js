import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    image: { type: String, required: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    resume: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.methods.isActiveUser = function () {
  return this.isActive;
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
