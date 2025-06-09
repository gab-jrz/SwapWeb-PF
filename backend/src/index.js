const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Morgan logger
app.use(morgan('dev')); // Logs HTTP requests

// Setup Mongoose debug mode for detailed database operations
mongoose.set('debug', true);

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
};

// MongoDB connection with enhanced logging
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    console.log('📊 Base de datos lista para operaciones');
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:');
    console.error('   Detalles:', error.message);
    console.error('   Código:', error.code || 'N/A');
  });

// Monitor database events
mongoose.connection.on('error', (err) => {
  console.error('🔴 Error en la conexión de MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔸 Desconectado de MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Reconectado a MongoDB');
});

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const swapRoutes = require('./routes/swaps');
const messageRoutes = require('./routes/messages');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Servidor iniciado en el puerto ${port}`);
  console.log(`🌐 API disponible en http://localhost:${port}`);
}); 