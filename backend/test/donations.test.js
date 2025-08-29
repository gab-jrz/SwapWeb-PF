// Archivo de test para donaciones usando solo ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import Donation from '../src/models/Donation.js';
import User from '../src/models/User.js';
let app;

describe('Donations API', function() {
  let authToken;
  let testUser;

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
    await Donation.deleteMany({});
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
    await Donation.deleteMany({});
    await User.deleteMany({});
  });

  it('debería crear una nueva donación', async function() {
    const donationData = {
      title: 'Donación Test',
      description: 'Descripción de la donación test',
      category: 'Ropa',
      images: ['donation1.jpg'],
      condition: 'Bueno',
      location: 'Ciudad Test',
      pickupMethod: 'Punto de encuentro'
    };

    const res = await chai.request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(donationData);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('title', donationData.title);
    expect(res.body).to.have.property('category', donationData.category);
  });

  it('debería obtener la lista de donaciones', async function() {
    // Crear algunas donaciones de prueba
    await Donation.create([
      {
        title: 'Donación 1',
        description: 'Descripción 1',
        category: 'Ropa',
        images: ['image1.jpg'],
        donor: new mongoose.Types.ObjectId(),
        status: 'available'
      },
      {
        title: 'Donación 2',
        description: 'Descripción 2',
        category: 'Libros',
        images: ['image2.jpg'],
        donor: new mongoose.Types.ObjectId(),
        status: 'available'
      }
    ]);

    const res = await chai.request(app).get('/api/donations');
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(2);
  });

  it('debería obtener una donación por ID', async function() {
    const donation = await Donation.create({
      title: 'Donación Test',
      description: 'Descripción test',
      category: 'Ropa',
      images: ['image1.jpg'],
      donor: new mongoose.Types.ObjectId(),
      status: 'available'
    });

    const res = await chai.request(app).get(`/api/donations/${donation._id}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('title', 'Donación Test');
    expect(res.body).to.have.property('category', 'Ropa');
  });
});
