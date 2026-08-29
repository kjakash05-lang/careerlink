const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
  const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
  const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) && allowedImageTypes.test(file.mimetype);

  if (file.fieldname === 'resume') {
    if (isPdf) {
      return cb(null, true);
    }
    return cb(new Error('Only PDF files are allowed for resumes!'), false);
  }

  if (isImage || isPdf) {
    return cb(null, true);
  }

  cb(new Error('Invalid file format. Allowed: Images (JPG, PNG, WebP) or PDF documents.'), false);
};

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum limit
  },
  fileFilter,
});

module.exports = upload;
