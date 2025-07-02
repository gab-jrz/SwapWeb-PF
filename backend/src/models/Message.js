import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  de: {
    type: String,
    required: true
  },
  deId: {
    type: String,
    required: true
  },
  paraId: {
    type: String,
    required: true
  },
  paraNombre: {
    type: String,
    required: true
  },
  productoId: String,
  productoTitle: String,
  productoOfrecidoId: Number,
  productoOfrecido: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  condiciones: String,
  imagenNombre: String,
  leidoPor: {
    type: [String],
    default: []
  },
  system: {
    type: Boolean,
    default: false
  },
  confirmaciones: {
    type: [String], // IDs de usuarios que confirmaron el intercambio
    default: []
  },
  completed: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema); 