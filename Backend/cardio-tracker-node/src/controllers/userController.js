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

module.exports = {
  getUsers,
};