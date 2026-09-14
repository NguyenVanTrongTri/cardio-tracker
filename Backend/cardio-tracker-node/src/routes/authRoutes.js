const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);

router.get('/test', (req, res) => {
  res.json({ success: true, message: "Auth route is working!" });
});

module.exports = router;