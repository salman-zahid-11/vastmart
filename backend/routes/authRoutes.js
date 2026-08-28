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
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiters');
const { registerValidation, loginValidation } = require('../middleware/validators');

router.post('/register', authLimiter, registerValidation, registerUser);
router.post('/login', authLimiter, loginValidation, loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/verify-reset-code', authLimiter, verifyResetCode);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;