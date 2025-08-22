import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import { categorias } from '../categorias';
import '../styles/DetalleProducto.css';
import '../styles/DonationDetailPremium.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Función para construir URLs de imágenes
const getImageUrl = (imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  return `${API_URL.replace('/api', '')}/uploads/products/${imageName}`;
};

// Slider de imágenes para donaciones (usando el mismo componente que productos)
function ImageSlider({ images, title }) {
  const [current, setCurrent] = useState(0);

  if (!Array.isArray(images) || images.length === 0) return null;

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="slider-premium">
      <button className="slider-arrow left" onClick={prevSlide} aria-label="Anterior">
        &#8592;
      </button>
      <img
        src={getImageUrl(images[current])}
        alt={title + ' imagen ' + (current + 1)}
        className="slider-image"
      />
      <button className="slider-arrow right" onClick={nextSlide} aria-label="Siguiente">
        &#8594;
      </button>
      <div className="slider-dots">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={"slider-dot" + (idx === current ? " active" : "")}
            onClick={e => { e.stopPropagation(); setCurrent(idx); }}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donor, setDonor] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchDonationDetails();
  }, [id]);

  useEffect(() => {
    // Verificar si está en favoritos
    if (donation) {
      const favorites = JSON.parse(localStorage.getItem('favoritesDonations') || '[]');
      setIsFavorite(favorites.some(fav => fav.id === donation._id));
    }
  }, [donation]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/donations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDonation(data);
        
        // Obtener información del donador
        if (data.donor) {
          const donorResponse = await fetch(`${API_URL}/users/${data.donor}`);
          if (donorResponse.ok) {
            const donorData = await donorResponse.json();
            setDonor(donorData);
          }
        }
      } else {
        setError('No se pudo cargar la donación');
      }
    } catch (error) {
      console.error('Error fetching donation:', error);
      setError('Error al cargar la donación');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoritesDonations') || '[]');
    const donationData = {
      id: donation._id,
      title: donation.title,
      description: donation.description,
      category: donation.category,
      image: Array.isArray(donation.images) && donation.images.length > 0 ? donation.images[0] : '',
      images: donation.images || [],
      location: donation.location,
      condition: donation.condition,
      status: donation.status,
      createdAt: donation.createdAt,
      donatorName: donor ? `${donor.nombre} ${donor.apellido}` : undefined,
      donatorId: donation.donor,
    };

    if (isFavorite) {
      const updatedFavorites = favorites.filter(fav => fav.id !== donation._id);
      localStorage.setItem('favoritesDonations', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      const updatedFavorites = [...favorites, donationData];
      localStorage.setItem('favoritesDonations', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
    }

    // Notificar al resto de la app
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  const handleContact = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    
    if (!usuarioActual) {
      alert("Debes iniciar sesión para contactar al donador");
      navigate("/login");
      return;
    }

    if (usuarioActual.id === donation.donor) {
      alert("No puedes contactarte a ti mismo por tu propia donación");
      return;
    }

    navigate(`/donaciones/${donation._id}/contactar`, {
      state: {
        donacionId: donation._id,
        donacionTitle: donation.title,
        donacionImage: Array.isArray(donation.images) && donation.images.length > 0 ? donation.images[0] : '',
        donacionDescription: donation.description,
  // Use the application's user id (donor.id) when available so messages use the same identifier
  donadorId: donor?.id || donation.donor,
        donadorNombre: donor?.nombre || "Usuario",
        donadorApellido: donor?.apellido || ""
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Disponible', class: 'disponible' },
      reserved: { text: 'Reservado', class: 'reservado' },
      delivered: { text: 'Entregado', class: 'entregado' },
      removed: { text: 'No disponible', class: 'no-disponible' }
    };
    const statusInfo = statusMap[status] || statusMap.available;
    return (
      <div className={`categoria-badge-premium status-${statusInfo.class}`}>
        <span className="categoria-icon">
          {status === 'available' ? '✅' : 
           status === 'reserved' ? '⏳' : 
           status === 'delivered' ? '🤝' : '❌'}
        </span>
        {statusInfo.text}
      </div>
    );
  };

  const conditionLabel = (key) => {
    const map = {
      'nuevo': 'Nuevo',
      'como_nuevo': 'Como nuevo',
      'muy_bueno': 'Muy bueno',
      'bueno': 'Bueno',
      'regular': 'Regular'
    };
    return map[key] || key || 'No especificada';
  };

  const pickupLabel = (key) => {
    const map = {
      'domicilio': 'Retiro en domicilio',
      'punto_encuentro': 'Punto de encuentro',
      'envio': 'Envío postal',
      'a_convenir': 'Flexible / A convenir'
    };
    return map[key] || key;
  };

  const categoryLabel = (catKey) => {
    if (!catKey) return 'No especificada';
    const found = categorias.find(c => c.id === catKey || c.name === catKey);
    return found ? found.name : catKey;
  };

  if (loading) return (
    <div className="detalle-container">
      <Header />
      <div className="producto-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando donación...</p>
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className="detalle-container">
      <Header />
      <div className="producto-loading">
        <p className="loading-text" style={{color: '#ef4444'}}>❌ {error}</p>
      </div>
      <Footer />
    </div>
  );
  
  if (!donation) return (
    <div className="detalle-container">
      <Header />
      <div className="producto-loading">
        <p className="loading-text">🔍 Donación no encontrada</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="detalle-container">
      {/* Header simplificado */}
      <Header search={false} />
      
      <div className="detalle-contenido">
        {/* Navegación sutil arriba de la card */}
        <div className="detalle-nav-sutil">
          <button className="nav-link" onClick={() => navigate("/donaciones")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver a donaciones
          </button>
          
          <button className="nav-link reportar" onClick={() => setShowReportModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Reportar donación
          </button>
        </div>
        
        <div className="detalle-card-premium">
          {/* Imagen o slider de imágenes de la donación */}
          <div className="producto-imagen-container-premium">
            {Array.isArray(donation.images) && donation.images.length > 1 ? (
              <ImageSlider images={donation.images} title={donation.title} />
            ) : donation.images && donation.images.length > 0 ? (
              <img
                src={getImageUrl(donation.images[0])}
                alt={donation.title}
                className="producto-imagen-premium"
              />
            ) : (
              <div className="slider-premium">
                <div className="no-image-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <p style={{color: '#94a3b8', fontSize: '1.1rem', marginTop: '1rem'}}>Sin imágenes</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Información de la donación */}
          <div className="producto-info-premium">
            {getStatusBadge(donation.status)}
            
            <div className="titulo-con-favoritos-premium">
              <h1 className="producto-titulo-premium">{donation.title}</h1>
              
              {/* Botón de favoritos integrado */}
              <button 
                className={`btn-favorito-premium ${isFavorite ? 'favorito-activo' : ''}`}
                onClick={handleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            
            <div className="producto-descripcion-premium">
              <p>{donation.description || 'Sin descripción disponible'}</p>
            </div>
            
            {/* Características de la donación */}
            {donation.characteristics && donation.characteristics.length > 0 && (
              <div className="producto-caracteristicas-premium">
                <h3 className="caracteristicas-title-premium">Características</h3>
                <ul className="caracteristicas-list-premium">
                  {donation.characteristics.map((item, idx) => (
                    <li key={idx} className="caracteristica-item-premium">
                      <span className="caracteristica-icon-premium">✓</span>
                      <span className="caracteristica-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Atributos esenciales */}
            <div className="atributos-esenciales-premium">
              <div className="atributo-premium">
                <div className="atributo-icon">📂</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Categoría</span>
                  <span className="atributo-valor-premium">{categoryLabel(donation.category)}</span>
                </div>
              </div>

              <div className="atributo-premium">
                <div className="atributo-icon">⭐</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Condición</span>
                  <span className="atributo-valor-premium">{conditionLabel(donation.condition)}</span>
                </div>
              </div>
              
              <div className="atributo-premium">
                <div className="atributo-icon">📅</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Fecha de publicación</span>
                  <span className="atributo-valor-premium">{formatDate(donation.createdAt)}</span>
                </div>
              </div>
              
              {donor && (
                <div className="atributo-premium">
                  <div className="atributo-icon">❤️</div>
                  <div className="atributo-content">
                    <span className="atributo-label-premium">Donador</span>
                    <span className="atributo-valor-premium clickeable" onClick={() => navigate(`/perfil/${donor._id}`)}>
                      {donor.nombre} {donor.apellido}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="atributo-premium">
                <div className="atributo-icon">📍</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Ubicación</span>
                  <span className="atributo-valor-premium">{donation.location || 'No especificada'}</span>
                </div>
              </div>

              {donation.pickupMethod && (
                <div className="atributo-premium">
                  <div className="atributo-icon">🚚</div>
                  <div className="atributo-content">
                    <span className="atributo-label-premium">Método de entrega</span>
                    <span className="atributo-valor-premium">{pickupLabel(donation.pickupMethod)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botón de acción */}
            <div className="producto-accion-premium">
              {donation.status === 'available' ? (
                <button className="btn-consultar-premium" onClick={handleContact}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Me interesa esta donación
                </button>
              ) : (
                <button className="btn-consultar-premium disabled" disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8.5l1.5 1.5L16 7l1.5 1.5L12 14l-3-3z"/>
                  </svg>
                  {donation.status === 'reserved' ? 'Reservado' : 
                   donation.status === 'delivered' ? 'Ya entregado' : 'No disponible'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para reportar */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reportar donación</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>¿Por qué deseas reportar esta donación?</p>
              <select className="report-select">
                <option value="">Selecciona una razón</option>
                <option value="spam">Spam o contenido no deseado</option>
                <option value="fake">Donación falsa o engañosa</option>
                <option value="inappropriate">Contenido inapropiado</option>
                <option value="other">Otro motivo</option>
              </select>
              <textarea 
                className="report-textarea"
                placeholder="Describe el problema (opcional)"
              ></textarea>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-cancelar"
                onClick={() => setShowReportModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-reportar"
                onClick={() => {
                  alert('Reporte enviado. Gracias por tu colaboración.');
                  setShowReportModal(false);
                }}
              >
                Enviar reporte
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DonationDetail;
