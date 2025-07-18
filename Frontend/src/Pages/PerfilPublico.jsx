import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import TransactionCard from '../Component/TransactionCard';
import '../styles/PerfilPublico.css';

const API_URL = 'http://localhost:3001/api';

const PerfilPublico = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        // Obtener datos del usuario
        const resUsuario = await fetch(`${API_URL}/users/${id}`);
        if (!resUsuario.ok) throw new Error('No se pudo cargar el perfil del usuario');
        const dataUsuario = await resUsuario.json();
        setUsuario(dataUsuario);

        // Obtener productos del usuario
        const resProductos = await fetch(`${API_URL}/products?owner=${id}`);
        if (!resProductos.ok) throw new Error('No se pudieron cargar los productos');
        const dataProductos = await resProductos.json();
        setProductos(dataProductos);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="not-found">
        <h2>Usuario no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="perfil-publico">
      <Header />
      
      <main className="perfil-publico-container">
        <section className="perfil-header">
          <div className="perfil-avatar-container">
            <img 
              src={usuario.imagenPerfil || '/images/fotoperfil.jpg'} 
              alt={`${usuario.nombre || 'Usuario'}'s avatar`}
              className="perfil-avatar"
            />
          </div>
          
          <div className="perfil-info">
            <h1>{usuario.nombre || 'Usuario'}</h1>
            {usuario.ubicacion && (
              <p className="perfil-ubicacion">
                <i className="fas fa-map-marker-alt"></i> {usuario.ubicacion}
              </p>
            )}
            
            <div className="perfil-reputacion">
              <div className="estrellas">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star} 
                    className={`fas fa-star ${star <= (usuario.promedioCalificaciones || 0) ? 'active' : ''}`}
                  ></i>
                ))}
                <span>({usuario.cantidadCalificaciones || 0} calificaciones)</span>
              </div>
            </div>
            
            {usuario.biografia && (
              <div className="perfil-biografia">
                <h3>Sobre mí</h3>
                <p>{usuario.biografia}</p>
              </div>
            )}
          </div>
        </section>
        
        <section className="perfil-productos">
          <h2>Productos publicados</h2>
          {productos.length > 0 ? (
            <div className="productos-grid">
              {productos.map((producto, idx) => (
                <div key={producto._id || idx} className="product-card">
                  <img 
                    src={producto.imagenes?.[0] || '/images/placeholder-product.jpg'} 
                    alt={producto.nombre}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3>{producto.nombre}</h3>
                    <p className="product-category">{producto.categoria}</p>
                    <p className="product-description">
                      {producto.descripcion?.length > 100 
                        ? `${producto.descripcion.substring(0, 100)}...` 
                        : producto.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="sin-productos">Este usuario aún no ha publicado productos.</p>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PerfilPublico;
