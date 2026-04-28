import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.resolve(__dirname, "../uploads");
const isVercelRuntime = process.env.VERCEL === "1";

if (!isVercelRuntime) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = isVercelRuntime
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
      },
      filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
        cb(null, `${Date.now()}-${safeName}`);
      }
    });

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image uploads are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
