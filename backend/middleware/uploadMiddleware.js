const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vastmart',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max per file
});

const uploadSellerDocs = upload.fields([
  { name: 'nidDocument', maxCount: 1 },
  { name: 'tradeLicenseDocument', maxCount: 1 },
]);

module.exports = upload;
module.exports.uploadSellerDocs = uploadSellerDocs;