import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

const router = express.Router();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Get all users (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Filtrar transacciones eliminadas
    if (Array.isArray(user.transacciones)) {
      user.transacciones = user.transacciones.filter(t => !t.deleted);
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = new User({
      id: req.body.id,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      imagen: req.body.imagen,
      zona: req.body.zona
    });

    const newUser = await user.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Generar token JWT
    const token = jwt.sign(
      { id: userResponse.id, email: userResponse.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    // Generar token JWT
    const token = jwt.sign(
      { id: userResponse.id, email: userResponse.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updateFields = [
      'nombre', 'apellido', 'username', 'email', 'password',
      'imagen', 'zona', 'telefono', 'mostrarContacto', 'transacciones'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        console.log(`[Backend] Actualizando campo ${field}:`, req.body[field]);
        if (field === 'mostrarContacto') {
          // Asegurar booleano real (maneja "false" string)
          user[field] = req.body[field] === true || req.body[field] === 'true';
        } else {
          user[field] = req.body[field];
          if (field === 'transacciones') {
            user.markModified('transacciones');
          }
        }
      }
    });
    
    console.log('[Backend] Usuario antes de guardar:', {
      zona: user.zona,
      telefono: user.telefono,
      email: user.email
    });

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await user.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 