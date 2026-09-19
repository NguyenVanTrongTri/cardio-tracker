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
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng nhập đầy đủ email và mật khẩu' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // So sánh mật khẩu bằng bcryptjs
    const isPasswordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Cấu hình HttpOnly Cookie để bảo mật token tuyệt đối (chống XSS)
    res.cookie('token', token, {
      httpOnly: true, // Ngăn chặn hoàn toàn JavaScript phía client đọc cookie
      secure: process.env.NODE_ENV === 'production', // Bắt buộc chạy HTTPS trên production (Vercel)
      sameSite: 'none', // Bắt buộc là 'none' khi Frontend và Backend nằm ở 2 tên miền Vercel khác nhau
      maxAge: 24 * 60 * 60 * 1000 // Hạn sử dụng: 1 ngày (tính bằng mili-giây)
    });

    // Trả về response thành công (Đã loại bỏ token khỏi body để tăng bảo mật, loại bỏ id bị lặp)
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
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

    // Xóa token sau khi dùng xong (Đã sửa userEmail thành email)
    await prisma.password_reset_tokens.deleteMany({
      where: { email: email },
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
const changePassword = async (req, res) => {
  try {
    // Nhận vào email (hoặc lấy từ JWT middleware), mật khẩu cũ và mật khẩu mới
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ thông tin!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
    }

    // Tìm user trong database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng.' });
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Mật khẩu hiện tại không chính xác!' });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật vào DB
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedNewPassword },
    });

    return res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = { login, register, forgotPassword, resetPassword, changePassword };