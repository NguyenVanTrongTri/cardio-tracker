const rateLimit = require('express-rate-limit');

// Giới hạn tối đa 10 lần đăng nhập thất bại/thành công trong vòng 1 phút từ 1 IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10, 
  message: {
    success: false,
    error: 'Quá nhiều lần thử đăng nhập từ IP này. Vui lòng thử lại sau 1 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };