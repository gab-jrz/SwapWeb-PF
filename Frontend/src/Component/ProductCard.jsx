import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

const ProductCard = ({ id, title, description, categoria, image }) => {
  // Estado para controlar si la descripción está visible
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  // Función para manejar el clic en la tarjeta y mostrar/ocultar la descripción
  const handleCardClick = () => {
    setIsDescriptionVisible(!isDescriptionVisible); // Cambia la visibilidad
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <Link to={`/producto/${id}`} style={{ textDecoration: "none" }}>
        <img src={image} alt={title} className="product-img" />
        <div className="product-info">
          <h3>{title}</h3>
          {/* Solo muestra la descripción si el estado isDescriptionVisible es true */}
          {isDescriptionVisible && <p>{description}</p>}
          <span className="categoria">{categoria}</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
