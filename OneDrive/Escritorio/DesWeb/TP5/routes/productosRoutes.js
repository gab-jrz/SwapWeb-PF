const express = require("express");
const router = express.Router();
const {
  agregarProducto,
  listarProductos,
} = require("../logic/productosLogic");

// GET /productos → Listar productos
router.get("/", (req, res) => {
  const productos = listarProductos();
  res.json(productos);
});

// POST /productos → Agregar producto
router.post("/", (req, res) => {
  const { nombre } = req.body;

  try {
    agregarProducto(nombre);
    res.status(201).json({ mensaje: "Producto agregado correctamente." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
