const express = require('express');
const router = express.Router();
const { getWorkouts } = require('../controllers/workoutController');
console.log("Check getWorkouts function:", typeof getWorkouts);
router.get('/', getWorkouts);

module.exports = router;