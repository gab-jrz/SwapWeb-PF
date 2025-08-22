import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import { getProduct } from "../services/api";
import "../styles/DetalleProducto.css";
import { getProductImageUrl } from "../utils/getProductImageUrl";

const API_URL = 'http://localhost:3001/api';

// Slider de imágenes premium para productos (máx 3 imágenes)
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
        src={getProductImageUrl(images[current])}
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

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const raw = await getProduct(id);
        const normalized = {
          id: raw?.id || raw?._id || id,
          _id: raw?._id || raw?.id || null,
          title: raw?.title || raw?.titulo || 'Sin título',
          description: raw?.description || raw?.descripcion || 'Sin descripción',
          categoria: raw?.categoria || raw?.category || 'General',
          images: Array.isArray(raw?.images) ? raw.images : (raw?.image ? [raw.image] : []),
          image: raw?.image || (Array.isArray(raw?.images) && raw.images.length > 0 ? raw.images[0] : ''),
          fechaPublicacion: raw?.fechaPublicacion || raw?.createdAt || raw?.fecha || null,
          provincia: raw?.provincia || raw?.zona || raw?.ubicacion || '',
          ownerId: raw?.ownerId || raw?.owner || raw?.userId || raw?.usuarioId || null,
          caracteristicas: raw?.caracteristicas || raw?.features || [],
          ...raw,
        };
        setProducto(normalized);
        
        // Obtener información del dueño del producto (si hay ownerId)
        if (normalized.ownerId) {
          const ownerResponse = await fetch(`${API_URL}/users/${normalized.ownerId}`);
          if (ownerResponse.ok) {
            const ownerData = await ownerResponse.json();
            setOwner(ownerData);
            // Si el producto no trae provincia, usar la del propietario
            setProducto(prev => prev ? ({
              ...prev,
              provincia: prev.provincia || ownerData.zona || ownerData.ubicacion || ''
            }) : prev);
          }
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar el producto. Por favor, intenta de nuevo más tarde.');
        console.error("Error al obtener el producto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Inicializar estado de favorito cuando el producto ya está cargado
  useEffect(() => {
    if (!producto?.id) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === producto.id));
  }, [producto?.id]);

  const handleChat = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    
    if (!usuarioActual) {
      alert("Debes iniciar sesión para consultar por este artículo");
      navigate("/login");
      return;
    }

    if (usuarioActual.id === producto.ownerId) {
      alert("No puedes consultar por tu propio producto");
      return;
    }

    navigate("/intercambiar", {
      state: {
        productoId: producto.id,
        productoTitle: producto.title,
        productoImage: producto.image,
        productoDescription: producto.description,
        ownerId: producto.ownerId,
        ownerNombre: owner?.nombre || "",
        ownerApellido: owner?.apellido || ""
      }
    });
  };

  const handleFavorite = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuarioActual) {
      setShowLoginModal(true);
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const productData = {
      id: producto.id,
      title: producto.title,
      description: producto.description,
      categoria: producto.categoria,
      image: Array.isArray(producto.images) && producto.images.length > 0 ? producto.images[0] : producto.image,
      images: producto.images,
      fechaPublicacion: producto.fechaPublicacion,
      provincia: producto.provincia,
      ownerName: owner ? `${owner.nombre} ${owner.apellido}` : undefined,
      ownerId: producto.ownerId,
      condicion: producto.condicion,
      valorEstimado: producto.valorEstimado,
      disponible: producto.disponible,
    };

    if (isFavorite) {
      const updatedFavorites = favorites.filter(fav => fav.id !== producto.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      const updatedFavorites = [...favorites, productData];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
    }

    // Notificar al resto de la app
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  if (loading) return (
    <div className="detalle-container">
      <Header />
      <div className="producto-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando producto...</p>
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
  
  if (!producto) return (
    <div className="detalle-container">
      <Header />
      <div className="producto-loading">
        <p className="loading-text">🔍 Producto no encontrado</p>
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
          <button className="nav-link" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver al inicio
          </button>
          
          <button className="nav-link reportar" onClick={() => setShowReportModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Reportar publicación
          </button>
        </div>
        
        <div className="detalle-card-premium">
          {/* Imagen o slider de imágenes del producto */}
          <div className="producto-imagen-container-premium">
            {Array.isArray(producto.images) && producto.images.length > 1 ? (
              <ImageSlider images={producto.images} title={producto.title} />
            ) : (
              <img
                src={getProductImageUrl(producto.images && producto.images.length > 0 ? producto.images[0] : producto.image)}
                alt={producto.title}
                className="producto-imagen-premium"
              />
            )}
          </div>
          
          {/* Información del producto */}
          <div className="producto-info-premium">
            <div className="categoria-badge-premium">
              <span className="categoria-icon">📂</span>
              {producto.categoria}
            </div>
            
            <div className="titulo-con-favoritos-premium">
              <h1 className="producto-titulo-premium">{producto.title}</h1>
              
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
              <p>{producto.description}</p>
            </div>
            
            {/* Características del producto */}
            {producto.caracteristicas && producto.caracteristicas.length > 0 && (
              <div className="producto-caracteristicas-premium">
                <h3 className="caracteristicas-title-premium">Características</h3>
                <ul className="caracteristicas-list-premium">
                  {producto.caracteristicas.map((item, idx) => (
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
                <div className="atributo-icon">📅</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Fecha de publicación</span>
                  <span className="atributo-valor-premium">{formatDate(producto.fechaPublicacion)}</span>
                </div>
              </div>
              
              {owner && (
                <div className="atributo-premium">
                  <div className="atributo-icon">👤</div>
                  <div className="atributo-content">
                    <span className="atributo-label-premium">Propietario</span>
                    <span className="atributo-valor-premium clickeable" onClick={() => navigate(`/perfil-publico/${owner._id}`)}>
                      {owner.nombre} {owner.apellido}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="atributo-premium">
                <div className="atributo-icon">📍</div>
                <div className="atributo-content">
                  <span className="atributo-label-premium">Provincia</span>
                  <span className="atributo-valor-premium">{producto.provincia || 'No especificada'}</span>
                </div>
              </div>
            </div>
            
            {/* Solo un botón: Consultar */}
            <div className="producto-accion-premium">
              <button className="btn-consultar-premium" onClick={handleChat}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                Consultar por este artículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para usuarios no registrados */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registro requerido</h3>
              <button 
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Es necesario registrarse para agregar artículos a favoritos.</p>
              <p>¿Te gustaría crear una cuenta ahora?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-cancelar"
                onClick={() => setShowLoginModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-registrar"
                onClick={handleLoginRedirect}
              >
                Ir a registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para reportar */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reportar artículo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>¿Por qué deseas reportar este artículo?</p>
              <select className="report-select">
                <option value="">Selecciona una razón</option>
                <option value="spam">Spam o contenido no deseado</option>
                <option value="fake">Producto falso o engañoso</option>
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
                  // TODO: Implementar lógica de reporte
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

export default DetalleProducto;
