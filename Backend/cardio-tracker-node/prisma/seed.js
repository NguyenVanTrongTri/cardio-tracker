const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

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
  email: 'trongtriww@gmail.com',
  passwordHash: 'password123',
  fullName: 'Nguyễn Minh Trí',
  role: 'USER', 
  gender: 'MALE',
  heightCm: 173.00,
  birthYear: 1996,
  targetWaistCm: 80.00,
  targetWeightKg: 67.00,
  targetDate: new Date('2026-10-31'),
  createdAt: new Date('2026-08-01T08:00:00Z'),
};

async function main() {
  console.log('🌱 Đang tiến hành seed 2 tài khoản và workout mẫu...');

  // Upsert Admin
  await prisma.user.upsert({
    where: { email: INITIAL_ADMIN_USER.email },
    update: INITIAL_ADMIN_USER,
    create: INITIAL_ADMIN_USER,
  });

  // Upsert User
  await prisma.user.upsert({
    where: { email: INITIAL_USER.email },
    update: INITIAL_USER,
    create: INITIAL_USER,
  });

  // Tạo workout mẫu cho tài khoản Trí
  const workoutId = crypto.randomUUID();
  await prisma.workout.create({
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
      notes: 'Buổi cardio Zone 2 mẫu đầu tiên của Trí',
      workoutPhases: {
        create: [
          {
            id: crypto.randomUUID(),
            phaseNumber: 1,
            name: 'Warmup',
            durationMinutes: 10,
            speedKmh: 6.0,
            inclineDegree: 1.0,
            distanceKm: 1.0,
          },
          {
            id: crypto.randomUUID(),
            phaseNumber: 2,
            name: 'Main Zone 2',
            durationMinutes: 30,
            speedKmh: 8.0,
            inclineDegree: 1.5,
            distanceKm: 4.20,
          }
        ]
      }
    }
  });

  console.log('✅ Seed dữ liệu lên Aiven MySQL thành công!');
}
// Endpoint lấy danh sách users
app.get('/api/users', async (req, res) => {
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
        createdAt: true,
      },
    });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });