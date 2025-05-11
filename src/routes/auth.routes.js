const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);

// Ruta protegida para obtener el perfil actual
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.usuario);
});

module.exports = router;
