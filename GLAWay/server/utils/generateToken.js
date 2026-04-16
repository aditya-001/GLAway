import jwt from "jsonwebtoken";

const getJwtSecret = () =>
  process.env.JWT_SECRET || "glaway-local-development-secret";

export const generateToken = (accountId, accountType = "user") =>
  jwt.sign({ accountId, accountType }, getJwtSecret(), {
    expiresIn: "7d"
  });
