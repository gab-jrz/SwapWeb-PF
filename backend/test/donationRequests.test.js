// Test para donation requests usando ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import DonationRequest from '../src/models/DonationRequest.js';
import Donation from '../src/models/Donation.js';
import User from '../src/models/User.js';
let app;

describe('DonationRequests API', function() {
  let authToken;
  let testUser;
  let testDonation;

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
    await DonationRequest.deleteMany({});
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

    // Crear donación de prueba
    testDonation = await Donation.create({
      title: 'Donación Test',
      description: 'Descripción test',
      category: 'Ropa',
      images: ['test.jpg'],
      donor: new mongoose.Types.ObjectId(),
      status: 'available'
    });
  });

  after(async function() {
    await DonationRequest.deleteMany({});
    await Donation.deleteMany({});
    await User.deleteMany({});
  });

  it('debería obtener la lista de solicitudes de donación', async function() {
    const res = await chai.request(app)
      .get('/api/donation-requests')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  it('debería crear una solicitud de donación básica en la base de datos', async function() {
    const donationRequest = await DonationRequest.create({
      requester: testUser._id,
      category: 'Ropa',
      needDescription: 'Me interesa esta donación urgentemente',
      title: 'Solicitud de ropa de invierno',
      location: 'Buenos Aires',
      urgency: 'med',
      status: 'open'
    });

    expect(donationRequest).to.have.property('needDescription', 'Me interesa esta donación urgentemente');
    expect(donationRequest).to.have.property('status', 'open');
    expect(donationRequest).to.have.property('category', 'Ropa');
    expect(donationRequest.requester.toString()).to.equal(testUser._id.toString());
  });

  it('debería validar que la donación existe', async function() {
    expect(testDonation).to.have.property('title', 'Donación Test');
    expect(testDonation).to.have.property('category', 'Ropa');
    expect(testDonation).to.have.property('status', 'available');
  });

  it('debería autenticar usuario correctamente', async function() {
    expect(authToken).to.exist;
    expect(testUser).to.have.property('email', 'test@example.com');
  });

  it('debería crear múltiples solicitudes para una donación', async function() {
    // Crear segundo usuario
    const userData2 = {
      id: 'testuser456',
      nombre: 'Test2', 
      apellido: 'User2',
      email: 'test2@example.com',
      password: 'password123'
    };

    const registerRes2 = await chai.request(app)
      .post('/api/users/register')
      .send(userData2);

    const testUser2 = await User.findOne({ email: 'test2@example.com' });

    // Crear solicitudes de ambos usuarios
    await DonationRequest.create([
      {
        requester: testUser._id,
        category: 'Ropa',
        needDescription: 'Primera solicitud de ropa',
        title: 'Necesito ropa de invierno',
        location: 'Buenos Aires',
        urgency: 'high',
        status: 'open'
      },
      {
        requester: testUser2._id,
        category: 'Ropa', 
        needDescription: 'Segunda solicitud de ropa',
        title: 'Necesito ropa de verano',
        location: 'Buenos Aires',
        urgency: 'low',
        status: 'open'
      }
    ]);

    const requests = await DonationRequest.find({ category: 'Ropa' });
    
    expect(requests).to.have.lengthOf(2);
    expect(requests[0]).to.have.property('needDescription');
    expect(requests[1]).to.have.property('needDescription');
  });
});
