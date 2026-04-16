import express from "express";
import {
  createFoodItem,
  deleteFoodItem,
  getFoodItemById,
  getFoodItems,
  updateFoodItem
} from "../controllers/foodController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getFoodItems);
router.get("/:id", getFoodItemById);
router.post("/", protectAdmin, upload.single("image"), createFoodItem);
router.patch("/:id", protectAdmin, upload.single("image"), updateFoodItem);
router.delete("/:id", protectAdmin, deleteFoodItem);

export default router;
