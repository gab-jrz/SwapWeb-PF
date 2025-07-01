/* global describe, it, before, after */
import mongoose from "mongoose";
import chai from "chai";
const { expect } = chai;
import Swap from "./Swap.js";

const fakeId = () => new mongoose.Types.ObjectId();

describe("Swap Model", function () {
  before(async function () {
    await mongoose.connect("mongodb://127.0.0.1:27017/test_swapweb");
  });

  after(async function () {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  });

  it("debería requerir itemOffered", async function () {
    const swap = new Swap({
      itemRequested: fakeId(),
      offerUser: fakeId(),
      requestUser: fakeId(),
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("itemOffered");
  });

  it("debería requerir itemRequested", async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      offerUser: fakeId(),
      requestUser: fakeId(),
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("itemRequested");
  });

  it("debería requerir offerUser", async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      itemRequested: fakeId(),
      requestUser: fakeId(),
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("offerUser");
  });

  it("debería requerir requestUser", async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      itemRequested: fakeId(),
      offerUser: fakeId(),
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("requestUser");
  });

  it('debería asignar status "pendiente" por defecto', async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      itemRequested: fakeId(),
      offerUser: fakeId(),
      requestUser: fakeId(),
    });
    await swap.validate();
    expect(swap.status).to.equal("pendiente");
  });

  it("debería rechazar un status inválido", async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      itemRequested: fakeId(),
      offerUser: fakeId(),
      requestUser: fakeId(),
      status: "invalido",
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("status");
  });

  it("debería crear una propuesta válida si todos los campos requeridos están presentes", async function () {
    const swap = new Swap({
      itemOffered: fakeId(),
      itemRequested: fakeId(),
      offerUser: fakeId(),
      requestUser: fakeId(),
      status: "pendiente",
    });
    let error;
    try {
      await swap.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.exist;
  });
});
