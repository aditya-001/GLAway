import AnimationSettings from "../models/AnimationSettings.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toClientPayload } from "../utils/response.js";

const defaultSettings = {
  animationEnabled: true,
  animationType: "slide",
  animationSpeed: "normal"
};
const VALID_ANIMATION_TYPES = ["slide", "fade", "zoom"];
const VALID_ANIMATION_SPEEDS = ["slow", "normal", "fast"];

export const ensureAnimationSettings = async () => {
  let settings = await AnimationSettings.findOne();

  if (!settings) {
    settings = await AnimationSettings.create(defaultSettings);
  }

  return settings;
};

export const seedAnimationSettings = async () => {
  await ensureAnimationSettings();
  console.log("Animation settings ready");
};

export const getAnimationSettings = asyncHandler(async (_req, res) => {
  const settings = await ensureAnimationSettings();
  res.json(toClientPayload(settings, "Animation settings fetched"));
});

export const updateAnimationSettings = asyncHandler(async (req, res) => {
  const settings = await ensureAnimationSettings();
  const { animationEnabled, animationType, animationSpeed } = req.body;

  if (typeof animationEnabled === "boolean") {
    settings.animationEnabled = animationEnabled;
  }

  if (animationType !== undefined) {
    if (!VALID_ANIMATION_TYPES.includes(animationType)) {
      throw new AppError(400, "Invalid animation type");
    }

    settings.animationType = animationType;
  }

  if (animationSpeed !== undefined) {
    if (!VALID_ANIMATION_SPEEDS.includes(animationSpeed)) {
      throw new AppError(400, "Invalid animation speed");
    }

    settings.animationSpeed = animationSpeed;
  }

  await settings.save();

  res.json(toClientPayload(settings, "Animation settings updated"));
});
