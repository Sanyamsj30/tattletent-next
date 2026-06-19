import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary dynamically if credentials exist in the environment
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Memory storage to hold files as raw buffers in RAM
const storage = multer.memoryStorage();

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// 5MB file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Promise-based helper to stream buffer directly to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tattletent',
        format: 'webp',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Post-upload image compression and direct stream middleware
export const compressImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Compress raw buffer to 80% quality WebP with max 1024px width
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const isCloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      // 1. Direct Cloudinary Stream Upload
      const result = await uploadToCloudinary(compressedBuffer);
      
      // Update req.file properties transparently for downstream handlers
      req.file.path = result.secure_url;
      req.file.filename = result.public_id;
      req.file.mimetype = 'image/webp';
      req.file.size = result.bytes;
      
      console.log('☁️ Image successfully streamed to Cloudinary:', result.secure_url);
    } else {
      // 2. Local Fallback Disk Storage for Offline Development
      const uploadPath = 'public/temp/';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const baseName = path.basename(req.file.originalname, ext).replace(/\s+/g, '_');
      const compressedFilename = `compressed-${Date.now()}-${baseName}.webp`;
      const compressedPath = path.join(uploadPath, compressedFilename);

      // Write Sharp buffer directly to disk
      fs.writeFileSync(compressedPath, compressedBuffer);

      req.file.path = compressedPath;
      req.file.filename = compressedFilename;
      req.file.mimetype = 'image/webp';
      req.file.size = fs.statSync(compressedPath).size;

      console.warn('⚠️ Cloudinary not configured. Fallback local image saved at:', compressedPath);
    }
  } catch (err) {
    console.error('❌ Image compression/upload failed, skipping photo:', err.message);
    req.file = null; // prevent undefined path crash in controller
  }

  next();
};

export default upload;
