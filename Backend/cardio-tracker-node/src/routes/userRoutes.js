const express = require('express');
const router = express.Router();
const { getUsers,createUser,updateUser,deleteUser } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// GET /api/users
router.get('/', verifyAdmin, getUsers);
// POST /api/users
router.post('/', verifyAdmin, createUser);
// PUT /api/users/:id
router.put('/:id', verifyToken, updateUser);
// DELETE /api/users/:id
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;