const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // So sánh mật khẩu bằng bcryptjs
    const isPasswordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    // ✅ Sửa thành dùng biến isPasswordValid
    if (!user || !isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
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

const register = async (req, res) => {
  try {
    const { fullName, email, password, heightCm, gender, birthYear } = req.body;

    // Validate cơ bản
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
    }

    // Kiểm tra email đã tồn tại trong database chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email này đã được đăng ký tài khoản khác!' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới (đồng bộ trường passwordHash giống hệt lúc login)
    const newUser = await prisma.user.create({
      data: {
        id: `usr-${uuidv4()}`,
        email,
        passwordHash: hashedPassword,
        fullName,
        heightCm: heightCm ? String(heightCm) : null,
        gender: gender || 'MALE',
        role: 'USER', // Mặc định đăng ký mới là USER
      },
    });

    // Cấp luôn Token đăng nhập tự động
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Export cả 2 hàm ra để route sử dụng
module.exports = { login, register };