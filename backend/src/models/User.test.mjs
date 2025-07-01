/* global describe, it, before, after */
import mongoose from "mongoose";
import chai from "chai";
const { expect } = chai;
import User from "./User.js";

describe("User Model", function () {
  before(async function () {
    await mongoose.connect("mongodb://127.0.0.1:27017/test_swapweb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async function () {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  });

  it("debería requerir el campo email", async function () {
    const user = new User({
      id: "1",
      nombre: "Juan",
      apellido: "Perez",
      password: "password123",
    });
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("email");
  });

  it("debería requerir el campo password", async function () {
    const user = new User({
      id: "2",
      nombre: "Maria",
      apellido: "Gomez",
      email: "maria@example.com",
    });
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("password");
  });

  it("debería crear un usuario válido si todos los campos requeridos están presentes", async function () {
    const user = new User({
      id: "3",
      nombre: "Ana",
      apellido: "Lopez",
      email: "ana@example.com",
      password: "password123",
    });
    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.exist;
  });

  it("no debería permitir emails duplicados", async function () {
    const user1 = new User({
      id: "4",
      nombre: "Pedro",
      apellido: "Martinez",
      email: "pedro@example.com",
      password: "password123",
    });
    const user2 = new User({
      id: "5",
      nombre: "Pedro2",
      apellido: "Martinez2",
      email: "pedro@example.com",
      password: "password456",
    });
    await user1.save();
    let error;
    try {
      await user2.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.message).to.include("duplicate key");
  });

  it("debería hashear el password antes de guardar", async function () {
    const plainPassword = "mysecret";
    const user = new User({
      id: "6",
      nombre: "Hash",
      apellido: "Test",
      email: "hash@example.com",
      password: plainPassword,
    });
    await user.save();
    expect(user.password).to.not.equal(plainPassword);
    expect(user.password).to.match(/\$2[aby]\$.{56}/); // bcrypt hash
  });


}

);
