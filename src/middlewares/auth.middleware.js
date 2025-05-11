const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    console.log('token', req.headers.authorization);
    
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token faltante' });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    console.log('userId', userId);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    req.user = user;
    
    next();
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
