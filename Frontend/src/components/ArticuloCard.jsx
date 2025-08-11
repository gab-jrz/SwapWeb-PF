import React from 'react';
import { getProductImageUrl } from '../utils/getProductImageUrl.js';
import '../styles/ArticuloCard.css';

/**
 * Card premium para artículos en el perfil de usuario
 * Props esperadas:
 * - producto: { id, title, description, image, categoria, fechaPublicacion, estado }
 * - onEdit: función para editar
 */
const ArticuloCard = ({ producto, onEdit }) => {
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
        

        <button className="articulo-edit-btn" onClick={() => onEdit(producto)}>
          Editar
        </button>
      </div>
    </div>
  );
};

export default ArticuloCard;
