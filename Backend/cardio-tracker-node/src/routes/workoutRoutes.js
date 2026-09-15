const express = require('express');
const router = express.Router();
const { getWorkouts, createWorkout } = require('../controllers/workoutController');

// Đảm bảo bạn đã có middleware xác thực token (kiểm tra lại đường dẫn thực tế trong dự án của bạn)
const { verifyToken } = require('../middlewares/authMiddleware'); 

// Kiểm tra log xem các hàm đã import đúng chưa
console.log("Check getWorkouts function:", typeof getWorkouts);
console.log("Check createWorkout function:", typeof createWorkout);

// 1. Route lấy danh sách buổi tập
router.get('/', getWorkouts);

// 2. Route tạo buổi tập mới (Bắt buộc phải qua verifyToken để có req.user.id)
router.post('/', verifyToken, createWorkout);

module.exports = router;