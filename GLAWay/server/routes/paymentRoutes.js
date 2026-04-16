import express from "express";
import {
  createRazorpayOrder,
  getPaymentQrDetails,
  verifyPayment
} from "../controllers/paymentController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/qr", protectUser, getPaymentQrDetails);
router.post("/create-order", protectUser, createRazorpayOrder);
router.post("/verify", protectUser, verifyPayment);

export default router;
