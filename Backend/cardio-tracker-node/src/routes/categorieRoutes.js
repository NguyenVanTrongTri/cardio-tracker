const express = require('express');
const router = express.Router();
const { getCateLog,createCateLog,updateCateLog,deleteCateLog } = require('../controllers/categorieController.js');

// Middleware xác thực token
const { verifyToken } = require('../middlewares/authMiddleware');


router.get('/', verifyToken, getCateLog);
router.post('/', verifyToken, createCateLog);
router.put('/:id', verifyToken, updateCateLog);
router.delete('/:id', verifyToken, deleteCateLog);

module.exports=router;