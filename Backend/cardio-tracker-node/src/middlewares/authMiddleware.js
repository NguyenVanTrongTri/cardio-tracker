const jwt = require('jsonwebtoken');

// Lấy JWT Secret từ biến môi trường (hoặc dùng chuỗi mặc định tạm thời)
const JWT_SECRET = process.env.JWT_SECRET || 'cardio_tracker_super_secret_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format token chuẩn: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Truy cập bị từ chối! Không tìm thấy Token xác thực.' 
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

// Middleware kiểm tra quyền Admin (để chống đội pentest lấy tài khoản user thường mò vào khu vực quản trị)
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