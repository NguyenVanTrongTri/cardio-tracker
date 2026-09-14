const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate cơ bản chống rỗng
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Tạo JWT Token có thời hạn 1 ngày
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token, // Trả token về cho Frontend lưu lại
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        gender: user.gender,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { login };