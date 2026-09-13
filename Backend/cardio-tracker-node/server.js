const express = require('express');
const cors = require('cors');
const path = require('path'); // Thêm dòng này để định nghĩa path
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());

// 1. Route kiểm tra server và kết nối Database
app.get('/', async (req, res) => {
  try {
    // Thử truy vấn nhanh bảng users để test kết nối Aiven MySQL
    const userCount = await prisma.user.count();
    res.json({ 
      success: true, 
      message: "Cardio Tracker API (Node.js + Express + Prisma) is running smoothly!",
      databaseStatus: "Connected successfully",
      totalUsers: userCount
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed", 
      error: error.message 
    });
  }
});

// 2. Route mẫu: Lấy danh sách Workouts
app.get('/api/workouts', async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      take: 10, // Lấy 10 bài tập gần nhất
      include: {
        user: {
          select: { fullName: true, email: true }
        },
        workoutPhases: true
      },
      orderBy: {
        workoutStartTime: 'desc'
      }
    });
    res.json({ success: true, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});