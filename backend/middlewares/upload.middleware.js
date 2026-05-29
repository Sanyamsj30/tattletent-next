import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/temp/";
    // Checking if folder exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Prevent spaces & special characters in filename
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// 5MB file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Post-upload image compression middleware using sharp
export const compressImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  
  // Define compressed file path under optimized webp format
  const compressedFilename = `compressed-${Date.now()}-${path.basename(req.file.filename, ext)}.webp`;
  const compressedPath = path.join(path.dirname(filePath), compressedFilename);

  try {
    // Compress image to 80% quality WebP with max 1024px width (keeps aspect ratio)
    await sharp(filePath)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(compressedPath);

    // Delete the original massive uploaded file asynchronously
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting original uploaded file:", unlinkErr);
    });

    // Update req.file object transparently for downstream middleware/controllers
    req.file.path = compressedPath;
    req.file.filename = compressedFilename;
    req.file.mimetype = "image/webp";
    req.file.size = fs.statSync(compressedPath).size;
  } catch (err) {
    console.error("Image compression failed, fallback to original upload:", err);
  }

  next();
};

export default upload;
