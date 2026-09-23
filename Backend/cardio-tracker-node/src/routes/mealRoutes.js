const express = require('express');
const router = express.Router();
const { getMeals, createMeal, updateMeal, deleteMeal } = require('../controllers/mealController');

// Middleware xác thực token
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getMeals);
router.post('/', verifyToken, createMeal);
router.put('/:id', verifyToken, updateMeal);
router.delete('/:id', verifyToken, deleteMeal);

module.exports = router;