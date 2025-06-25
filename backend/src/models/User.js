import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    default: function() {
      return this.nombre.toLowerCase() + this.apellido.toLowerCase();
    }
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
    type: String
  },
  calificacion: {
    type: Number,
    default: 1
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  mensajes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  transacciones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  mostrarContacto: {
    type: Boolean,
    default: true
  },
  zona: {
    type: String,
    default: "Argentina Buenos Aires"
  },
  telefono: {
    type: String,
    default: "011-555-46522"
  },
  ubicacion: {
    type: String,
    default: "Argentina Buenos Aires"
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;