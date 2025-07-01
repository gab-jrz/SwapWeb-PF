import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import ProductCard from "../Component/ProductCard";
import Footer from "../Component/Footer";
import { getProducts } from "../services/api";
import "../styles/Home.css";
import CustomCarousel from "../Component/Carousel";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProductos(data);
        setError(null);
      } catch (err) {
        setError(
          "Error al cargar los productos. Por favor, intenta de nuevo más tarde."
        );
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

      {/* Espaciador entre header y carrusel */}
      <div style={{ height: 0 }} />

      {/* Carrusel de imágenes */}
      <CustomCarousel />

      <main className="main-content">
        {/* Mostrar mensaje de carga o error */}
        {loading && <p className="text-center">Cargando productos...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        {/* Mostrar los productos */}
        {!loading && !error && (
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
        )}

        {/* Botón "Explorá más" solo si no se muestran todos los productos */}
        {!loading &&
          !error &&
          productosFiltrados.length > 4 &&
          !mostrarTodos && (
            <div className="d-flex justify-content-center my-4">
              <button
                className="btn btn-outline-primary custom-btn"
                onClick={() => setMostrarTodos(true)}
              >
                Explorá más
              </button>
            </div>
          )}

        {/* Botón "Mostrar menos" solo si se están mostrando todos los productos */}
        {!loading &&
          !error &&
          mostrarTodos &&
          productosFiltrados.length > 4 && (
            <div className="d-flex justify-content-center my-4">
              <button
                className="btn btn-outline-secondary custom-btn"
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
