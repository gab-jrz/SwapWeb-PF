import React from "react";

const ProductCard = ({product}) =>{
    if (!product) return null;
    return(
        <div className="product-card"> 
        <img 
        src ={product.image}
        alt={product.title}
        className="product-image"
        />
        <div className="product-info">
            <h3 className="product-title">{product.title}</h3>
            <p className="product-description">{product.description}</p>
            
            <span className="product-categoria">{product.categoria}</span>
        
        </div>
        </div>
      
    )
}
export default ProductCard;
