import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import DonationCard from '../Component/DonationCard';
import '../styles/DonationsList.css';

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid o list
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterAndSortDonations();
  }, [donations, selectedCategory, searchTerm, sortBy, filterStatus]);

  const fetchDonations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/donations`);
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDonations = () => {
    let filtered = donations;

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(donation => donation.category === selectedCategory);
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(donation => donation.status === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    setFilteredDonations(filtered);
  };

  const handleAssignDonation = (donationId) => {
    navigate(`/donaciones/${donationId}`);
  };

  if (loading) {
    return (
      <>
        <Header search={false} />
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header search={false} />
      
      {/* Hero Section */}
      <div className="donations-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="hero-title">
                <i className="fas fa-heart text-danger me-3"></i>
                Explora Donaciones
              </h1>
              <p className="hero-subtitle">
                Encuentra artículos que otros quieren donar y ayuda a crear un mundo más sostenible
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{donations.length}</span>
                  <span className="stat-label">Donaciones</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{new Set(donations.map(d => d.category)).size}</span>
                  <span className="stat-label">Categorías</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{donations.filter(d => d.status === 'available').length}</span>
                  <span className="stat-label">Disponibles</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <button
                className="btn-hero-cta"
                onClick={() => navigate('/donaciones/publicar')}
              >
                <i className="fas fa-plus me-2"></i>
                Publicar Donación
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Filtros Avanzados */}
        <div className="filters-section">
          <div className="filters-header">
            <h3 className="filters-title">
              <i className="fas fa-filter me-2"></i>
              Filtros y Búsqueda
            </h3>
            <button 
              className="btn-toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>

          <div className={`filters-content ${showFilters ? 'show' : ''}`}>
            <div className="row">
              {/* Búsqueda */}
              <div className="col-md-4 mb-3">
                <label className="filter-label">
                  <i className="fas fa-search me-2"></i>Búsqueda
                </label>
                <input
                  type="text"
                  className="form-control filter-input"
                  placeholder="Buscar por título, descripción o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categoría */}
              <div className="col-md-3 mb-3">
                <label className="filter-label">
                  <i className="fas fa-tags me-2"></i>Categoría
                </label>
                <select
                  className="form-select filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="Electrónicos">Electrónicos</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Libros">Libros</option>
                  <option value="Juguetes">Juguetes</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Estado */}
              <div className="col-md-2 mb-3">
                <label className="filter-label">
                  <i className="fas fa-check-circle me-2"></i>Estado
                </label>
                <select
                  className="form-select filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="delivered">Entregado</option>
                </select>
              </div>

              {/* Ordenar */}
              <div className="col-md-3 mb-3">
                <label className="filter-label">
                  <i className="fas fa-sort me-2"></i>Ordenar por
                </label>
                <select
                  className="form-select filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="title">Título A-Z</option>
                  <option value="category">Categoría</option>
                </select>
              </div>
            </div>

            {/* Botones de filtro rápido */}
            <div className="quick-filters">
              <span className="quick-filters-label">Filtros rápidos:</span>
              <button 
                className={`btn-quick-filter ${selectedCategory === 'Electrónicos' ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === 'Electrónicos' ? '' : 'Electrónicos')}
              >
                📱 Electrónicos
              </button>
              <button 
                className={`btn-quick-filter ${selectedCategory === 'Ropa' ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === 'Ropa' ? '' : 'Ropa')}
              >
                👕 Ropa
              </button>
              <button 
                className={`btn-quick-filter ${selectedCategory === 'Hogar' ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === 'Hogar' ? '' : 'Hogar')}
              >
                🏠 Hogar
              </button>
              <button 
                className={`btn-quick-filter ${selectedCategory === 'Libros' ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === 'Libros' ? '' : 'Libros')}
              >
                📚 Libros
              </button>
            </div>
          </div>
        </div>

        {/* Resultados y controles de vista */}
        <div className="results-header">
          <div className="results-info">
            <h4 className="results-count">
              {filteredDonations.length} donacion{filteredDonations.length !== 1 ? 'es' : ''} encontrada{filteredDonations.length !== 1 ? 's' : ''}
            </h4>
            {(searchTerm || selectedCategory || filterStatus !== 'all') && (
              <div className="active-filters">
                {searchTerm && (
                  <span className="filter-tag">
                    Búsqueda: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}><i className="fas fa-times"></i></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="filter-tag">
                    Categoría: {selectedCategory}
                    <button onClick={() => setSelectedCategory('')}><i className="fas fa-times"></i></button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="filter-tag">
                    Estado: {filterStatus}
                    <button onClick={() => setFilterStatus('all')}><i className="fas fa-times"></i></button>
                  </span>
                )}
                <button 
                  className="btn-clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setFilterStatus('all');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
          
          <div className="view-controls">
            <div className="view-toggle">
              <button 
                className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista en cuadrícula"
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista en lista"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de donaciones */}
        {filteredDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>No se encontraron donaciones</h3>
            <p>
              {searchTerm || selectedCategory || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros para ver más resultados'
                : 'Sé el primero en publicar una donación en esta plataforma'}
            </p>
            <div className="empty-actions">
              {(searchTerm || selectedCategory || filterStatus !== 'all') && (
                <button 
                  className="btn btn-outline-primary me-3"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setFilterStatus('all');
                  }}
                >
                  <i className="fas fa-undo me-2"></i>
                  Limpiar Filtros
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={() => navigate('/donaciones/publicar')}
              >
                <i className="fas fa-plus me-2"></i>
                Publicar Primera Donación
              </button>
            </div>
          </div>
        ) : (
          <div className={`donations-grid ${viewMode}`}>
            {filteredDonations.map((donation) => (
              <div key={donation._id} className={`donation-item ${viewMode}`}>
                <DonationCard
                  title={donation.title}
                  description={donation.description}
                  category={donation.category}
                  location={donation.location}
                  condition={donation.condition}
                  images={donation.images}
                  status={donation.status}
                  createdAt={donation.createdAt}
                  viewMode={viewMode}
                  donationId={donation._id}
                  onAssign={() => handleAssignDonation(donation._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DonationsList;
