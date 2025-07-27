import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import TransactionCard from '../Component/TransactionCard';
import ProductCard from '../Component/ProductCard';
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
      <Header isHome={false} />
      
      <main className="perfil-publico-container">
        <section className="perfil-header-premium">
  <div className="perfil-card-premium">
    {/* Avatar Premium */}
    <div className="avatar-container-premium">
      <div className="avatar-wrapper-premium">
        <img
          src={usuario.imagen || '/images/fotoperfil.jpg'}
          alt="Foto de perfil"
          className="avatar-image-premium"
          onError={e => { e.target.onerror = null; e.target.src = '/images/fotoperfil.jpg'; }}
        />
        <div className="avatar-ring-premium"></div>
      </div>
    </div>

    {/* Información Principal */}
    <div className="perfil-main-info-premium">
      <h1 className="perfil-nombre-premium">
        {`${(usuario.nombre || '').trim()} ${(usuario.apellido || '').trim()}`.trim()}
      </h1>

      {/* Stats Premium - Estructura mejorada */}
      <div className="perfil-stats-premium">
        {/* Tarjeta de Calificación */}
        <div className="stat-card-premium" style={{ '--delay': '0s' }}>
          <button
            className="rating-button-premium"
            onClick={() => navigate(`/calificaciones/${id}`)}
            aria-label="Ver calificaciones"
          >
            <div className="stat-svg-icon stat-svg-star">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFD700"/>
              </svg>
            </div>
            <div className="rating-content-premium">
              <span className="rating-number-premium">
                {(usuario.promedioCalificaciones || usuario.calificacion || 0).toFixed(1)}
              </span>
            </div>
          </button>
          <span className="stat-label-premium">Calificación</span>
        </div>
        
        {/* Tarjeta de Intercambios */}
        <div className="stat-card-premium" style={{ '--delay': '0.08s' }}>
          <div className="stat-svg-icon stat-svg-exchange">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 17v-2a4 4 0 0 0-4-4H5"/>
              <polyline points="7 15 5 17 7 19"/>
              <path d="M3 7v2a4 4 0 0 0 4 4h12"/>
              <polyline points="17 9 19 7 17 5"/>
            </svg>
          </div>
          <div className="stat-number-premium">{productos.filter(p => p.intercambiado).length}</div>
          <span className="stat-label-premium">Intercambios</span>
        </div>
        
        {/* Tarjeta de Productos Activos */}
        <div className="stat-card-premium" style={{ '--delay': '0.16s' }}>
          <div className="stat-svg-icon stat-svg-active">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#e0f7fa"/>
              <circle cx="12" cy="12" r="5" fill="#06b6d4"/>
            </svg>
          </div>
          <div className="stat-number-premium">{productos.filter(p => !p.intercambiado).length}</div>
          <span className="stat-label-premium">Productos activos</span>
        </div>
        
        {/* Tarjeta de Productos Publicados */}
        <div className="stat-card-premium" style={{ '--delay': '0.24s' }}>
          <div className="stat-svg-icon stat-svg-published">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7b2ff2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#ede9fe"/>
              <path d="M8 8h8v8H8z" fill="#7b2ff2"/>
            </svg>
          </div>
          <div className="stat-number-premium">{productos.length}</div>
          <span className="stat-label-premium">Productos publicados</span>
        </div>
      </div>


      {/* Detalles de Contacto Premium */}
      <div className="perfil-detalles-premium">
        <div className="detalle-item-premium">
          <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="detalle-label-premium">Provincia:</span>
          <span className="detalle-value-premium">{(usuario.provincia || usuario.ubicacion || '').replace(/^Argentina\s*/i, '') || 'Tucumán'}</span>
        </div>
        {usuario.mostrarContacto ? (
          <>
            <div className="detalle-item-premium">
              <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="detalle-label-premium">Email:</span>
              <span className="detalle-value-premium">{usuario.email || 'No disponible'}</span>
            </div>
            <div className="detalle-item-premium">
              <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="detalle-label-premium">Teléfono:</span>
              <span className="detalle-value-premium">{usuario.telefono || 'Privado'}</span>
            </div>
          </>
        ) : (
          <div className="detalle-item-premium privacy-notice">
            <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="detalle-value-premium privacy-text">Información de contacto privada</span>
          </div>
        )}
      </div>
    </div>
  </div>
</section>
        
        <section className="perfil-productos">
          <h2 className="seccion-titulo-premium">Productos Disponibles</h2>
          {/* Filtrar productos activos (no intercambiados) */}
          {productos.filter(p => !p.intercambiado).length > 0 ? (
            <div className="productos-grid">
              {productos.filter(p => !p.intercambiado).map((producto, idx) => (
  <ProductCard
    key={producto._id || producto.id || idx}
    id={producto._id || producto.id}
    title={producto.nombre || producto.title}
    description={producto.descripcion || producto.description}
    categoria={producto.categoria}
    image={producto.imagenes?.[0] || producto.image || '/images/placeholder-product.jpg'}
    fechaPublicacion={producto.fechaPublicacion || producto.createdAt}
    provincia={producto.provincia || producto.ubicacion}
    ownerName={producto.owner?.nombre || producto.ownerName || usuario.nombre}
    ownerId={producto.owner?.id || producto.ownerId || usuario._id}
    onConsultar={() => handleConsultarArticulo(producto)}
  />
))}
            </div>
          ) : (
            <p style={{ color: '#888', marginTop: '2rem' }}>Este usuario no tiene productos activos publicados.</p>
          )}
        </section>

        {/* Estadísticas adicionales premium */}
        <section className="perfil-estadisticas-premium">
          <h3 className="estadisticas-titulo-premium">Estadísticas del Perfil</h3>
          <div className="perfil-stats-premium">
            {/* Calificaciones recibidas */}
            <div className="stat-card-premium" style={{ '--delay': '0s' }}>
              <button
                className="rating-button-premium"
                onClick={() => navigate(`/calificaciones/${id}`)}
                aria-label="Ver calificaciones recibidas"
              >
                <div className="stat-svg-icon stat-svg-star">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFD700"/>
                  </svg>
                </div>
                <div className="stat-number-premium">{Array.isArray(usuario.calificaciones) ? usuario.calificaciones.length : 0}</div>
              </button>
              <span className="stat-label-premium">Calificaciones recibidas</span>
            </div>
            
            {/* Intercambios completados */}
            <div className="stat-card-premium" style={{ '--delay': '0.08s' }}>
              <div className="stat-svg-icon stat-svg-exchange">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 17v-2a4 4 0 0 0-4-4H5"/>
                  <polyline points="7 15 5 17 7 19"/>
                  <path d="M3 7v2a4 4 0 0 0 4 4h12"/>
                  <polyline points="17 9 19 7 17 5"/>
                </svg>
              </div>
              <div className="stat-number-premium">{productos.filter(p => p.intercambiado).length}</div>
              <span className="stat-label-premium">Intercambios completados</span>
            </div>
            
            {/* Productos activos */}
            <div className="stat-card-premium" style={{ '--delay': '0.16s' }}>
              <div className="stat-svg-icon stat-svg-active">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="#e0f7fa"/>
                  <circle cx="12" cy="12" r="5" fill="#06b6d4"/>
                </svg>
              </div>
              <div className="stat-number-premium">{productos.filter(p => !p.intercambiado).length}</div>
              <span className="stat-label-premium">Productos activos</span>
            </div>
            
            {/* Productos publicados */}
            <div className="stat-card-premium" style={{ '--delay': '0.24s' }}>
              <div className="stat-svg-icon stat-svg-published">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7b2ff2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="4" fill="#ede9fe"/>
                  <path d="M8 8h8v8H8z" fill="#7b2ff2"/>
                </svg>
              </div>
              <div className="stat-number-premium">{productos.length}</div>
              <span className="stat-label-premium">Productos publicados</span>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PerfilPublico;
