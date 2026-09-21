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
    console.log("DEBUG_LOG: Đang trả về response từ dòng này...");

    res.cookie('token', token, {
      httpOnly: true, // Bảo mật chống XSS
      secure: process.env.NODE_ENV === 'production', // True nếu chạy trên HTTPS (production trên Vercel)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' nếu FE và BE khác domain (Vercel + Render/v.v), 'lax' nếu chạy localhost
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });

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
const register = async (req, res) => {
  try {
    const { fullName, email, password, heightCm, gender, birthYear } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email này đã được đăng ký tài khoản khác!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        id: `usr-${crypto.randomUUID()}`,
        email,
        passwordHash: hashedPassword,
        fullName,
        heightCm: heightCm ? String(heightCm) : null,
        gender: gender || 'MALE',
        role: 'USER',
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Cấu hình HttpOnly Cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
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

    // Cập nhật mật khẩu mới và lấy thông tin user để cấp token tự động (nếu cần)
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });

    // Xóa token sau khi dùng xong
    await prisma.password_reset_tokens.deleteMany({
      where: { email: email },
    });

    // (Tùy chọn) Cấp luôn token đăng nhập tự động sau khi reset thành công
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Cấu hình HttpOnly Cookie giống như login/register
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        gender: updatedUser.gender,
      }
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
    // 🔒 Lấy email trực tiếp từ token đã được decode ở middleware (bảo mật hơn lấy từ req.body)
    const email = req.user && req.user.email;
    const { oldPassword, newPassword } = req.body;

    if (!email) {
      return res.status(401).json({ success: false, error: 'Chưa xác thực người dùng!' });
    }

    if (!oldPassword || !newPassword) {
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
module.exports = { login,logout, register, forgotPassword, resetPassword, changePassword };