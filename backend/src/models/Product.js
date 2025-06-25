import mongoose from 'mongoose';
<<<<<<< HEAD
=======

>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  intercambiado: {
    type: Boolean,
    default: false
  },
  categoria: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  ownerId: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Middleware pre-save para asignar ID automáticamente
productSchema.pre('save', async function(next) {
  if (!this.id) {
    const lastProduct = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
    this.id = lastProduct ? lastProduct.id + 1 : 1;
  }
  next();
});

export default mongoose.model('Product', productSchema);