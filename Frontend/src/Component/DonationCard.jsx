import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';

const DonationCard = ({ 
  title, 
  description, 
  category, 
  location, 
  condition, 
  images, 
  status, 
  createdAt, 
  viewMode = 'grid',
  onAssign,
  donationId
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    // Si ya es una URL completa, devolverla tal como está
    if (imageName.startsWith('http')) return imageName;
    // Construir la URL completa para imágenes del servidor
    return `${API_URL.replace('/api', '')}/uploads/products/${imageName}`;
  };

  const handleAssign = () => {
    if (donationId) {
      // Navegar a la página de detalles
      navigate(`/donaciones/${donationId}`);
    } else {
      // Fallback al modal si no hay ID
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    if (onAssign) onAssign();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      available: { text: 'Disponible', class: 'success', icon: 'fa-check-circle' },
      reserved: { text: 'Reservado', class: 'warning', icon: 'fa-clock' },
      delivered: { text: 'Entregado', class: 'info', icon: 'fa-handshake' },
      removed: { text: 'No disponible', class: 'secondary', icon: 'fa-times-circle' }
    };
    return statusMap[status] || statusMap.available;
  };

  const statusInfo = getStatusInfo(status);

  if (viewMode === 'list') {
    return (
      <>
        <div className="donation-card-list">
          <div className="donation-image-container">
            {images && images.length > 0 && !imageError ? (
              <img 
                src={getImageUrl(images[0])} 
                alt={title} 
                className="donation-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="donation-image-placeholder">
                <i className="fas fa-image"></i>
              </div>
            )}
          </div>
          
          <div className="donation-content">
            <div className="donation-header">
              <h5 className="donation-title">{title}</h5>
              <span className={`donation-status badge-${statusInfo.class}`}>
                <i className={`fas ${statusInfo.icon} me-1`}></i>
                {statusInfo.text}
              </span>
            </div>
            
            <div className="donation-details">
              <div className="donation-meta">
                <span className="donation-category">
                  <i className="fas fa-tag me-1"></i>
                  {category}
                </span>
                <span className="donation-condition">
                  <i className="fas fa-star me-1"></i>
                  {condition}
                </span>
                <span className="donation-location">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {location}
                </span>
                {createdAt && (
                  <span className="donation-date">
                    <i className="fas fa-calendar me-1"></i>
                    {formatDate(createdAt)}
                  </span>
                )}
              </div>
              
              {description && (
                <p className="donation-description">{description}</p>
              )}
            </div>
            
            <div className="donation-actions">
              <button 
                className="btn-donation-action"
                onClick={handleAssign}
                disabled={status !== 'available'}
              >
                <i className="fas fa-heart me-2"></i>
                {status === 'available' ? 'Me interesa' : 'No disponible'}
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-heart text-danger me-2"></i>
                    ¿Te interesa esta donación?
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="modal-donation-info">
                    <h6>{title}</h6>
                    <p>Te pondremos en contacto con la persona que está donando este artículo.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleConfirm}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Vista en grid (por defecto)
  return (
    <>
      <div className="donation-card-grid">
        <div className="donation-image-container">
          {images && images.length > 0 && !imageError ? (
            <img 
              src={getImageUrl(images[0])} 
              alt={title} 
              className="donation-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="donation-image-placeholder">
              <i className="fas fa-image"></i>
            </div>
          )}
          
          <div className="donation-overlay">
            <span className={`donation-status badge-${statusInfo.class}`}>
              <i className={`fas ${statusInfo.icon} me-1`}></i>
              {statusInfo.text}
            </span>
          </div>
        </div>
        
        <div className="donation-content">
          <h5 className="donation-title">{title}</h5>
          
          <div className="donation-meta">
            <span className="donation-category">
              <i className="fas fa-tag me-1"></i>
              {category}
            </span>
            <span className="donation-condition">
              <i className="fas fa-star me-1"></i>
              {condition}
            </span>
          </div>
          
          <div className="donation-location">
            <i className="fas fa-map-marker-alt me-1"></i>
            {location}
          </div>
          
          {description && (
            <p className="donation-description">
              {description.length > 80 ? `${description.substring(0, 80)}...` : description}
            </p>
          )}
          
          {createdAt && (
            <div className="donation-date">
              <i className="fas fa-calendar me-1"></i>
              {formatDate(createdAt)}
            </div>
          )}
          
          <button 
            className="btn-donation-action"
            onClick={handleAssign}
            disabled={status !== 'available'}
          >
            <i className="fas fa-heart me-2"></i>
            {status === 'available' ? 'Me interesa' : 'No disponible'}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-heart text-danger me-2"></i>
                  ¿Te interesa esta donación?
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-donation-info">
                  <h6>{title}</h6>
                  <p>Te pondremos en contacto con la persona que está donando este artículo.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleConfirm}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationCard;
