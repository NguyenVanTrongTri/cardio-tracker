const express = require('express');
const router = express.Router();
const { getWorkouts, createWorkout, deleteWorkout } = require('../controllers/workoutController');

// Middleware xác thực token
const { verifyToken } = require('../middlewares/authMiddleware'); 

// 1. Route lấy danh sách buổi tập
router.get('/', verifyToken, getWorkouts);

// 2. Route tạo buổi tập mới
router.post('/', verifyToken, createWorkout);

// 3. Route xóa buổi tập (Đã sửa lại không bị lặp chữ /api/workouts)
router.delete('/:id', verifyToken, deleteWorkout);

module.exports = router;