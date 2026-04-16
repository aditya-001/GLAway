import mongoose from "mongoose";

const animationSettingsSchema = new mongoose.Schema(
  {
    animationEnabled: {
      type: Boolean,
      default: true
    },
    animationType: {
      type: String,
      enum: ["slide", "fade", "zoom"],
      default: "slide"
    },
    animationSpeed: {
      type: String,
      enum: ["slow", "normal", "fast"],
      default: "normal"
    }
  },
  { timestamps: true }
);

const AnimationSettings = mongoose.model(
  "AnimationSettings",
  animationSettingsSchema
);

export default AnimationSettings;

