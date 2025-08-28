import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BackButton.css';

/**
 * Reusable icon-only back button with premium styling.
 * Props:
 * - to: string | number (optional). If provided, navigates to this path or history offset. Default: -1
 * - ariaLabel: string (optional). Default: "Volver"
 * - onClick: function (optional). If provided, called before navigation
 * - title: string (optional). Tooltip/title
 */
const BackButton = ({ to = -1, ariaLabel = 'Volver', onClick, title }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (typeof to === 'number') navigate(to);
    else if (typeof to === 'string') navigate(to);
    else navigate(-1);
  };

  return (
    <button
      className="icon-back-btn"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>
  );
};

export default BackButton;
