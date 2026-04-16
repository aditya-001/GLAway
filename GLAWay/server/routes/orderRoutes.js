import express from "express";
import {
  getMyOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protectAdmin, protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectUser, placeOrder);
router.get("/my-orders", protectUser, getMyOrders);
router.get("/:id", protectUser, getOrderById);
router.patch("/:id/status", protectAdmin, updateOrderStatus);

export default router;
