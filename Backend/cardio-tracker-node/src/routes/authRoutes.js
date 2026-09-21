const express = require('express');
const router = express.Router();

// Import các controller (đã có đủ login, register, logout, forgotPassword, resetPassword, changePassword)
const { login, register, logout, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');

const { loginLimiter } = require('../middlewares/rateLimiter');
const { verifyToken } = require('../middlewares/authMiddleware'); // 1. Import middleware xác thực cookie

router.post('/login', loginLimiter, login);
router.post('/register', register);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 3. Đổi mật khẩu bắt buộc phải đi qua verifyToken để đọc được cookie xác thực
router.post('/change-password', verifyToken, changePassword);

router.get('/test', (req, res) => {
  res.json({ success: true, message: "Auth route is working!" });
});

module.exports = router;