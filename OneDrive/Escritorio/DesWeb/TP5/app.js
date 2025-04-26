const express = require("express");
const productosRoutes = require("./routes/productosRoutes");

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware para parsear JSON
app.use("/productos", productosRoutes); // Rutas REST

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('API REST de Productos funcionando correctamente.');
});
