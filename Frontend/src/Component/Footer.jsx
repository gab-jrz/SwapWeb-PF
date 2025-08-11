import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container footer-grid">
        <div className="footer-section">
          <h5>Contacto</h5>
          <p>Email: contacto@swapweb.com</p>
          <p>WhatsApp: +54 9 11 1111-1111</p>
        </div>
        <div className="footer-section">
          <h5>Enlaces útiles</h5>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/publicar">Publicar producto</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h5>Seguinos</h5>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">X</a>
          </div>
        </div>
      </div>
      <div className="container text-center mt-3">
        <p className="mb-0">© 2025 SwapWeb. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

