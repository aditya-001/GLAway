import mongoose from "mongoose";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

const extractDuplicateField = (error) => Object.keys(error.keyValue || {})[0];

export const notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error?.code === 11000) {
    statusCode = 409;
    const duplicateField = extractDuplicateField(error);
    message = duplicateField
      ? `${duplicateField} already exists`
      : "Duplicate value error";
  }

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message = error.message;
  }

  if (error?.message === "Only image uploads are allowed") {
    statusCode = 400;
    message = error.message;
  }

  if (!error.isOperational && statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(details ? { details } : {})
  });
};
