const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    default: '/images/default.jpg'
  },
  calificacion: {
    type: Number,
    default: 0
  },
  productos: {
    type: [Number],
    default: []
  },
  mensajes: {
    type: Array,
    default: []
  },
  transacciones: {
    type: Array,
    default: []
  },
  mostrarContacto: {
    type: Boolean,
    default: true
  },
  zona: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 