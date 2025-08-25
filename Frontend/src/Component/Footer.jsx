import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import "../styles/ScrollToTop.css";

import { useEffect, useState } from "react";

const Footer = () => {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.body.offsetHeight;
      const pagination = document.querySelector('.pagination-container');
      let hasPassedPagination = false;
      if (pagination) {
        const rect = pagination.getBoundingClientRect();
        // The bottom of the pagination relative to the viewport
        const paginationBottom = rect.bottom + window.scrollY;
        // User has scrolled past the bottom of pagination
        hasPassedPagination = window.scrollY + window.innerHeight > paginationBottom;
      }
      // Show only if user is near the bottom AND has passed pagination
      setShowScrollBtn((bottomPosition - scrollPosition < 300) && hasPassedPagination);
    };
    window.addEventListener('scroll', handleScroll);
    // Call once on mount in case already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="footer-modern">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="footer-wave-fill"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="footer-wave-fill"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="footer-wave-fill"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid-modern">
            <div className="footer-section-modern footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="7" cy="7" r="2" fill="currentColor"/>
                    <circle cx="17" cy="17" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <span className="logo-text">SwapWeb</span>
              </div>
              <p className="footer-description">
                La plataforma líder para intercambios seguros entre particulares. Conectamos personas de toda Argentina para facilitar el trueque de productos.
              </p>
            </div>
            
            <div className="footer-section-modern">
              <h5 className="footer-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Navegación
              </h5>
              <ul className="footer-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/?openCats=1">Categorías</Link></li>
                <li><Link to="/como-funciona#top">Cómo Funciona</Link></li>
                <li><Link to="/sobre-nosotros#top">Sobre Nosotros</Link></li>
                <li><Link to="/contactanos#top">Contáctanos</Link></li>
                <li><Link to="/privacidad#top">Política de Privacidad</Link></li>
              </ul>
            </div>
        
            <div className="footer-section-modern">
              <h5 className="footer-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Síguenos
              </h5>
              <div className="footer-social-modern">
                <div className="social-links">
                  <a 
                    href="https://instagram.com/swapwebtuc" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-link instagram" 
                    title="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" strokeWidth="2"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="social-text">@swapwebtuc</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>© 2025 SwapWeb. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón flotante para volver arriba */}
      {showScrollBtn && (
        <button
          className="scroll-to-top-btn"
          title="Volver arriba"
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          aria-label="Volver arriba"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M12 5L6 11M12 5l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </footer>
  );
};

export default Footer;
