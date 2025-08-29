// Archivo de test para usuarios usando solo ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import User from '../src/models/User.js';
let app;
let authToken;

describe('Users API', function() {
  before(async function() {
    // Importar app dinámicamente (ESM)
    app = (await import('../src/index.js')).default;
    // Conectar a la base de datos de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/swapweb_test');
    }

    // Crear usuario real si no existe
    const existingUser = await User.findOne({ email: 'carigmer28@gmail.com' });
    if (!existingUser) {
      const testUser = new User({
        id: 'carigmer28',
        nombre: 'Cari',
        apellido: 'Gmer',
        username: 'carigmer28',
        email: 'carigmer28@gmail.com',
        password: '1234',
        zona: 'Buenos Aires',
        telefono: '011-555-12345'
      });
      await testUser.save();
    }

    // Hacer login con el usuario real para obtener token
    const loginRes = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'carigmer28@gmail.com',
        password: '1234'
      });
    
    if (loginRes.status === 200) {
      authToken = loginRes.body.token;
    }
  });

  after(async function() {
    await mongoose.disconnect();
  });

  it('debería hacer login con el usuario real', async function() {
    const res = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'carigmer28@gmail.com',
        password: '1234'
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email', 'carigmer28@gmail.com');
  });

  it('debería obtener la lista de usuarios con autenticación', async function() {
    if (!authToken) {
      this.skip();
      return;
    }

    const res = await chai.request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.be.greaterThan(0);
  });

  it('debería obtener un usuario por ID', async function() {
    // Primero obtener el usuario real para tener su ID
    const user = await User.findOne({ email: 'carigmer28@gmail.com' });
    if (!user) {
      this.skip();
      return;
    }

    const res = await chai.request(app).get(`/api/users/${user._id}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('email', 'carigmer28@gmail.com');
  });

  it('debería crear un nuevo usuario de prueba', async function() {
    const userData = {
      id: 'testuser' + Date.now(),
      nombre: 'Test',
      apellido: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      telefono: '1234567890'
    };

    const res = await chai.request(app)
      .post('/api/users/register')
      .send(userData);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email', userData.email);

    // Limpiar el usuario creado
    await User.deleteOne({ email: userData.email });
  });

  it('debería rechazar registro con email duplicado', async function() {
    const userData = {
      id: 'testuser' + Date.now(),
      nombre: 'Test',
      apellido: 'User',
      email: 'carigmer28@gmail.com', // Email que ya existe
      password: 'password123',
      telefono: '1234567890'
    };

    const res = await chai.request(app)
      .post('/api/users/register')
      .send(userData);

    expect(res).to.have.status(409);
    expect(res.body).to.have.property('error');
  });

  it('debería rechazar login con contraseña incorrecta', async function() {
    const res = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'carigmer28@gmail.com',
        password: 'wrongpassword'
      });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('message');
  });
});
