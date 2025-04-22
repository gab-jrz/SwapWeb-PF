import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import ProductCard from "../Component/ProductCard";
import Footer from "../Component/Footer";
import "../styles/Home.css";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Cargar productos desde db.json
  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error("Error al obtener productos:", error));
  }, []);

  // Filtrado por búsqueda y categoría
  const productosFiltrados = productos.filter((producto) => {
    const matchSearch = producto.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategoria = selectedCategory
      ? producto.categoria.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    return matchSearch && matchCategoria;
  });

  // Lógica para mostrar 4 productos al principio, y luego más si se presiona "Mostrar más"
  const productosParaMostrar = mostrarTodos
    ? productosFiltrados
    : productosFiltrados.slice(0, 4);

  return (
    <div className="home-container">
      {/* Header con props para búsqueda */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="main-content">
        {/* Mostrar los productos */}
        <div className="product-list">
          {productosParaMostrar.length > 0 ? (
            productosParaMostrar.map((producto) => (
              <ProductCard
                key={producto.id}
                id={producto.id}
                title={producto.title}
                description={producto.description}
                categoria={producto.categoria}
                image={producto.image}
              />
            ))
          ) : (
            <p>No se encontraron productos</p>
          )}
        </div>

        {/* Botón "Explorá más" solo si no se muestran todos los productos */}
        {productosFiltrados.length > 4 && !mostrarTodos && (
          <div className="d-flex justify-content-center my-4">
            <button
              className="btn btn-outline-primary"
              onClick={() => setMostrarTodos(true)}
            >
              Explorá más
            </button>
          </div>
        )}

        {/* Botón "Mostrar menos" solo si se están mostrando todos los productos */}
        {mostrarTodos && productosFiltrados.length > 4 && (
          <div className="d-flex justify-content-center my-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setMostrarTodos(false)}
            >
              Mostrar menos
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
