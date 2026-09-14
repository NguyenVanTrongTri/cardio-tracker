const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/register', register);

router.get('/test', (req, res) => {
  res.json({ success: true, message: "Auth route is working!" });
});

module.exports = router;