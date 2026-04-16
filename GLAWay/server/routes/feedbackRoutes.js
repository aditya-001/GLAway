import express from "express";
import {
  createFeedback,
  getFeedbackEntries
} from "../controllers/feedbackController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createFeedback);
router.get("/", protectAdmin, getFeedbackEntries);

export default router;
