import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductImageUrl } from "../utils/getProductImageUrl.js";
import "../styles/ProductCard.css";

const ProductCard = ({ 
  id, 
  title, 
  description, 
  categoria, 
  image, 
  images, // Nuevo prop para array de imágenes
  fechaPublicacion, 
  provincia, 
  ownerName, 
  ownerId, 
  condicion, // Condición del producto
  valorEstimado, // Valor estimado
  disponible, // Disponibilidad
  onConsultar
}) => {
  const navigate = useNavigate();

  const handleOwnerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ownerId) {
      navigate(`/perfil-publico/${ownerId}`);
    }
  };

  // Determinar la imagen a mostrar (portada)
  // Prioridad: 1) Primera imagen del array, 2) Imagen singular (compatibilidad), 3) Placeholder
  const getMainImage = () => {
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0]; // Primera imagen como portada
    }
    if (image) {
      return image; // Fallback al sistema anterior
    }
    return '/images/placeholder-product.jpg'; // Placeholder por defecto
  };

  // Calcular si es "nuevo" (publicado hace <=7 días)
  let esNuevo = false;
  if (fechaPublicacion) {
    const ahora = new Date();
    const fecha = new Date(fechaPublicacion);
    const diffMs = ahora - fecha;
    esNuevo = diffMs <= 7 * 24 * 60 * 60 * 1000; // 7 días
  }

  return (
    <div className="product-card-premium">
      <div className="product-img-wrap">
        <img
          src={getProductImageUrl(getMainImage())}
          alt={title}
          className="product-img"
        />
        {esNuevo && (
          <span className="product-badge-nuevo">Nuevo</span>
        )}
      </div>
      <div className="product-content">
        <div className="product-categoria-badge">
          {categoria}
        </div>
        <h3 className="product-title">{title}</h3>
        <p className="product-desc">{description}</p>
        <div className="product-meta-box">
          <div className="product-fecha-simple">
            Publicado el: {fechaPublicacion ? new Date(fechaPublicacion).toLocaleDateString() : 'Sin fecha'}
          </div>
          <div className="product-provincia-simple">
            En: {provincia || 'Sin especificar'}
          </div>
          {/* Nombre del propietario clickeable dentro de la caja */}
          <div className="product-owner-simple" onClick={handleOwnerClick}>
            Por: <span className="product-owner-name">{ownerName || 'Usuario'}</span>
          </div>
        </div>
        <button className="product-consultar-btn" onClick={onConsultar} type="button">
          Consultar este producto
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
