const express = require('express');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { uploadFile } = require('../utils/cloudinary');

const router = express.Router();

// Upload image (avatar, cover, post media)
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const result = await uploadFile(req.file.path, 'careerlink/images', 'image');
    res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err) {
    next(err);
  }
});

// Upload document / PDF (Resume, portfolio attachments)
router.post('/document', protect, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF document.' });
    }

    const result = await uploadFile(req.file.path, 'careerlink/documents', 'raw');
    res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
