import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    orderId: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      enum: [
        "Food Quality",
        "Order Delay",
        "Payment Experience",
        "App Experience",
        "Customer Care",
        "Feature Request"
      ],
      default: "App Experience"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Resolved"],
      default: "New"
    }
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
