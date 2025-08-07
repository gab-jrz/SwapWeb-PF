import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import ProductCard from "../Component/ProductCard";
import Footer from "../Component/Footer";
import Pagination from "../Component/Pagination";
import ProductsPerPage from "../Component/ProductsPerPage";
import QuienesSomos from "../Component/QuienesSomos";
import { getProducts } from "../services/api";
import "../styles/Home.css";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(8); // Ahora es un estado variable

  // Cargar productos desde la API con paginación
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(currentPage, productsPerPage, searchTerm, selectedCategory);
        setProductos(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPrevPage(data.pagination.hasPrevPage);
        setError(null);
      } catch (err) {
        setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, productsPerPage, searchTerm, selectedCategory]);

  // Resetear a la primera página cuando cambien los filtros o productos por página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, productsPerPage]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll hacia arriba cuando cambia de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para cambiar productos por página
  const handleProductsPerPageChange = (newLimit) => {
    setProductsPerPage(newLimit);
  };

  // Ya no necesitamos filtrar en el frontend porque se hace en el backend
  const productosParaMostrar = productos;

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
        {/* Mostrar mensaje de carga o error */}
        {loading && <p className="text-center">Cargando productos...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        {/* Mostrar los productos */}
        {!loading && !error && (
          <>
            {/* Selector de productos por página */}
            {totalProducts > 0 && (
              <ProductsPerPage
                currentLimit={productsPerPage}
                onLimitChange={handleProductsPerPageChange}
              />
            )}

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

            {/* Información de paginación */}
            {productosParaMostrar.length > 0 && (
              <div className="pagination-info">
                <p className="text-center text-muted">
                  Mostrando {productosParaMostrar.length} de {totalProducts} productos
                </p>
              </div>
            )}

            {/* Componente de paginación */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
              />
            )}
          </>
        )}
      </main>

      <QuienesSomos />
      <Footer />
    </div>
  );
};

export default Home;
