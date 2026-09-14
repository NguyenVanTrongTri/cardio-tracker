const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const seedDatabase = async (req, res) => {
  try {
    const INITIAL_ADMIN_USER = {
      id: 'usr-admin-master',
      email: 'admin@cardiotracker.com',
      passwordHash: 'admin123456',
      fullName: 'Quản Trị Viên (Admin)',
      role: 'ADMIN',
      gender: 'MALE',
      heightCm: 175.00,
      birthYear: 1990,
      targetWaistCm: 78.00,
      targetWeightKg: 68.00,
      targetDate: new Date('2026-12-31'),
      createdAt: new Date('2026-01-01T08:00:00Z'),
    };

    const INITIAL_USER = {
      id: 'usr-trongtri',
      email: 'trongtriww1@gmail.com',
      passwordHash: 'password123',
      fullName: 'Nguyễn Minh Trí',
      role: 'USER', 
      gender: 'MALE',
      heightCm: 173.00,
      birthYear: 2004,
      targetWaistCm: 78.00,
      targetWeightKg: 68.00,
      weightKg: 72.00,
      targetDate: new Date('2026-10-31'),
      waistCm: 82.00,
      hipCm: 94.00,
      bodyFatPercentage: 17.50,
      activityLevel: 'ACTIVE',
      workoutEnvironment: 'GYM',
      weeklyGoalKg: -0.50,
      createdAt: new Date('2026-08-01T08:00:00Z'),
    };

    await prisma.user.upsert({ where: { email: INITIAL_ADMIN_USER.email }, update: INITIAL_ADMIN_USER, create: INITIAL_ADMIN_USER });
    await prisma.user.upsert({ where: { email: INITIAL_USER.email }, update: INITIAL_USER, create: INITIAL_USER });

    const workoutId = crypto.randomUUID();
    const workout = await prisma.workout.create({
      data: {
        id: workoutId,
        userId: INITIAL_USER.id,
        equipmentType: 'TREADMILL',
        workoutStartTime: new Date(),
        weightKg: 72.00,
        waistCm: 82.00,
        activeTime: 40,
        calories: 380.00,
        isZone2: true,
        totalDistanceKm: 5.20,
        notes: 'Buổi cardio Zone 2 mẫu đầu tiên của Trí',
        workoutPhases: {
          create: [
            { id: crypto.randomUUID(), phaseNumber: 1, name: 'Warmup', durationMinutes: 10, speedKmh: 6.0, inclineDegree: 1.0, distanceKm: 1.00, isCoreEngaged: false, subType: 'RELIEF' },
            { id: crypto.randomUUID(), phaseNumber: 2, name: 'Main Zone 2', durationMinutes: 30, speedKmh: 8.0, inclineDegree: 1.5, distanceKm: 4.20, isCoreEngaged: true, subType: 'MAIN' }
          ]
        }
      },
      include: { workoutPhases: true }
    });

    res.json({ success: true, message: "Seed thành công toàn bộ dữ liệu mẫu!", data: { workout } });
  } catch (error) {
    console.error("Cloud seed error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { seedDatabase };