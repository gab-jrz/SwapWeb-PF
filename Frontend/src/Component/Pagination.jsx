import React from 'react';
import '../styles/Pagination.css';

const ArrowIcon = ({ direction = 'right', color = '#22c55e' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
  >
    <path
      d="M7 5L11 9L7 13"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage
}) => {
  if (totalPages <= 1) return null;

  const handleSelectChange = (e) => {
    onPageChange(Number(e.target.value));
  };

  return (
    <div className="pagination-container select-style">
      <button
        className="page-link arrow-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        aria-label="Página anterior"
      >
        <ArrowIcon direction="left" color={!hasPrevPage ? '#a7f3d0' : '#22c55e'} />
      </button>
      <span className="pagina-label">Página:</span>
      <select
        className="page-select"
        value={currentPage}
        onChange={handleSelectChange}
        aria-label="Seleccionar página"
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      <button
        className="page-link arrow-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Página siguiente"
      >
        <ArrowIcon direction="right" color={!hasNextPage ? '#a7f3d0' : '#22c55e'} />
      </button>
    </div>
  );
};

export default Pagination; 