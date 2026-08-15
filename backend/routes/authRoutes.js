const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  updateProfile,
  updateAvatar,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;