import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import { getProduct } from "../services/api";
import "../styles/DetalleProducto.css";

const API_URL = 'http://localhost:3001/api';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProducto(data);
        
        // Obtener información del dueño del producto
        const ownerResponse = await fetch(`${API_URL}/users/${data.ownerId}`);
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setOwner(ownerData);
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar el producto. Por favor, intenta de nuevo más tarde.');
        console.error("Error al obtener el producto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChat = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    
    if (!usuarioActual) {
      alert("Debes iniciar sesión para consultar por este artículo");
      navigate("/login");
      return;
    }

    if (usuarioActual.id === producto.ownerId) {
      alert("No puedes consultar por tu propio producto");
      return;
    }

    navigate("/intercambiar", {
      state: {
        productoId: producto.id,
        productoTitle: producto.title,
        productoImage: producto.image,
        productoDescription: producto.description,
        ownerId: producto.ownerId,
        ownerNombre: owner?.nombre || "",
        ownerApellido: owner?.apellido || ""
      }
    });
  };

  const handleFavorite = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    
    if (!usuarioActual) {
      setShowLoginModal(true);
      return;
    }

    // Aquí iría la lógica para agregar/quitar de favoritos
    setIsFavorite(!isFavorite);
    // TODO: Implementar llamada a la API para guardar en favoritos
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  if (loading) return <div className="detalle-container"><Header /><p className="text-center">Cargando producto...</p><Footer /></div>;
  if (error) return <div className="detalle-container"><Header /><p className="text-center text-danger">{error}</p><Footer /></div>;
  if (!producto) return <div className="detalle-container"><Header /><p className="text-center">Producto no encontrado</p><Footer /></div>;

  return (
    <div className="detalle-container">
      {/* Header simplificado */}
      <Header search={false} />
      
      <div className="detalle-contenido">
        {/* Navegación sutil arriba de la card */}
        <div className="detalle-nav-sutil">
          <button className="nav-link" onClick={() => navigate("/")}>
            ← Volver al inicio
          </button>
          
          <button className="nav-link reportar" onClick={() => setShowReportModal(true)}>
            Reportar publicación
          </button>
        </div>
        
        <div className="detalle-card">
          {/* Imagen del producto */}
          <div className="producto-imagen-container">
            <img
              src={producto.image}
              alt={producto.title}
              className="producto-imagen"
            />
          </div>
          
          {/* Información del producto */}
          <div className="producto-info">
            <div className="categoria-badge">
              {producto.categoria}
            </div>
            
            <div className="titulo-con-favoritos">
              <h1 className="producto-titulo">{producto.title}</h1>
              
              {/* Botón de favoritos integrado */}
              <button 
                className={`btn-favorito-integrado ${isFavorite ? 'favorito-activo' : ''}`}
                onClick={handleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                ⭐
              </button>
            </div>
            
            <div className="producto-descripcion">
              <p>{producto.description}</p>
            </div>
            
            {/* Características del producto */}
            {producto.caracteristicas && producto.caracteristicas.length > 0 && (
              <div className="producto-caracteristicas-detalle">
                <h4 className="caracteristicas-title">Características</h4>
                <ul className="caracteristicas-list-detalle">
                  {producto.caracteristicas.map((item, idx) => (
                    <li key={idx} className="caracteristica-li">
                      <span className="caracteristica-icon">✔️</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="producto-caracteristicas">
              <h3>Características</h3>
              <ul className="caracteristicas-lista">
                {(producto.caracteristicas && producto.caracteristicas.length > 0) 
                  ? producto.caracteristicas.map((caracteristica, index) => (
                      <li key={index}>{caracteristica}</li>
                    ))
                  : [
                      'Estado: Muy buen estado',
                      'Incluye cargador original',
                      'Sin rayones visibles',
                      'Funciona perfectamente'
                    ].map((caracteristica, index) => (
                      <li key={index}>{caracteristica}</li>
                    ))
                }
              </ul>
            </div>
            
            {/* Atributos esenciales */}
            <div className="atributos-esenciales">
              <div className="atributo">
                <span className="atributo-label">Fecha de publicación:</span>
                <span className="atributo-valor">{formatDate(producto.fechaPublicacion)}</span>
              </div>
              
              {owner && (
                <div className="atributo">
                  <span className="atributo-label">Propietario:</span>
                  <span className="atributo-valor clickeable" onClick={() => navigate(`/perfil-publico/${owner._id}`)}>
                    {owner.nombre} {owner.apellido}
                  </span>
                </div>
              )}
              
              <div className="atributo">
                <span className="atributo-label">Provincia:</span>
                <span className="atributo-valor">{producto.provincia || 'No especificada'}</span>
              </div>
            </div>
            
            {/* Solo un botón: Consultar */}
            <div className="producto-accion">
              <button className="btn-consultar-producto" onClick={handleChat}>
                Consultar por este artículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para usuarios no registrados */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registro requerido</h3>
              <button 
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Es necesario registrarse para agregar artículos a favoritos.</p>
              <p>¿Te gustaría crear una cuenta ahora?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-cancelar"
                onClick={() => setShowLoginModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-registrar"
                onClick={handleLoginRedirect}
              >
                Ir a registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para reportar */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reportar artículo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>¿Por qué deseas reportar este artículo?</p>
              <select className="report-select">
                <option value="">Selecciona una razón</option>
                <option value="spam">Spam o contenido no deseado</option>
                <option value="fake">Producto falso o engañoso</option>
                <option value="inappropriate">Contenido inapropiado</option>
                <option value="other">Otro motivo</option>
              </select>
              <textarea 
                className="report-textarea"
                placeholder="Describe el problema (opcional)"
              ></textarea>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-cancelar"
                onClick={() => setShowReportModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-reportar"
                onClick={() => {
                  // TODO: Implementar lógica de reporte
                  alert('Reporte enviado. Gracias por tu colaboración.');
                  setShowReportModal(false);
                }}
              >
                Enviar reporte
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DetalleProducto;
