const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// GET /api/users
router.get('/', verifyAdmin, getUsers);

module.exports = router;