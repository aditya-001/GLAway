import "./loadEnv.js";

const normalizeValue = (value) => value?.trim() || "";

const placeholderSecrets = new Set([
  "replace_with_a_long_random_secret",
  "glaway-local-development-secret",
  "change-me",
  "your_jwt_secret"
]);

const environment = normalizeValue(process.env.NODE_ENV) || "development";
const isProduction = environment === "production";
const allowMemoryDb = normalizeValue(process.env.ALLOW_MEMORY_DB).toLowerCase() !== "false";

if (isProduction) {
  const validationErrors = [];
  const mongoUri = normalizeValue(process.env.MONGO_URI);
  const jwtSecret = normalizeValue(process.env.JWT_SECRET);
  const adminEmail = normalizeValue(process.env.ADMIN_EMAIL);
  const adminPassword = normalizeValue(process.env.ADMIN_PASSWORD);
  const razorpayKeyId = normalizeValue(process.env.RAZORPAY_KEY_ID);
  const razorpayKeySecret = normalizeValue(process.env.RAZORPAY_KEY_SECRET);
  const mockRazorpay = normalizeValue(process.env.MOCK_RAZORPAY).toLowerCase();

  if (!mongoUri) {
    validationErrors.push("MONGO_URI is required in production");
  }

  if (!jwtSecret || placeholderSecrets.has(jwtSecret)) {
    validationErrors.push(
      "JWT_SECRET must be set to a strong, non-placeholder value in production"
    );
  }

  if (!adminEmail) {
    validationErrors.push("ADMIN_EMAIL is required in production");
  }

  if (
    !adminPassword ||
    placeholderSecrets.has(adminPassword) ||
    adminPassword.length < 12
  ) {
    validationErrors.push(
      "ADMIN_PASSWORD must be at least 12 characters and cannot be a placeholder in production"
    );
  }

  if (mockRazorpay !== "false") {
    validationErrors.push("MOCK_RAZORPAY must be set to false in production");
  }

  if (allowMemoryDb) {
    validationErrors.push("ALLOW_MEMORY_DB must be false in production");
  }

  if (!razorpayKeyId) {
    validationErrors.push("RAZORPAY_KEY_ID is required in production");
  }

  if (!razorpayKeySecret) {
    validationErrors.push("RAZORPAY_KEY_SECRET is required in production");
  }

  if (validationErrors.length > 0) {
    throw new Error(
      `Invalid production configuration:\n- ${validationErrors.join("\n- ")}`
    );
  }
}

export const runtimeConfig = {
  environment,
  isProduction,
  allowMemoryDb
};
