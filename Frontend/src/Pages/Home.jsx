import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import ProductCard from "../Component/ProductCard";
import Footer from "../Component/Footer";
import Carousel from "../Component/Carousel";
import QuienesSomos from "../Component/QuienesSomos";
import { getProducts } from "../services/api";
import useProducts from "../hooks/useProducts";
import { categorias } from "../categorias";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  // Usar hook personalizado para productos con sincronización automática
  const { productos, loading, error, fetchProducts } = useProducts([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  
  // Estados para filtros avanzados
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(""); // "recent", "week", "month", ""
  const [userFilter, setUserFilter] = useState(""); // nombre de usuario
  const [provinceFilter, setProvinceFilter] = useState(""); // provincia específica
  const [sortBy, setSortBy] = useState(""); // "date", "title", ""

  // Cargar productos desde la API usando el hook con sincronización automática
  useEffect(() => {
    const loadProducts = async () => {
      console.log('🔄 Iniciando carga de productos...');
      const data = await fetchProducts();
      console.log('✅ Productos obtenidos:', data);
      console.log('📊 Cantidad de productos:', data.length);
      
      // Analizar categorías únicas en los productos
      const categoriasUnicas = [...new Set(data.map(p => p.categoria).filter(Boolean))];
      console.log('🏷️ Categorías encontradas en productos:', categoriasUnicas);
      
      console.log('🏁 Finalizando carga de productos');
    };

    loadProducts();

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
    
    // Filtro por categoría mejorado
    let matchCategoria = selectedCategory === "";
    
    if (!matchCategoria && selectedCategory && producto.categoria) {
      const selectedCat = selectedCategory.toLowerCase().trim();
      const productCat = producto.categoria.toLowerCase().trim();
      
      // Buscar coincidencia exacta
      matchCategoria = productCat === selectedCat;
      
      // Si no hay coincidencia exacta, buscar por nombre completo
      if (!matchCategoria) {
        const categoryObj = categorias.find(cat => cat.id === selectedCategory);
        if (categoryObj) {
          const fullName = categoryObj.name.toLowerCase().trim();
          matchCategoria = productCat === fullName || 
                         productCat.includes(selectedCat) || 
                         fullName.includes(productCat);
        }
      }
    }
    
    // Debug detallado para ver las categorías
    if (selectedCategory !== "") {
      console.log('🔍 Filtro activo:', selectedCategory);
      console.log('📦 Producto:', producto.title);
      console.log('🏷️ Categoría del producto:', `"${producto.categoria}"`);
      console.log('🎯 Categoría seleccionada:', `"${selectedCategory}"`);
      console.log('✅ Match:', matchCategoria);
      console.log('---');
    }
    
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
  const productosParaMostrar = mostrarTodos ? productosOrdenados : productosOrdenados.slice(0, 8);
  
  // Obtener nombre de categoría seleccionada
  const getCategoryName = (categoryId) => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.name : 'Todas las categorías';
  };

  return (
    <div className="home-container">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        advancedFiltersOpen={advancedFiltersOpen}
        setAdvancedFiltersOpen={setAdvancedFiltersOpen}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        provinceFilter={provinceFilter}
        setProvinceFilter={setProvinceFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        productosOrdenados={productosOrdenados}
      />



      {/* Carousel */}
      <Carousel />

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
                  images={producto.images}
                  fechaPublicacion={producto.fechaPublicacion || producto.createdAt}
                  provincia={producto.provincia || producto.ubicacion}
                  ownerName={producto.owner?.nombre || producto.ownerName}
                  ownerId={producto.owner?.id || producto.ownerId}
                  condicion={producto.condicion}
                  valorEstimado={producto.valorEstimado}
                  disponible={producto.disponible}
                  onConsultar={() => navigate(`/producto/${producto.id}`)}
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

      {/* Sección Quiénes Somos */}
      <QuienesSomos />

      <Footer />
    </div>
  );
};

export default Home;
