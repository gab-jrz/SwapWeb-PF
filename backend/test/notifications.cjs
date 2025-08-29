// Archivo de test para notificaciones usando CommonJS

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const mongoose = require('mongoose');
const Notification = require('../src/models/Notification.js');
let app;

describe('Notifications API', function() {
  before(async function() {
    // Importar app dinámicamente (CommonJS)
    app = require('../src/index.js');
    // Conectar a la base de datos de test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/swapweb_test');
    }
  });

  beforeEach(async function() {
    // Limpiar notificaciones antes de cada test
    await Notification.deleteMany({});
  });

  after(async function() {
    await mongoose.disconnect();
  });

  it('debería crear una notificación y recuperarla por usuario', async function() {
    const notif = new Notification({
      userId: 'user123',
      type: 'mensaje_directo',
      title: 'Nuevo mensaje',
      message: 'Tienes un nuevo mensaje',
      data: { foo: 'bar' },
      priority: 'medium'
    });
    await notif.save();

    const res = await chai.request(app).get('/notifications/user123');
    expect(res).to.have.status(200);
    expect(res.body.notifications).to.be.an('array').with.lengthOf(1);
    expect(res.body.notifications[0]).to.include({ userId: 'user123', type: 'mensaje_directo' });
  });

  it('debería filtrar solo no leídas', async function() {
    await Notification.create([
      { userId: 'user123', type: 'mensaje_directo', title: 'A', message: 'A', read: false },
      { userId: 'user123', type: 'mensaje_directo', title: 'B', message: 'B', read: true }
    ]);
    const res = await chai.request(app).get('/notifications/user123?unreadOnly=true');
    expect(res.body.notifications).to.have.lengthOf(1);
    expect(res.body.notifications[0].read).to.be.false;
  });

  it('debería paginar resultados', async function() {
    for (let i = 0; i < 25; i++) {
      await Notification.create({ userId: 'user123', type: 'mensaje_directo', title: 'T', message: 'M' });
    }
    const res = await chai.request(app).get('/notifications/user123?page=2&limit=10');
    expect(res.body.notifications).to.have.lengthOf(10);
    expect(res.body.pagination.current).to.equal('2');
    expect(res.body.pagination.total).to.be.greaterThan(2);
  });

  it('debería devolver el conteo de no leídas', async function() {
    await Notification.create([
      { userId: 'user123', type: 'mensaje_directo', title: 'A', message: 'A', read: false },
      { userId: 'user123', type: 'mensaje_directo', title: 'B', message: 'B', read: false },
      { userId: 'user123', type: 'mensaje_directo', title: 'C', message: 'C', read: true }
    ]);
    const res = await chai.request(app).get('/notifications/user123');
    expect(res.body.unreadCount).to.equal(2);
  });

  it('debería manejar errores de servidor', async function() {
    // Simular error forzando un userId inválido
    const res = await chai.request(app).get('/notifications/');
    expect(res).to.have.status(404);
  });
});
