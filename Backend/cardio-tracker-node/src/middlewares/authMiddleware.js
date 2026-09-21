const jwt = require('jsonwebtoken');

// Lấy JWT Secret từ biến môi trường (hoặc dùng chuỗi mặc định tạm thời)
const JWT_SECRET = process.env.JWT_SECRET || 'cardio_tracker_super_secret_key_2026';

const verifyToken = (req, res, next) => {
  // 🍪 Lấy token từ HttpOnly Cookie (nhờ middleware cookie-parser)
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Truy cập bị từ chối! Không tìm thấy Token xác thực trong Cookie.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token không hợp lệ hoặc đã hết hạn!' 
      });
    }
    
    // Gắn thông tin user vào request để dùng tiếp ở controller nếu cần
    req.user = user;
    next();
  });
};

// Middleware kiểm tra quyền Admin (vẫn giữ nguyên logic)
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