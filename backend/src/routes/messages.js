const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ paraId: req.params.userId })
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  const message = new Message({
    de: req.body.de,
    deId: req.body.deId,
    paraId: req.body.paraId,
    paraNombre: req.body.paraNombre,
    productoId: req.body.productoId,
    productoTitle: req.body.productoTitle,
    productoOfrecido: req.body.productoOfrecido,
    descripcion: req.body.descripcion,
    condiciones: req.body.condiciones,
    imagenNombre: req.body.imagenNombre
  });

  try {
    const newMessage = await message.save();
    const messageResponse = newMessage.toObject();
    delete messageResponse.__v;
    res.status(201).json(messageResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 