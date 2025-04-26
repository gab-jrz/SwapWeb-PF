const { guardarProducto, obtenerProductos } = require("../data/productosData");
const { sanitizarTexto } = require("../utils/sanitizarTexto");

function agregarProducto(nombre) {
  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    throw new Error("Nombre inválido.");
  }

  const nombreLimpio = sanitizarTexto(nombre);

  const producto = {
    id: obtenerProductos().length + 1,
    nombre: nombreLimpio,
  };

  guardarProducto(producto);
}

function listarProductos() {
  return obtenerProductos();
}

module.exports = { agregarProducto, listarProductos };