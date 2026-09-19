const express = require('express');
const router = express.Router();

// Import các hàm controller từ workoutController
const { 
  getPractices, 
  createPractice, 
  updatePractice 
} = require('../controllers/practiceController');

// Định nghĩa các đường dẫn API cho practices
router.get('/', getPractices);           // Lấy danh sách bài tập (có hỗ trợ ?onlyEnabled=true)
router.post('/', createPractice);        // Thêm mới bài tập
router.put('/:id', updatePractice);     // Cập nhật thông tin/trạng thái bài tập theo ID

module.exports = router;