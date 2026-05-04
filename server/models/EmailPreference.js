import mongoose from "mongoose";

const emailPreferenceSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    marketing: { type: Boolean, default: true },
    billing: { type: Boolean, default: true },
    alerts: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    unsubscribedAll: { type: Boolean, default: false, index: true },
    unsubscribeToken: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const EmailPreference = mongoose.models.EmailPreference || mongoose.model("EmailPreference", emailPreferenceSchema);
export default EmailPreference;
