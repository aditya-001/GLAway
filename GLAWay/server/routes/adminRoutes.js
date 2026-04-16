import express from "express";
import {
  adminLogin,
  adminSignup,
  getAdminOrderById,
  getAdminProfile,
  getAllOrders
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", adminSignup);
router.post("/login", adminLogin);
router.get("/me", protectAdmin, getAdminProfile);
router.get("/orders", protectAdmin, getAllOrders);
router.get("/orders/:id", protectAdmin, getAdminOrderById);

export default router;
