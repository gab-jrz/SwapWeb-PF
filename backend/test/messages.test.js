// Test para messages usando ES Modules

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const expect = chai.expect;

import mongoose from 'mongoose';
import Message from '../src/models/Message.js';
import User from '../src/models/User.js';
let app;

describe('Messages API', function() {
  let authToken;
  let testUser;
  let testUser2;

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
    await Message.deleteMany({});
    await User.deleteMany({});

    // Crear primer usuario de prueba
    const userData1 = {
      id: 'testuser123',
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerRes1 = await chai.request(app)
      .post('/api/users/register')
      .send(userData1);

    testUser = registerRes1.body.user;

    const loginRes = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;

    // Crear segundo usuario de prueba
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

    testUser2 = registerRes2.body.user;
  });

  after(async function() {
    await Message.deleteMany({});
    await User.deleteMany({});
  });

  it('debería obtener la lista de mensajes', async function() {
    const res = await chai.request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  it('debería crear un mensaje básico directamente en la base de datos', async function() {
    const message = await Message.create({
      de: testUser.nombre + ' ' + testUser.apellido,
      deId: testUser.id,
      paraId: testUser2.id,
      paraNombre: testUser2.nombre + ' ' + testUser2.apellido,
      productoOfrecido: 'Producto de intercambio',
      tipoPeticion: 'mensaje',
      descripcion: 'Mensaje de prueba'
    });

    expect(message).to.have.property('descripcion', 'Mensaje de prueba');
    expect(message).to.have.property('deId', testUser.id);
    expect(message).to.have.property('paraId', testUser2.id);
    expect(message).to.have.property('tipoPeticion', 'mensaje');
  });

  it('debería validar que los usuarios existen', async function() {
    expect(testUser).to.have.property('email', 'test@example.com');
    expect(testUser2).to.have.property('email', 'test2@example.com');
    expect(testUser.id).to.not.equal(testUser2.id);
  });

  it('debería autenticar usuario correctamente', async function() {
    expect(authToken).to.exist;
    expect(testUser).to.have.property('email', 'test@example.com');
  });

  it('debería crear conversación entre usuarios', async function() {
    // Crear varios mensajes entre usuarios
    await Message.create([
      {
        de: testUser.nombre + ' ' + testUser.apellido,
        deId: testUser.id,
        paraId: testUser2.id,
        paraNombre: testUser2.nombre + ' ' + testUser2.apellido,
        productoOfrecido: 'Producto conversación 1',
        tipoPeticion: 'mensaje',
        descripcion: 'Hola, ¿cómo estás?'
      },
      {
        de: testUser2.nombre + ' ' + testUser2.apellido,
        deId: testUser2.id,
        paraId: testUser.id,
        paraNombre: testUser.nombre + ' ' + testUser.apellido,
        productoOfrecido: 'Producto conversación 2',
        tipoPeticion: 'mensaje',
        descripcion: 'Muy bien, gracias'
      }
    ]);

    const messages = await Message.find({
      $or: [
        { deId: testUser.id, paraId: testUser2.id },
        { deId: testUser2.id, paraId: testUser.id }
      ]
    });

    expect(messages).to.have.lengthOf(2);
    expect(messages[0]).to.have.property('descripcion');
    expect(messages[1]).to.have.property('descripcion');
  });
});
