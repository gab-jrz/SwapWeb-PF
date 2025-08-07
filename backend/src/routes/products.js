import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoria = req.query.categoria || '';
    const skip = (page - 1) * limit;

    // Construir filtros
    let filter = {};
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    if (categoria) {
      filter.categoria = { $regex: categoria, $options: 'i' };
    }

    // Obtener productos con paginación y filtros
    const products = await Product.find(filter)
      .select('-_id -__v')
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit);

    // Obtener el total de productos para calcular el total de páginas
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
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

// Create product
router.post('/', async (req, res) => {
  const product = new Product({
    title: req.body.title,
    description: req.body.description,
    categoria: req.body.categoria,
    image: req.body.image,
    ownerId: req.body.ownerId
  });

  try {
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