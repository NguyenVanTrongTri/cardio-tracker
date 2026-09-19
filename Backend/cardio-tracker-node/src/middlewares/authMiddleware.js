const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cardio_tracker_super_secret_key_2026';

const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Ưu tiên lấy token từ HttpOnly Cookie (Bảo mật cao, chống XSS)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Dự phòng lấy từ Header "Authorization: Bearer <token>" (Dùng cho Postman hoặc client cũ)
  else {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Nếu không tìm thấy token ở cả 2 nơi
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Truy cập bị từ chối! Không tìm thấy Token xác thực.' 
    });
  }

  // Xác thực tính hợp lệ của JWT
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token không hợp lệ hoặc đã hết hạn!' 
      });
    }
    
    // Gắn thông tin user vào request để dùng tiếp ở controller
    req.user = user;
    next();
  });
};

// Middleware kiểm tra quyền Admin
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        error: 'Quyền hạn bị từ chối! Yêu cầu tài khoản Quản trị viên (ADMIN).' 
      });
    }
  });
};

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };