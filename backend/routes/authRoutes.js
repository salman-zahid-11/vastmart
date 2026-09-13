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
  changePassword,
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
router.put('/profile/password', protect, changePassword);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/verify-reset-code', passwordResetLimiter, verifyResetCode);
router.post('/reset-password', passwordResetLimiter, resetPassword);

module.exports = router;