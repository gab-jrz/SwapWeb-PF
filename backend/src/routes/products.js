import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/multerProducts.js';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// Asegurar que la carpeta de uploads existe
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get all products (with optional owner filter)
router.get('/', async (req, res) => {
  try {
    // Construir filtro basado en query parameters
    let filter = {};
    
    // Si se proporciona owner, filtrar por ownerId
    if (req.query.owner) {
      // Intentar convertir a número si es posible, sino usar como string
      const ownerValue = isNaN(req.query.owner) ? req.query.owner : Number(req.query.owner);
      filter.ownerId = ownerValue;
      console.log(' Filtrando productos por owner:', req.query.owner, '(convertido a:', ownerValue, ')');
    }
    
    console.log(' Filtro aplicado:', filter);
    
    const products = await Product.find(filter)
      .select('-_id -__v')
      .sort({ id: 1 });

    // Enriquecer cada producto con nombre y provincia del owner
    const User = (await import('../models/User.js')).default;
    const enrichedProducts = await Promise.all(products.map(async (prod) => {
      let ownerName = 'Usuario';
      let provincia = 'Sin especificar';
      let ownerId = prod.ownerId;
      try {
        // Buscar usuario por id (puede ser string o number)
        const owner = await User.findOne({ id: String(prod.ownerId) });
        if (owner) {
          ownerName = owner.nombre + (owner.apellido ? ' ' + owner.apellido : '');
          provincia = owner.provincia || 'Sin especificar';
          ownerId = owner.id;
        }
      } catch (e) {
        // Si hay error, dejar valores por defecto
      }
      return {
        ...prod.toObject(),
        ownerName,
        provincia,
        ownerId,
        fechaPublicacion: prod.createdAt
      };
    }));

    console.log(' Productos encontrados:', enrichedProducts.length);
    res.json(enrichedProducts);
  } catch (error) {
    console.error(' Error al obtener productos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) })
      .select('-_id -__v');
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear producto con imágenes (hasta 3)
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    // Manejar imágenes subidas
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => {
        // Ruta relativa para servir desde backend
        return `/uploads/products/${file.filename}`;
      });
    }
    const caracteristicas = req.body.caracteristicas ? JSON.parse(req.body.caracteristicas) : [];
    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      categoria: req.body.categoria,
      images: imagePaths, // ahora es requerido
      ownerId: req.body.ownerId,
      caracteristicas,
      date: req.body.date,
      status: req.body.status
    });
    const newProduct = await product.save();
    const productResponse = newProduct.toObject();
    delete productResponse._id;
    delete productResponse.__v;
    res.status(201).json(productResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create multiple products
router.post('/batch', async (req, res) => {
  try {
    const products = req.body.map(product => ({
      title: product.title,
      description: product.description,
      categoria: product.categoria,
      image: product.image,
      ownerId: product.ownerId
    }));
    
    const newProducts = await Product.insertMany(products);
    const productsResponse = newProducts.map(product => {
      const p = product.toObject();
      delete p._id;
      delete p.__v;
      return p;
    });
    res.status(201).json(productsResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get products by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ ownerId: Number(req.params.userId) })
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (req.body.title) product.title = req.body.title;
    if (req.body.description) product.description = req.body.description;
    if (req.body.categoria) product.categoria = req.body.categoria;
    if (req.body.image) product.image = req.body.image;
    if (req.body.intercambiado !== undefined) product.intercambiado = !!req.body.intercambiado;

    const updatedProduct = await product.save();
    const productResponse = updatedProduct.toObject();
    delete productResponse._id;
    delete productResponse.__v;
    res.json(productResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;