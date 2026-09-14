const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const crypto = require('crypto');

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
        id: `usr-${crypto.randomUUID()}`,
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

  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Vui lòng nhập email!' });
      }

      // Kiểm tra email có tồn tại trong DB không
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'Email này không tồn tại trong hệ thống!' });
      }

      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu hoặc cập nhật OTP vào bảng token (Upsert)
      await prisma.password_reset_tokens.upsert({
        where: { email },
        update: { token: otp, created_at: new Date() },
        create: { email, token: otp, created_at: new Date() },
      });

      // Trả về OTP để Frontend hiển thị (hoặc gửi qua email thực tế nếu làm hệ thống thật)
      return res.json({
        success: true,
        message: 'Đã tạo mã OTP thành công!',
        otp: otp, // Trả về để frontend gán vào biến generatedOtpDisplay cho Trí test dễ dàng
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  };
  const resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin!' });
      }

      // Tìm bản ghi OTP trong database
      const resetRecord = await prisma.password_reset_tokens.findUnique({
        where: { email },
      });

      if (!resetRecord || resetRecord.token !== otp) {
        return res.status(400).json({ success: false, error: 'Mã OTP không chính xác!' });
      }

      // Kiểm tra thời hạn 15 phút (15 * 60 * 1000 ms)
      const now = new Date();
      const tokenAge = now - new Date(resetRecord.created_at);
      const fifteenMinutes = 15 * 60 * 1000;

      if (tokenAge > fifteenMinutes) {
        return res.status(400).json({ success: false, error: 'Mã OTP đã hết hạn (quá 15 phút)!' });
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu mới cho user
      await prisma.user.update({
        where: { email },
        data: { passwordHash: hashedPassword },
      });

      // Xóa token sau khi dùng xong
      await prisma.password_reset_tokens.delete({
        where: { email },
      });

      return res.json({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  };
module.exports = { login, register, forgotPassword, resetPassword };