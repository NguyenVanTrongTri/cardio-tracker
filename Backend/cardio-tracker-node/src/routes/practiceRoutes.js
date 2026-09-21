const express = require('express');
const router = express.Router();

// 1. Sửa lại comment cho đúng controller
const { 
  getPractices, 
  createPractice, 
  updatePractice,
  deletePractice // Thêm hàm xóa nếu controller có hỗ trợ
} = require('../controllers/practiceController');

// 2. Import middleware xác thực token
const { verifyToken } = require('../middlewares/authMiddleware'); 

// Định nghĩa các đường dẫn API cho practices
// (Lưu ý: router.get có thể không cần verifyToken nếu muốn cho user chưa đăng nhập xem danh sách bài tập, 
// hoặc thêm vào nếu bắt buộc phải đăng nhập mới được xem)
router.get('/', getPractices); 

// Các route quản lý của Admin (Bắt buộc phải có verifyToken để bảo mật)
router.post('/', verifyToken, createPractice);         // Thêm mới bài tập
router.put('/:id', verifyToken, updatePractice);     // Cập nhật bài tập theo ID
// router.delete('/:id', verifyToken, deletePractice); // Xóa bài tập (nếu cần)

module.exports = router;