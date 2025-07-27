import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import ProductCard from "../Component/ProductCard";
import Footer from "../Component/Footer";
import { getProducts } from "../services/api";
import "../styles/Home.css";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros avanzados
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(""); // "recent", "week", "month", ""
  const [userFilter, setUserFilter] = useState(""); // nombre de usuario
  const [provinceFilter, setProvinceFilter] = useState(""); // provincia específica
  const [sortBy, setSortBy] = useState(""); // "date", "title", ""

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProductos(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Escuchar evento global para refrescar productos tras intercambio
    const handleProductsUpdated = () => {
      fetchProducts();
    };
    window.addEventListener('productsUpdated', handleProductsUpdated);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Filtrado avanzado por búsqueda, categoría, fecha, usuario y provincia
  const productosFiltrados = productos.filter((producto) => {
    // Filtro por término de búsqueda (título y descripción)
    const matchSearch = searchTerm === "" || 
      producto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchCategoria = selectedCategory === "" || 
      producto.categoria?.toLowerCase() === selectedCategory.toLowerCase();
    
    // Filtro por fecha
    let matchDate = true;
    if (dateFilter && producto.fechaPublicacion) {
      const productDate = new Date(producto.fechaPublicacion);
      const now = new Date();
      const diffTime = Math.abs(now - productDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "recent":
          matchDate = diffDays <= 3;
          break;
        case "week":
          matchDate = diffDays <= 7;
          break;
        case "month":
          matchDate = diffDays <= 30;
          break;
        default:
          matchDate = true;
      }
    }
    
    // Filtro por usuario
    const matchUser = userFilter === "" || 
      producto.owner?.nombre?.toLowerCase().includes(userFilter.toLowerCase()) ||
      producto.ownerName?.toLowerCase().includes(userFilter.toLowerCase());
    
    // Filtro por provincia
    const matchProvince = provinceFilter === "" || 
      producto.provincia?.toLowerCase().includes(provinceFilter.toLowerCase()) ||
      producto.ubicacion?.toLowerCase().includes(provinceFilter.toLowerCase());
    
    return matchSearch && matchCategoria && matchDate && matchUser && matchProvince;
  });
  
  // Ordenamiento de productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.fechaPublicacion || b.createdAt) - new Date(a.fechaPublicacion || a.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      case "user":
        return (a.owner?.nombre || a.ownerName || "").localeCompare(b.owner?.nombre || b.ownerName || "");
      default:
        return 0;
    }
  });

  // Lógica para mostrar 4 productos al principio, y luego más si se presiona "Mostrar más"
  const productosParaMostrar = mostrarTodos
    ? productosOrdenados
    : productosOrdenados.slice(0, 4);

  return (
    <div className="home-container">
      {/* Header con props para búsqueda y filtros avanzados */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        advancedFiltersOpen={advancedFiltersOpen}
        setAdvancedFiltersOpen={setAdvancedFiltersOpen}
      />

      {/* Panel de filtros avanzados */}
      {advancedFiltersOpen && (
        <div className="advanced-filters-panel bg-light border-bottom py-3">
          <div className="container-fluid px-4">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">📅 Fecha de publicación</label>
                <select 
                  className="form-select form-select-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="">Cualquier fecha</option>
                  <option value="recent">Últimos 3 días</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">👤 Usuario</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del usuario..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">📍 Provincia</label>
                <select 
                  className="form-select form-select-sm"
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                >
                  <option value="">Todas las provincias</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="Catamarca">Catamarca</option>
                  <option value="Chaco">Chaco</option>
                  <option value="Chubut">Chubut</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Corrientes">Corrientes</option>
                  <option value="Entre Ríos">Entre Ríos</option>
                  <option value="Formosa">Formosa</option>
                  <option value="Jujuy">Jujuy</option>
                  <option value="La Pampa">La Pampa</option>
                  <option value="La Rioja">La Rioja</option>
                  <option value="Mendoza">Mendoza</option>
                  <option value="Misiones">Misiones</option>
                  <option value="Neuquén">Neuquén</option>
                  <option value="Río Negro">Río Negro</option>
                  <option value="Salta">Salta</option>
                  <option value="San Juan">San Juan</option>
                  <option value="San Luis">San Luis</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Santa Fe">Santa Fe</option>
                  <option value="Santiago del Estero">Santiago del Estero</option>
                  <option value="Tierra del Fuego">Tierra del Fuego</option>
                  <option value="Tucumán">Tucumán</option>
                  <option value="Ciudad Autónoma de Buenos Aires">CABA</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">🔄 Ordenar por</label>
                <select 
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sin ordenar</option>
                  <option value="date">Fecha (más recientes)</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="user">Usuario (A-Z)</option>
                </select>
              </div>
            </div>
            
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setDateFilter("");
                      setUserFilter("");
                      setProvinceFilter("");
                      setSortBy("");
                    }}
                  >
                    🗑️ Limpiar filtros
                  </button>
                  
                  <span className="badge bg-primary ms-2 align-self-center">
                    {productosOrdenados.length} resultado{productosOrdenados.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setAdvancedFiltersOpen(false)}
                >
                  ✕ Cerrar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  fechaPublicacion={producto.fechaPublicacion || producto.createdAt}
                  provincia={producto.provincia || producto.ubicacion}
                  ownerName={producto.owner?.nombre || producto.ownerName}
                  ownerId={producto.owner?.id || producto.ownerId}
                />
              ))
            ) : (
              <p>No se encontraron productos</p>
            )}
          </div>
        )}

        {/* Botón "Explorá más" solo si no se muestran todos los productos */}
        {!loading && !error && productosOrdenados.length > 4 && !mostrarTodos && (
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
        {!loading && !error && mostrarTodos && productosOrdenados.length > 4 && (
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
