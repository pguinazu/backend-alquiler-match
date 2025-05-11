const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    console.log('req', req.body);
    
    const { name, email, password, userType, address, phone } = req.body;

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) return res.status(400).json({ mensaje: 'Ya existe un usuario con ese email' });

    const hash = await bcrypt.hash(password, 10);
    const nuevoUser = new User({ name, email, password: hash, userType, address, phone });
    await nuevoUser.save();

    res.status(201).json({ mensaje: 'User creado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar', error: err.message }); 
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
};

module.exports = { register, login };
