import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import process from 'process';
import ratingsRoutes from './routes/ratings.js';
import setupStatic from './static.js';

// Load environment variables
dotenv.config();

const app = express();
const port = (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:5173',
    'http://localhost:4173', // Vite preview port
    'http://127.0.0.1:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos de uploads
setupStatic(app);

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
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import swapRoutes from './routes/swaps.js';
import messageRoutes from './routes/messages.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import notificationRoutes from './routes/notifications.js';

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/notifications', notificationRoutes);

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

export default app; 