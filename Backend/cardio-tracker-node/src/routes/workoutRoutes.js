const express = require('express');
const router = express.Router();
const { getWorkouts, createWorkout } = require('../controllers/workoutController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware xác thực token đăng nhập

// Áp dụng middleware xác thực cho tất cả các route bên dưới
router.use(authMiddleware);

router.get('/', getWorkouts);
router.post('/', createWorkout); // 👉 Thêm dòng này để nhận POST request lưu buổi tập

module.exports = router;