import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import TransactionCard from '../Component/TransactionCard';
import '../styles/PerfilPublico.css';

const API_URL = 'http://localhost:3001/api';

const PerfilPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para consultar por un artículo
  const handleConsultarArticulo = (producto) => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) {
      alert('Debes iniciar sesión para consultar por un artículo');
      navigate('/login');
      return;
    }
    
    // Navegar a la página de intercambio con los datos del producto
    navigate('/intercambiar', {
      state: {
        productoId: producto._id,
        productoTitle: producto.nombre,
        productoImage: producto.imagenes?.[0] || '/images/placeholder-product.jpg',
        productoDescription: producto.descripcion,
        ownerId: id,
        ownerNombre: usuario.nombre,
        ownerApellido: usuario.apellido || ''
      }
    });
  };

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando datos para usuario ID:', id);
        console.log('🌐 API_URL:', API_URL);
        
        // Obtener datos del usuario
        console.log('📡 Fetching usuario:', `${API_URL}/users/${id}`);
        const resUsuario = await fetch(`${API_URL}/users/${id}`);
        console.log('📊 Respuesta usuario status:', resUsuario.status);
        
        if (!resUsuario.ok) {
          const errorText = await resUsuario.text();
          console.error('❌ Error respuesta usuario:', errorText);
          throw new Error(`No se pudo cargar el perfil del usuario: ${resUsuario.status}`);
        }
        
        const dataUsuario = await resUsuario.json();
        console.log('✅ Datos usuario cargados:', dataUsuario);
        setUsuario(dataUsuario);

        // Obtener productos del usuario
        console.log('📡 Fetching productos:', `${API_URL}/products?owner=${id}`);
        const resProductos = await fetch(`${API_URL}/products?owner=${id}`);
        console.log('📊 Respuesta productos status:', resProductos.status);
        
        if (!resProductos.ok) {
          const errorText = await resProductos.text();
          console.error('❌ Error respuesta productos:', errorText);
          throw new Error(`No se pudieron cargar los productos: ${resProductos.status}`);
        }
        
        const dataProductos = await resProductos.json();
        console.log('✅ Datos productos cargados:', dataProductos);
        setProductos(dataProductos);
        
        console.log('🎉 Carga de datos completada exitosamente');
      } catch (err) {
        console.error('💥 Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatosUsuario();
    } else {
      console.error('❌ No se proporcionó ID de usuario');
    }
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
              src={usuario.imagen || '/images/fotoperfil.jpg'} 
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
                <span 
                  className="calificaciones-link"
                  onClick={() => navigate(`/calificaciones/${id}`)}
                >
                  ({usuario.cantidadCalificaciones || 0} calificaciones)
                </span>
              </div>
              
              {/* Estadísticas adicionales */}
              <div className="perfil-stats">
                <div className="stat-item">
                  <span className="stat-number">{usuario.cantidadTransacciones || 0}</span>
                  <span className="stat-label">Intercambios</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{productos.length}</span>
                  <span className="stat-label">Productos</span>
                </div>
              </div>
            </div>
            
            {/* Información de contacto visible */}
            <div className="perfil-contacto">
              {usuario.email && (
                <p className="contacto-item">
                  <i className="fas fa-envelope"></i> {usuario.email}
                </p>
              )}
              {usuario.telefono && (
                <p className="contacto-item">
                  <i className="fas fa-phone"></i> {usuario.telefono}
                </p>
              )}
              {usuario.mostrarContacto === true && (
                <p className="contacto-publico">
                  <i className="fas fa-check-circle"></i> Contacto público verificado
                </p>
              )}
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
          {/* Filtrar productos activos (no intercambiados) */}
          {productos.filter(p => !p.intercambiado).length > 0 ? (
            <div className="productos-grid">
              {productos.filter(p => !p.intercambiado).map((producto, idx) => (
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
                    <button 
                      className="btn-consultar-articulo"
                      onClick={() => handleConsultarArticulo(producto)}
                    >
                      <i className="fas fa-exchange-alt"></i>
                      Consultar por este artículo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', marginTop: '2rem' }}>Este usuario no tiene productos activos publicados.</p>
          )}
        </section>

        {/* Estadísticas adicionales */}
        <section className="perfil-estadisticas">
          <h3>Actividad del usuario</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{usuario.cantidadCalificaciones || 0}</div>
              <div className="stat-label">Calificaciones recibidas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{usuario.cantidadTransacciones || 0}</div>
              <div className="stat-label">Intercambios completados</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{productos.length}</div>
              <div className="stat-label">Productos totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{productos.filter(p => !p.intercambiado).length}</div>
              <div className="stat-label">Productos activos</div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PerfilPublico;
