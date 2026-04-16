import Feedback from "../models/Feedback.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toClientPayload } from "../utils/response.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const orderId = req.body.orderId?.trim();
  const category = req.body.category?.trim();
  const message = req.body.message?.trim();
  const rating = Number(req.body.rating) || 5;

  if (!name || !email || !message) {
    throw new AppError(400, "Name, email, and feedback message are required");
  }

  const feedback = await Feedback.create({
    name,
    email,
    orderId,
    category,
    rating,
    message
  });

  res
    .status(201)
    .json(
      toClientPayload(
        feedback,
        "Feedback submitted successfully. Our team will review it shortly."
      )
    );
});

export const getFeedbackEntries = asyncHandler(async (_req, res) => {
  const feedbackEntries = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbackEntries);
});
