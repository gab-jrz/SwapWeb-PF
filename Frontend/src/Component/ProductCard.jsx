import React, { useState, useEffect } from "react";
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
  const [isFavorite, setIsFavorite] = useState(false);

  // Cargar estado de favorito desde localStorage al montar el componente
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === id));
  }, [id]);

  const handleOwnerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ownerId) {
      navigate(`/perfil-publico/${ownerId}`);
    }
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const productData = {
      id,
      title,
      description,
      categoria,
      image: getMainImage(),
      images,
      fechaPublicacion,
      provincia,
      ownerName,
      ownerId,
      condicion,
      valorEstimado,
      disponible
    };

    if (isFavorite) {
      // Remover de favoritos
      const updatedFavorites = favorites.filter(fav => fav.id !== id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      // Agregar a favoritos
      const updatedFavorites = [...favorites, productData];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
    }
    
    // Disparar evento personalizado para notificar cambios en favoritos
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
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

  // Eliminado: etiqueta "Nuevo"

  return (
    <div className="product-card-premium">
      <div className="product-img-wrap">
        <img
          src={getProductImageUrl(getMainImage())}
          alt={title}
          className="product-img"
        />
        {/* Badge "Nuevo" eliminado */}
        <button 
          className={`favorite-btn ${isFavorite ? 'favorite-active' : ''}`}
          onClick={handleFavoriteToggle}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </svg>
        </button>
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
