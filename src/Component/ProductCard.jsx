import React from "react";
import "../styles/ProductCard.css";

const ProductCard = ({ title, description, categoria, image }) => {
  return (
    <div className="product-card">
      <img src={image} alt={title} className="product-img" />
      <div className="product-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="categoria">{categoria}</span>
      </div>
    </div>
  );
};

export default ProductCard;
