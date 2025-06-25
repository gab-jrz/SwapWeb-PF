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
  productoOfrecido: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  condiciones: String,
  imagenNombre: String
}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema); 