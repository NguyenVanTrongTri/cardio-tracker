const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// GET /api/users
router.get('/', verifyAdmin, getUsers);
router.get('/me', verifyToken, getMyProfile);

module.exports = router;