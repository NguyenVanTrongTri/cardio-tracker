const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    // Nếu không phải admin, ngăn chặn việc tự ý đổi role của chính mình
    let updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.role; // User thường không được tự đổi role
    }

    // Xử lý chuyển đổi kiểu dữ liệu số nếu cần (ví dụ Decimal/Int)
    if (updateData.heightCm) updateData.heightCm = parseFloat(updateData.heightCm);
    if (updateData.weightKg) updateData.weightKg = parseFloat(updateData.weightKg);
    // ... (tương tự cho các trường số khác nếu có gửi lên)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Ẩn mật khẩu trước khi trả về
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Lỗi /api/users (Update):", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default updateUser;
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    // 🔒 Lấy userId từ middleware xác thực
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Lỗi /api/users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};