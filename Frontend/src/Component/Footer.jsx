import React from "react";
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
                <li><a href="/">Inicio</a></li>
                <li><a href="/publicar">Publicar producto</a></li>
                <li><a href="/categorias">Categorías</a></li>
                <li><a href="/como-funciona">Cómo funciona</a></li>
              </ul>
            </div>
            
            <div className="footer-section-modern">
              <h5 className="footer-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H5C4.46957 11 3.96086 11.2107 3.58579 11.5858C3.21071 11.9609 3 12.4696 3 13V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H12C12.5304 22 13.0391 21.7893 13.4142 21.4142C13.7893 21.0391 14 20.5304 14 20V13C14 12.4696 13.7893 11.9609 13.4142 11.5858C13.0391 11.2107 12.5304 11 12 11H9ZM9 11V9C9 7.67392 9.52678 6.40215 10.4645 5.46447C11.4021 4.52678 12.6739 4 14 4C15.3261 4 16.5979 4.52678 17.5355 5.46447C18.4732 6.40215 19 7.67392 19 9V11" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Soporte
              </h5>
              <ul className="footer-links">
                <li><a href="/ayuda">Centro de ayuda</a></li>
                <li><a href="/seguridad">Seguridad</a></li>
                <li><a href="/terminos">Términos de uso</a></li>
                <li><a href="/privacidad">Política de privacidad</a></li>
              </ul>
            </div>
            
            <div className="footer-section-modern">
              <h5 className="footer-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Contacto
              </h5>
              <div className="contact-info">
                <div className="contact-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>contacto@swapweb.com</span>
                </div>
                <div className="contact-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21C15.72 21 11.62 19.42 8.59 16.59C5.76 13.76 4.18 9.66 4.18 5.38C4.18 4.85 4.39 4.34 4.76 3.97C5.13 3.6 5.64 3.39 6.17 3.39H8.25C8.39 3.39 8.52 3.44 8.62 3.53C8.72 3.62 8.78 3.74 8.8 3.88L9.07 5.62C9.1 5.78 9.08 5.94 9.02 6.08C8.96 6.22 8.86 6.34 8.73 6.42L7.21 7.21C7.85 8.58 8.77 9.8 9.93 10.8C10.93 11.96 12.15 12.88 13.52 13.52L14.31 12C14.39 11.87 14.51 11.77 14.65 11.71C14.79 11.65 14.95 11.63 15.11 11.66L16.85 11.93C16.99 11.95 17.11 12.01 17.2 12.11C17.29 12.21 17.34 12.34 17.34 12.48L17.34 14.56C17.34 15.09 17.13 15.6 16.76 15.97C16.39 16.34 15.88 16.55 15.35 16.55" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>+54 9 11 1111-1111</span>
                </div>
              </div>
              
              <div className="footer-social-modern">
                <h6>Seguinos</h6>
                <div className="social-links">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="currentColor" strokeWidth="2"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook" title="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter" title="Twitter">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M23 3A10.9 10.9 0 0 1 20.1 4.1A4.48 4.48 0 0 0 22.46 1.69A9 9 0 0 1 19.36 3A4.48 4.48 0 0 0 16.1 2A4.48 4.48 0 0 0 11.62 6.48A12.94 12.94 0 0 1 2.64 2.13A4.48 4.48 0 0 0 4.04 9.72A4.48 4.48 0 0 1 2.4 9.17V9.24A4.48 4.48 0 0 0 6.04 13.65A4.48 4.48 0 0 1 4.44 14A4.48 4.48 0 0 0 8.64 17.16A9 9 0 0 1 1.17 19.36A12.94 12.94 0 0 0 8 21C16.5 21 21.17 14 21.17 7.65C21.17 7.25 21.17 6.85 21.15 6.45A9.18 9.18 0 0 0 23 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M16 8A6 6 0 0 1 22 14V21H18V14A2 2 0 0 0 14 14V21H10V9H14V11A6 6 0 0 1 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
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
            <div className="footer-badges">
              <span className="badge-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Seguro
              </span>
              <span className="badge-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Rápido
              </span>
              <span className="badge-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confiable
              </span>
            </div>
          </div>
        </div>
      </div>
    {/* Botón flotante para volver arriba solo si está cerca del fondo */}
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

