import mongoose from "mongoose";

const scalingEventSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      enum: ["cpu", "memory", "active_sessions", "request_rate", "queue_depth"],
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["scale_up", "scale_down", "none"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    value: { type: Number, required: true },
    threshold: { type: Number, required: true },
    message: { type: String, required: true },
    acknowledged: { type: Boolean, default: false, index: true },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const ScalingEvent = mongoose.models.ScalingEvent || mongoose.model("ScalingEvent", scalingEventSchema);
export default ScalingEvent;
