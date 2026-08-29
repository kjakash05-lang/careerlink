const cloudinary = require('cloudinary').v2;
const fs = require('fs');

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const uploadFile = async (filePath, folder = 'prolink', resourceType = 'auto') => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
      });
      // Remove temporary local file if Cloudinary succeeds
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, using local file storage:', err.message);
    }
  }

  // Fallback to local server path
  const filename = filePath.split(/[\\/]/).pop();
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
  };
};

const deleteFile = async (publicId, resourceType = 'image') => {
  if (isCloudinaryConfigured() && publicId && !publicId.startsWith('file-') && !publicId.startsWith('resume-')) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      console.warn('Cloudinary file deletion error:', err.message);
    }
  }
};

module.exports = { uploadFile, deleteFile, isCloudinaryConfigured };
