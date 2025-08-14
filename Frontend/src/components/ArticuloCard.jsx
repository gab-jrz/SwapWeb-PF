import React from 'react';
import { getProductImageUrl } from '../utils/getProductImageUrl.js';
import '../styles/ArticuloCard.css';

/**
 * Card premium para artículos en el perfil de usuario
 * Props esperadas:
 * - producto: { id, title, description, image, categoria, fechaPublicacion, estado }
 * - onEdit: función para editar
 * - onMarkAsExchanged: función para marcar como intercambiado
 */
const ArticuloCard = ({ producto, onEdit, onMarkAsExchanged }) => {
  return (
    <div className="articulo-card-premium">
      <div className="articulo-img-wrap">
        <img
          src={
            producto.images && producto.images.length > 0
              ? getProductImageUrl(producto.images[0]) || '/images/placeholder-product.jpg'
              : '/images/placeholder-product.jpg'
          }
          alt={producto.title}
          className="articulo-img"
        />
      </div>
      <div className="articulo-content">
        <div className="articulo-categoria-badge">
          {producto.categoria}
        </div>
        <h3 className="articulo-title">{producto.title}</h3>
        <p className="articulo-desc">{producto.description}</p>
        <div className="articulo-meta-box">
          <div className="articulo-fecha-simple">
            Publicado el: {producto.fechaPublicacion ? new Date(producto.fechaPublicacion).toLocaleDateString() : 'Sin fecha'}
          </div>
          <div className="articulo-provincia-simple">
            En: {producto.provincia || 'Tucumán'}
          </div>
        </div>
        

        <div className="articulo-actions">
          <button className="articulo-edit-btn" onClick={() => onEdit(producto)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </button>
          
          {producto.estado !== 'intercambiado' && (
            <button 
              className="articulo-intercambio-btn" 
              onClick={() => onMarkAsExchanged && onMarkAsExchanged(producto)}
              title="Marcar como intercambiado"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10"></path>
                <path d="M7 17 17 7"></path>
              </svg>
              Marcar como intercambiado
            </button>
          )}
          
          {producto.estado === 'intercambiado' && (
            <div className="articulo-intercambiado-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              Intercambiado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticuloCard;
