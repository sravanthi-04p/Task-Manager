// Local disk storage for file attachments (no Cloudinary account needed).
// Swap this for Cloudinary storage later if you want cloud-hosted files -
// only this file and taskController's file_url building would need to change.
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  if (extOk) return cb(null, true);
  cb(new Error('Unsupported file type. Allowed: images, pdf, doc, docx, txt'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
