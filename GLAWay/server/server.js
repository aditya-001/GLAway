import "./config/loadEnv.js";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { seedAnimationSettings } from "./controllers/animationSettingsController.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { seedDefaultAdmin } from "./controllers/adminController.js";
import { seedFoodItems } from "./controllers/foodController.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { runtimeConfig } from "./config/runtimeConfig.js";
import animationSettingsRoutes from "./routes/animationSettingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === "1";
const isNetlify =
  process.env.NETLIFY === "true" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const isServerless = isVercel || isNetlify;
let server;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!isServerless) {
  app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GLAWay API is running",
    data: {
      baseUrl: "/api"
    }
  });
});

app.get("/api/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    message: databaseReady
      ? "GLAWay API is healthy"
      : "GLAWay API is running but the database is not ready",
    data: {
      environment: runtimeConfig.environment,
      database: {
        ready: databaseReady,
        state: mongoose.connection.readyState
      },
      uptimeSeconds: Math.round(process.uptime())
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/animation-settings", animationSettingsRoutes);

app.use(notFound);
app.use(errorHandler);

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await disconnectDB();
    console.log("Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown", error);
    process.exit(1);
  }
};

const initializeApp = async () => {
  try {
    await connectDB();
    await seedDefaultAdmin();
    await seedAnimationSettings();
    await seedFoodItems();
  } catch (error) {
    console.error("Unable to start GLAWay API", error);
    if (isServerless) {
      throw error;
    }
    process.exit(1);
  }
};

if (!isServerless) {
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

await initializeApp();

if (!isServerless) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
