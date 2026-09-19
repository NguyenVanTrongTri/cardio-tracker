const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Import các routes từ thư mục src/routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
console.log("Check workoutRoutes:", typeof workoutRoutes);
const seedRoutes = require('./src/routes/seedRoutes');
const practiceRoutes = require('./src/routes/practiceRoutes');

// Cấu hình CORS chuẩn
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

// Root test route
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

// Mount các API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/practices', practiceRoutes);

// Chỉ listen khi chạy dev local (tránh conflict serverless của Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy port ${PORT}`);
  });
}

module.exports = app;