import express from "express";
import {
  getAnimationSettings,
  updateAnimationSettings
} from "../controllers/animationSettingsController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAnimationSettings);
router.patch("/", protectAdmin, updateAnimationSettings);

export default router;

