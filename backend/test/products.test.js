// Archivo de test para productos usando solo ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
let app;

describe('Products API', function() {
  let authToken;
  let testUser;

  before(async function() {
    // Configurar puerto diferente para tests
    process.env.PORT = 3002;
    
    // Importar app dinámicamente (ESM)
    app = (await import('../src/index.js')).default;
    // Conectar a la base de datos de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/swapweb_test');
    }
  });

  beforeEach(async function() {
    // Limpiar colecciones antes de cada test
    await Product.deleteMany({});
    await User.deleteMany({});

    // Crear usuario de prueba y obtener token
    const userData = {
      id: 'testuser123',
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerRes = await chai.request(app)
      .post('/api/users/register')
      .send(userData);

    testUser = registerRes.body.user;

    const loginRes = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;
  });

  after(async function() {
    await Product.deleteMany({});
    await User.deleteMany({});
  });

  it('debería crear un nuevo producto', async function() {
    const productData = {
      title: 'Producto Test',
      description: 'Descripción del producto test',
      categoria: 'Electrónicos',
      images: ['image1.jpg', 'image2.jpg'],
      ownerId: testUser.id
    };

    const res = await chai.request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(productData);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('title', productData.title);
    expect(res.body).to.have.property('categoria', productData.categoria);
  });

  it('debería obtener la lista de productos', async function() {
    // Crear algunos productos de prueba con IDs específicos para evitar duplicados
    const product1 = new Product({
      title: 'Producto 1',
      description: 'Descripción 1',
      categoria: 'Electrónicos',
      images: ['image1.jpg'],
      ownerId: testUser.id
    });
    product1.id = 100; // Asignar ID específico
    await product1.save();

    const product2 = new Product({
      title: 'Producto 2',
      description: 'Descripción 2',
      categoria: 'Ropa',
      images: ['image2.jpg'],
      ownerId: testUser.id
    });
    product2.id = 101; // Asignar ID específico
    await product2.save();

    const res = await chai.request(app).get('/api/products');
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(2);
  });

  it('debería obtener un producto por ID', async function() {
    const product = await Product.create({
      title: 'Producto Test',
      description: 'Descripción test',
      categoria: 'Electrónicos',
      images: ['image1.jpg'],
      ownerId: testUser.id
    });

    const res = await chai.request(app).get(`/api/products/${product.id}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('title', 'Producto Test');
    expect(res.body).to.have.property('categoria', 'Electrónicos');
  });

  it('debería filtrar productos por categoría', async function() {
    // Crear productos con IDs específicos
    const laptop = new Product({
      title: 'Laptop',
      description: 'Laptop gaming',
      categoria: 'Electrónicos',
      images: ['laptop.jpg'],
      ownerId: testUser.id
    });
    laptop.id = 200;
    await laptop.save();

    const camisa = new Product({
      title: 'Camisa',
      description: 'Camisa casual',
      categoria: 'Ropa',
      images: ['camisa.jpg'],
      ownerId: testUser.id
    });
    camisa.id = 201;
    await camisa.save();

    const res = await chai.request(app).get('/api/products?categoria=Electrónicos');
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0]).to.have.property('categoria', 'Electrónicos');
  });
});
