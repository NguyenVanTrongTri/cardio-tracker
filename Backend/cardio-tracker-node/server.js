const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Cấu hình CORS chuẩn (chỉ gọi 1 lần duy nhất)
app.use(cors({
  origin: [
    'https://cardio-tracker-iota.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ 
      success: true, 
      message: "Cardio Tracker API is running smoothly!",
      totalUsers: userCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Users route
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
});

// Auth Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    res.json({
      success: true,
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
});

// Workouts route
app.get('/api/workouts', async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      take: 10,
      include: {
        user: { select: { fullName: true, email: true } },
        workoutPhases: true,
        meals: { include: { foodItems: true } }
      },
      orderBy: { workoutStartTime: 'desc' }
    });
    res.json({ success: true, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed route
app.post('/api/seed', async (req, res) => {
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
});

// Chỉ listen khi chạy dev local (tránh conflict serverless của Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy port ${PORT}`);
  });
}
app.options('*', cors({
  origin: [
    'https://cardio-tracker-iota.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

module.exports = app;

