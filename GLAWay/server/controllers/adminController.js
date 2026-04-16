import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { toClientPayload } from "../utils/response.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const buildAdminSession = (admin) => ({
  admin: {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    outlet: admin.outlet
  },
  token: generateToken(admin._id, "admin")
});

export const seedDefaultAdmin = async () => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL || "admin@glaway.com");
  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin12345",
    10
  );

  await Admin.create({
    name: process.env.ADMIN_NAME || "GLAway Staff",
    email,
    password: hashedPassword
  });

  console.log(`Default admin seeded: ${email}`);
};

export const adminLogin = asyncHandler(async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!normalizedEmail || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    throw new AppError(401, "Invalid admin credentials");
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid admin credentials");
  }

  res.json(toClientPayload(buildAdminSession(admin), "Admin login successful"));
});

export const adminSignup = asyncHandler(async (req, res) => {
  const normalizedName = req.body.name?.trim();
  const normalizedEmail = normalizeEmail(req.body.email);
  const normalizedOutlet = req.body.outlet?.trim();
  const { password } = req.body;

  if (!normalizedName || !normalizedEmail || !password) {
    throw new AppError(400, "Name, email, and password are required");
  }

  if (password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters long");
  }

  const existingAdmin = await Admin.findOne({ email: normalizedEmail });
  if (existingAdmin) {
    throw new AppError(409, "Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    ...(normalizedOutlet ? { outlet: normalizedOutlet } : {})
  });

  res
    .status(201)
    .json(toClientPayload(buildAdminSession(admin), "Admin signup successful"));
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  res.json(toClientPayload(req.admin, "Admin profile fetched"));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filters = {};

  if (status && status !== "All") {
    filters.status = status;
  }

  const orders = await Order.find(filters)
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  const normalizedSearch = search?.trim().toLowerCase();
  if (!normalizedSearch) {
    res.json(orders);
    return;
  }

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.orderId,
      order.pickupToken,
      order.user?.name,
      order.user?.email,
      ...order.items.map((item) => item.name)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  res.json(filteredOrders);
});

export const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.foodItem", "name image category prepTime");

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  res.json(toClientPayload(order, "Order fetched"));
});
