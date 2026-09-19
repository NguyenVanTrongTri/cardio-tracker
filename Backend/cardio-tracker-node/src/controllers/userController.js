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
const getMyProfile = async (req, res) => {
  try {
    // req.user.id đã được giải mã sẵn từ token bên trong HttpOnly Cookie bởi middleware verifyToken
    const userId = req.user.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        gender: true,
        // TUYỆT ĐỐI KHÔNG chọn passwordHash trả về đây
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  getUsers,getMyProfile
};