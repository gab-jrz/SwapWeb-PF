// Test para swaps usando ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import Swap from '../src/models/Swap.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
let app;

describe('Swaps API', function() {
  let authToken;
  let testUser;
  let testProduct1;
  let testProduct2;

  before(async function() {
    // Importar app dinámicamente (ESM)
    app = (await import('../src/index.js')).default;
    // Conectar a la base de datos de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/swapweb_test');
    }
  });

  beforeEach(async function() {
    // Limpiar colecciones antes de cada test
    await Swap.deleteMany({});
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

    // Crear productos de prueba
    testProduct1 = await Product.create({
      title: 'Producto 1',
      description: 'Descripción 1',
      categoria: 'Electrónicos',
      images: ['image1.jpg'],
      ownerId: testUser.id
    });

    testProduct2 = await Product.create({
      title: 'Producto 2', 
      description: 'Descripción 2',
      categoria: 'Ropa',
      images: ['image2.jpg'],
      ownerId: testUser.id
    });
  });

  after(async function() {
    await Swap.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
  });

  it('debería obtener la lista de swaps', async function() {
    const res = await chai.request(app)
      .get('/api/swaps')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  it('debería crear un swap básico directamente en la base de datos', async function() {
    const swap = await Swap.create({
      itemOffered: testProduct1._id,
      itemRequested: testProduct2._id,
      offerUser: testUser._id,
      requestUser: testUser._id,
      status: 'pendiente'
    });

    expect(swap).to.have.property('status', 'pendiente');
    expect(swap.itemOffered.toString()).to.equal(testProduct1._id.toString());
    expect(swap.itemRequested.toString()).to.equal(testProduct2._id.toString());
    expect(swap.offerUser.toString()).to.equal(testUser._id.toString());
    expect(swap.requestUser.toString()).to.equal(testUser._id.toString());
  });

  it('debería validar que los productos existen', async function() {
    expect(testProduct1).to.have.property('title', 'Producto 1');
    expect(testProduct2).to.have.property('title', 'Producto 2');
    expect(testProduct1.ownerId).to.equal(testUser.id);
    expect(testProduct2.ownerId).to.equal(testUser.id);
  });

  it('debería autenticar usuario correctamente', async function() {
    expect(authToken).to.exist;
    expect(testUser).to.have.property('email', 'test@example.com');
  });
});
