const productos = [];

function guardarProducto(producto) {
  productos.push(producto);
}

function obtenerProductos() {
  return [...productos];
}

module.exports = { guardarProducto, obtenerProductos };
