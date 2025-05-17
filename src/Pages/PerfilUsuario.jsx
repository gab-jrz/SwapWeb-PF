// PerfilUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({
    transacciones: [],
    nombre: "",
    apellido: "",
    zona: "",
    email: "",
    calificacion: 0,
    id: null
  });

  const [userListings, setUserListings] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [activeTab, setActiveTab] = useState('articulos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuario) {
      navigate("/login");
    } else {
      setUserData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        zona: usuario.zona,
        email: usuario.email,
        calificacion: usuario.calificacion || 0,
        transacciones: usuario.transacciones || [],
        id: usuario.id,
      });

      // Obtener productos del usuario desde la API de MongoDB
      fetch(`http://localhost:3001/api/products`)
        .then((res) => res.json())
        .then((data) => {
          const productosDelUsuario = data.filter((producto) => Number(producto.ownerId) === Number(usuario.id));
          setUserListings(productosDelUsuario);
          setError(null);
        })
        .catch((error) => {
          console.error("❌ Error al obtener productos:", error);
          setError("Error al cargar los productos. Por favor, intenta de nuevo.");
        })
        .finally(() => {
          setLoading(false);
        });

      // Por ahora, los mensajes se manejarán más adelante
      setMensajes([]);
    }
  }, [navigate]);

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleMarcarComoIntercambiado = async (producto) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${producto.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Error al marcar como intercambiado");
      }

      const nuevaTransaccion = {
        id: producto.id,
        title: producto.title,
        descripcion: producto.description,
        fecha: new Date().toLocaleDateString(),
      };

      setUserData(prev => ({
        ...prev,
        transacciones: [...prev.transacciones, nuevaTransaccion],
      }));
      setUserListings(prev => prev.filter(p => p.id !== producto.id));
    } catch (error) {
      console.error("Error:", error);
      alert("Error al marcar como intercambiado. Por favor, intenta de nuevo.");
    }
  };

  const handleEliminarProducto = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (confirmacion) {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error("Error al eliminar");
        }

        setUserListings(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
        alert("Error al eliminar el producto. Por favor, intenta de nuevo.");
      }
    }
  };

  const handleEditarProducto = (producto) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres editar este producto?");
    if (confirmacion) {
      navigate(`/editar-producto/${producto.id}`);
    }
  };

  const handleEditClick = () => navigate('/editar');

  return (
    <div className="perfil-usuario-container">
      <Header search={false} />
      <button className="btn-menu" style={{ margin: 10 }} onClick={() => navigate("/")}>
        ← Inicio
      </button>

      <div className="perfil-usuario-content">
        <div className="perfil-header">
          <div className="perfil-imagen">
            <img src={userData.imagen || "/images/default.jpg"} alt="Foto de perfil" />
          </div>
          <div className="perfil-info">
            <h1>{`${capitalize(userData.nombre)} ${capitalize(userData.apellido)}`}</h1>
            <div className="perfil-stats">
              <div className="stat">
                <span className="stat-value">{userData.calificacion}</span>
                <span className="stat-label">Calificación</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData.transacciones.length}</span>
                <span className="stat-label">Transacciones</span>
              </div>
            </div>
            <div className="perfil-detalles">
              <p><strong>Ubicación:</strong> {userData.zona || 'No especificada'}</p>
              <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
            </div>
            <div className="perfil-acciones">
              <button className="btn-editar" onClick={handleEditClick}>Editar Perfil</button>
              <button className="btn-configuracion" onClick={() => navigate('/configuracion')}>Configuración</button>
            </div>
          </div>
        </div>

        <div className="perfil-tabs">
          <button className={`tab-btn ${activeTab === 'articulos' ? 'active' : ''}`} onClick={() => handleTabChange('articulos')}>Mis Artículos</button>
          <button className={`tab-btn ${activeTab === 'transacciones' ? 'active' : ''}`} onClick={() => handleTabChange('transacciones')}>Mis Transacciones</button>
          <button className={`tab-btn ${activeTab === 'mensajes' ? 'active' : ''}`} onClick={() => handleTabChange('mensajes')}>Mensajes</button>
        </div>

        <div className="perfil-tab-content">
          {activeTab === 'articulos' && (
            <div className="mis-articulos">
              <h2>Mis Artículos</h2>
              <button className="btn-publicar" onClick={() => navigate("/publicar-producto")} style={{ marginBottom: '1rem' }}>
                + Publicar Nuevo Producto
              </button>
              {loading ? (
                <p>Cargando tus artículos...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : userListings.length === 0 ? (
                <p>No has publicado ningún artículo aún.</p>
              ) : (
                <div className="articulos-grid">
                  {userListings.map((producto) => (
                    <div key={producto.id} className="articulo-card">
                      <div className="articulo-imagen">
                        <img src={producto.image} alt={producto.title} />
                      </div>
                      <div className="articulo-info">
                        <h3>{producto.title}</h3>
                        <p>{producto.description}</p>
                        <p><strong>Categoría:</strong> {producto.categoria}</p>
                        <div className="articulo-acciones">
                          <button onClick={() => handleMarcarComoIntercambiado(producto)}>Marcar como Intercambiado</button>
                          <button onClick={() => handleEditarProducto(producto)}>Editar</button>
                          <button onClick={() => handleEliminarProducto(producto.id)}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transacciones' && (
            <div className="mis-transacciones">
              <h2>Mis Transacciones</h2>
              {userData.transacciones.length === 0 ? (
                <p>No tienes transacciones realizadas.</p>
              ) : (
                <div className="transacciones-lista">
                  {userData.transacciones.map((transaccion, index) => (
                    <div key={index} className="transaccion-card">
                      <h3>{transaccion.title}</h3>
                      <p>{transaccion.descripcion}</p>
                      <p><strong>Fecha:</strong> {transaccion.fecha}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mis-mensajes">
              <h2>Mis Mensajes</h2>
              {mensajes.length === 0 ? (
                <p>No tienes mensajes.</p>
              ) : (
                <div className="mensajes-lista">
                  {mensajes.map((mensaje, index) => (
                    <div key={index} className="mensaje-card">
                      <h3>De: {mensaje.nombreRemitente}</h3>
                      <p><strong>Producto:</strong> {mensaje.productoTitle}</p>
                      <p>{mensaje.descripcion}</p>
                      <p><strong>Fecha:</strong> {mensaje.fecha}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PerfilUsuario;
