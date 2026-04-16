import FoodItem from "../models/FoodItem.js";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { generatePickupToken } from "../utils/generatePickupToken.js";
import { toClientPayload } from "../utils/response.js";

const VALID_STATUSES = ["Pending", "Preparing", "Ready"];
const VALID_PAYMENT_METHODS = ["Razorpay", "PhonePe", "UPI", "COD"];
const VALID_PAYMENT_STATUSES = ["Pending", "Paid", "Failed"];
const PLATFORM_FEE = 8;
const DEFAULT_PREP_MINUTES = 15;

const extractPrepMinutes = (prepTime = "") => {
  const values = String(prepTime)
    .match(/\d+/g)
    ?.map(Number);

  if (!values?.length) {
    return DEFAULT_PREP_MINUTES;
  }

  return Math.max(...values);
};

const parsePickupTime = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "Invalid pickup time selected");
  }

  if (date.getTime() < Date.now() - 60 * 1000) {
    throw new AppError(400, "Pickup time must be in the future");
  }

  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    throw new AppError(400, "Pickup time must be within the next 24 hours");
  }

  return date;
};

const formatPickupTimeLabel = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: process.env.CAMPUS_TIMEZONE || "Asia/Kolkata"
  }).format(date);

const resolvePaymentStatus = ({
  paymentMethod,
  paymentStatus,
  razorpayPaymentId
}) => {
  if (paymentMethod !== "COD" && razorpayPaymentId) {
    return "Paid";
  }

  return paymentStatus;
};

const normalizeItems = async (items) => {
  const ids = [...new Set(items.map((item) => item.foodItem))];
  const foodItems = await FoodItem.find({
    _id: { $in: ids },
    isAvailable: true
  });

  const foodMap = new Map(foodItems.map((item) => [item._id.toString(), item]));

  const normalizedItems = items.map((item) => {
    const food = foodMap.get(String(item.foodItem));
    const quantity = Number(item.quantity);

    if (!food) {
      throw new AppError(400, "One or more selected food items are unavailable");
    }

    if (!quantity || quantity < 1) {
      throw new AppError(400, "Each cart item must have a quantity of at least 1");
    }

    return {
      foodItem: food._id,
      name: food.name,
      quantity,
      price: food.price,
      prepMinutes: extractPrepMinutes(food.prepTime)
    };
  });

  return normalizedItems;
};

const buildQrPayload = ({
  orderId,
  orderFor,
  pickupToken,
  totalAmount,
  pickupTimeLabel,
  status,
  createdAt
}) =>
  JSON.stringify({
    orderId,
    orderFor,
    token: pickupToken,
    totalAmount,
    pickupTime: pickupTimeLabel,
    status,
    createdAt
  });

export const placeOrder = asyncHandler(async (req, res) => {
  const {
    items,
    paymentMethod = "Razorpay",
    razorpayOrderId,
    razorpayPaymentId,
    paymentStatus = "Pending",
    requestedPickupAt
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Order must include at least one item");
  }

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(400, "Invalid payment method");
  }

  if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new AppError(400, "Invalid payment status");
  }

  const resolvedPaymentStatus = resolvePaymentStatus({
    paymentMethod,
    paymentStatus,
    razorpayPaymentId
  });

  const normalizedItems = await normalizeItems(items);
  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = subtotal > 0 ? PLATFORM_FEE : 0;
  const totalAmount = subtotal + platformFee;
  const maxPrepMinutes = normalizedItems.reduce(
    (max, item) => Math.max(max, item.prepMinutes || DEFAULT_PREP_MINUTES),
    DEFAULT_PREP_MINUTES
  );
  const estimatedReadyAt = new Date(Date.now() + maxPrepMinutes * 60 * 1000);
  const selectedPickupTime = parsePickupTime(requestedPickupAt);
  const scheduledPickupAt =
    selectedPickupTime && selectedPickupTime.getTime() >= estimatedReadyAt.getTime()
      ? selectedPickupTime
      : estimatedReadyAt;
  const pickupTimeLabel = formatPickupTimeLabel(scheduledPickupAt);

  if (paymentMethod !== "COD" && resolvedPaymentStatus !== "Paid") {
    throw new AppError(
      400,
      "Online payment must be completed before placing the order"
    );
  }

  const orderId = generateOrderId();
  const pickupToken = generatePickupToken();
  const qrPayload = buildQrPayload({
    orderId,
    orderFor: req.user.name,
    pickupToken,
    totalAmount,
    pickupTimeLabel,
    status: "Pending",
    createdAt: new Date().toISOString()
  });

  const order = await Order.create({
    orderId,
    user: req.user._id,
    items: normalizedItems.map(({ prepMinutes, ...item }) => item),
    subtotal,
    platformFee,
    totalAmount,
    paymentMethod,
    paymentStatus: resolvedPaymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    pickupToken,
    qrPayload,
    requestedPickupAt: selectedPickupTime,
    scheduledPickupAt,
    timeSlot: selectedPickupTime || scheduledPickupAt,
    pickupTimeLabel,
    estimatedReadyAt
  });

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  res.status(201).json(toClientPayload(populatedOrder, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.user?._id.toString() !== req.user._id.toString()) {
    throw new AppError(403, "Access denied");
  }

  res.json(toClientPayload(order, "Order fetched"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(400, "Invalid order status");
  }

  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  order.status = status;
  order.readyAt = status === "Ready" ? new Date() : undefined;

  if (status === "Ready") {
    order.estimatedReadyAt = order.readyAt;
  }

  order.qrPayload = buildQrPayload({
    orderId: order.orderId,
    orderFor: order.user?.name,
    pickupToken: order.pickupToken,
    totalAmount: order.totalAmount,
    pickupTimeLabel: order.pickupTimeLabel,
    status,
    createdAt: order.createdAt
  });

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  res.json(toClientPayload(populatedOrder, "Order status updated"));
});
