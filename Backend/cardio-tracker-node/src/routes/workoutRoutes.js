const express = require('express');
const router = express.Router();

const {  getPractices, createPractice, updatePractice,deletePractice } = require('../controllers/practiceController');

const { verifyToken } = require('../middlewares/authMiddleware'); 

// 🔒 Thêm verifyToken vào đây để đồng bộ với cơ chế HttpOnly Cookie
router.get('/', verifyToken, getPractices); 
router.post('/', verifyToken, createPractice);       
router.put('/:id', verifyToken, updatePractice);  
router.delete('/:id', verifyToken, deletePractice); // Thêm luôn nếu có xóa

module.exports = router;