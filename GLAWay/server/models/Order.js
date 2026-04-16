import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready"],
      default: "Pending"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "PhonePe", "UPI", "COD"],
      default: "Razorpay"
    },
    pickupToken: {
      type: String,
      required: true
    },
    qrPayload: {
      type: String,
      required: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    requestedPickupAt: Date,
    scheduledPickupAt: Date,
    timeSlot: Date,
    pickupTimeLabel: String,
    readyAt: Date,
    estimatedReadyAt: Date
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
