const express = require('express');
const router = express.Router();

const { 
  getPractices, 
  createPractice, 
  updatePractice,
  deletePractice 
} = require('../controllers/practiceController');

const { verifyToken } = require('../middlewares/authMiddleware'); 

router.get('/', getPractices); 
router.post('/', verifyToken, createPractice);       
router.put('/:id', verifyToken, updatePractice);  

module.exports = router;