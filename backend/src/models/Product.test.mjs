/* global describe, it, before, after */
import mongoose from "mongoose";
import chai from "chai";
const { expect } = chai;
import Product from "./Product.js";

describe("Product Model", function () {
  before(async function () {
    await mongoose.connect("mongodb://127.0.0.1:27017/test_swapweb");
  });

  after(async function () {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  });

  it("debería requerir el campo title", async function () {
    const product = new Product({
      description: "desc",
      categoria: "cat",
      image: "img.jpg",
      ownerId: 1,
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("title");
  });

  it("debería requerir el campo description", async function () {
    const product = new Product({
      title: "Producto",
      categoria: "cat",
      image: "img.jpg",
      ownerId: 1,
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("description");
  });

  it("debería requerir el campo categoria", async function () {
    const product = new Product({
      title: "Producto",
      description: "desc",
      image: "img.jpg",
      ownerId: 1,
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("categoria");
  });

  it("debería requerir el campo image", async function () {
    const product = new Product({
      title: "Producto",
      description: "desc",
      categoria: "cat",
      ownerId: 1,
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("image");
  });

  it("debería requerir el campo ownerId", async function () {
    const product = new Product({
      title: "Producto",
      description: "desc",
      categoria: "cat",
      image: "img.jpg",
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("ownerId");
  });

  it("debería crear un producto válido si todos los campos requeridos están presentes", async function () {
    const product = new Product({
      title: "Producto",
      description: "desc",
      categoria: "cat",
      image: "img.jpg",
      ownerId: 1,
    });
    let error;
    try {
      await product.validate();
    } catch (err) {
      error = err;
    }
    expect(error).to.not.exist;
  });
});
