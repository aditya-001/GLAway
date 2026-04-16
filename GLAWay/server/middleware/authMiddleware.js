import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

const getJwtSecret = () =>
  process.env.JWT_SECRET || "glaway-local-development-secret";

const getBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const buildProtector =
  ({ model, expectedType, attachKey, notFoundMessage }) =>
  async (req, res, next) => {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
        data: null
      });
    }

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const accountType = decoded.accountType || "user";
      const accountId = decoded.accountId || decoded.userId;

      if (accountType !== expectedType) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized account type",
          data: null
        });
      }

      const account = await model.findById(accountId).select("-password");
      if (!account) {
        return res.status(401).json({
          success: false,
          message: notFoundMessage,
          data: null
        });
      }

      req[attachKey] = account;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: null
      });
    }
  };

export const protectUser = buildProtector({
  model: User,
  expectedType: "user",
  attachKey: "user",
  notFoundMessage: "User not found"
});

export const protectAdmin = buildProtector({
  model: Admin,
  expectedType: "admin",
  attachKey: "admin",
  notFoundMessage: "Admin not found"
});
