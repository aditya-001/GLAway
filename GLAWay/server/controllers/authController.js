import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { toClientPayload } from "../utils/response.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const buildUserSession = (user) => ({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  },
  token: generateToken(user._id, "user")
});

export const signup = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!name || !email || !password) {
    throw new AppError(400, "Name, email, and password are required");
  }

  if (password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res
    .status(201)
    .json(toClientPayload(buildUserSession(user), "Signup successful"));
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid credentials");
  }

  res.json(toClientPayload(buildUserSession(user), "Login successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(toClientPayload(req.user, "Profile fetched"));
});
