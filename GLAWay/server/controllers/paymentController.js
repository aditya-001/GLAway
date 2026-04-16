import crypto from "crypto";
import Razorpay from "razorpay";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPaymentQrConfig } from "../utils/paymentQr.js";
import { toClientPayload } from "../utils/response.js";

const isMockMode = () =>
  process.env.MOCK_RAZORPAY !== "false" ||
  !process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID.includes("your_key") ||
  !process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_KEY_SECRET.includes("your_key");

const buildPaymentQrPayload = () => {
  const paymentQr = getPaymentQrConfig();

  if (!paymentQr.enabled) {
    return null;
  }

  return {
    upiUri: paymentQr.upiUri,
    label: paymentQr.label,
    provider: paymentQr.provider,
    image: paymentQr.imagePath
  };
};

const buildMockRazorpayOrder = (amount) => {
  const timestamp = Date.now();

  return {
    id: `mock_order_${timestamp}`,
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `mock_receipt_${timestamp}`,
    isMock: true,
    paymentQr: buildPaymentQrPayload()
  };
};

const getRazorpayClient = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

export const getPaymentQrDetails = asyncHandler(async (_req, res) => {
  const paymentQr = buildPaymentQrPayload();

  if (!paymentQr) {
    throw new AppError(404, "Payment QR is not configured");
  }

  res.json(toClientPayload(paymentQr, "Payment QR fetched"));
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new AppError(400, "Amount must be greater than 0");
  }

  try {
    if (isMockMode()) {
      res.json(toClientPayload(buildMockRazorpayOrder(amount), "Mock Razorpay order created"));
      return;
    }

    const order = await getRazorpayClient().orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json(toClientPayload(order, "Razorpay order created"));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isMockMode()) {
      res.json(toClientPayload(buildMockRazorpayOrder(amount), "Mock Razorpay order created"));
      return;
    }

    throw new AppError(500, "Unable to create Razorpay order", error.message);
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id) {
    throw new AppError(400, "razorpay_order_id is required");
  }

  if (isMockMode() || razorpay_order_id.startsWith("mock_order_")) {
    res.json(
      toClientPayload(
        {
          verified: true,
          razorpayPaymentId: razorpay_payment_id || `mock_payment_${Date.now()}`,
          paymentStatus: "Paid"
        },
        "Payment verified"
      )
    );
    return;
  }

  if (!razorpay_payment_id || !razorpay_signature) {
    throw new AppError(400, "Payment verification details are incomplete");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  res.json(
    toClientPayload(
      {
        verified: isAuthentic,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: isAuthentic ? "Paid" : "Failed"
      },
      isAuthentic ? "Payment verified" : "Payment verification failed"
    )
  );
});
