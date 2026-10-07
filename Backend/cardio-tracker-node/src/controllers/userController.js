const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// Lấy danh sách toàn bộ users với các trường thông tin cần thiết
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        targetWeightKg: true,
        targetWaistCm: true,
        waistCm: true,
        hipCm: true,
        bodyFatPercentage: true,
        activityLevel: true,
        workoutEnvironment: true,
        weeklyGoalKg: true,
        createdAt: true,
      },
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Lỗi /api/users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const { 
      email, 
      password, // Nhận thêm password từ body để mã hóa
      fullName, 
      role, 
      gender, 
      heightCm, 
      weightKg, 
      targetWeightKg, 
      targetWaistCm, 
      waistCm, 
      hipCm, 
      bodyFatPercentage, 
      activityLevel, 
      workoutEnvironment, 
      weeklyGoalKg 
    } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: 'Email và họ tên là bắt buộc' });
    }

    // 1. Tự sinh ID (hoặc dùng uuid)
    const userId = 'usr-' + crypto.randomUUID();

    // 2. Mã hóa mật khẩu nếu có truyền vào (nếu không có thì để trống hoặc tạo mật khẩu mặc định)
    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.create({
      data: {
        id: userId,              // 👈 Bắt buộc phải có vì schema không tự sinh ID
        email,
        passwordHash,           // 👈 Lưu chuỗi đã băm thay vì mật khẩu thô
        fullName,
        role: role || 'USER',    // Gán mặc định là USER nếu không truyền
        gender,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        targetWaistCm: targetWaistCm ? parseFloat(targetWaistCm) : null,
        waistCm: waistCm ? parseFloat(waistCm) : null,
        hipCm: hipCm ? parseFloat(hipCm) : null,
        bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
        activityLevel,
        workoutEnvironment,
        weeklyGoalKg: weeklyGoalKg ? parseFloat(weeklyGoalKg) : null
      }
    });

    // Ẩn passwordHash trước khi trả về response cho an toàn
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Lỗi /api/users (Create):", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role; 

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 🔒 Kiểm tra phân quyền: Nếu không phải Admin và đang cố sửa tài khoản của người khác -> Chặn ngay!
    const isAdmin = currentUserRole === 'ADMIN';
    if (!isAdmin && currentUserId !== id) {
      return res.status(403).json({ 
        success: false, 
        error: "Bạn không có quyền chỉnh sửa thông tin của người dùng khác" 
      });
    }

    let updateData = { ...req.body };

    // Nếu không phải admin, ngăn chặn việc tự ý đổi role của chính mình
    if (!isAdmin) {
      delete updateData.role; 
    }

    // 🔑 Xử lý mã hóa mật khẩu nếu có truyền lên trường password để đổi mới
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password; // 👈 Xóa trường 'password' thô để Prisma không bị lỗi Unknown argument
    }

    // 📊 Xử lý chuyển đổi kiểu dữ liệu số (Decimal) sang dạng chuẩn cho Prisma
    if (updateData.heightCm !== undefined) updateData.heightCm = updateData.heightCm ? parseFloat(updateData.heightCm) : null;
    if (updateData.weightKg !== undefined) updateData.weightKg = updateData.weightKg ? parseFloat(updateData.weightKg) : null;
    if (updateData.targetWeightKg !== undefined) updateData.targetWeightKg = updateData.targetWeightKg ? parseFloat(updateData.targetWeightKg) : null;
    if (updateData.targetWaistCm !== undefined) updateData.targetWaistCm = updateData.targetWaistCm ? parseFloat(updateData.targetWaistCm) : null;
    if (updateData.waistCm !== undefined) updateData.waistCm = updateData.waistCm ? parseFloat(updateData.waistCm) : null;
    if (updateData.hipCm !== undefined) updateData.hipCm = updateData.hipCm ? parseFloat(updateData.hipCm) : null;
    if (updateData.bodyFatPercentage !== undefined) updateData.bodyFatPercentage = updateData.bodyFatPercentage ? parseFloat(updateData.bodyFatPercentage) : null;
    if (updateData.weeklyGoalKg !== undefined) updateData.weeklyGoalKg = updateData.weeklyGoalKg ? parseFloat(updateData.weeklyGoalKg) : null;

    // Thực hiện cập nhật trong Database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // 🛡️ Ẩn passwordHash trước khi trả về response cho an toàn
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Lỗi /api/users (Update):", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 🔒 Chỉ cho phép ADMIN hoặc chính chủ mới được xóa tài khoản
    if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
      return res.status(403).json({ 
        success: false, 
        error: "Bạn không có quyền xóa tài khoản này!" 
      });
    }

    const user = await prisma.user.delete({
      where: { id }
    });

    // Ẩn passwordHash trước khi trả về (nếu cần)
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Lỗi /api/users (Delete):", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};