import React from 'react';
import '../styles/ProductsPerPage.css';

const ProductsPerPage = ({ currentLimit, onLimitChange, options = [8, 12, 16] }) => {
  return (
    <div className="products-per-page-container">
      <label htmlFor="products-per-page" className="products-per-page-label">
        Productos por página:
      </label>
      <select
        id="products-per-page"
        className="products-per-page-select"
        value={currentLimit}
        onChange={(e) => onLimitChange(parseInt(e.target.value))}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductsPerPage; 