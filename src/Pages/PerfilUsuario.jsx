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
    ubicacion: "",
    email: "",
    telefono: "",
    calificacion: 0,
    id: null
  });

  const [userListings, setUserListings] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [activeTab, setActiveTab] = useState('articulos');

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuario) {
      navigate("/login");
    } else {
      setUserData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        ubicacion: usuario.ubicacion,
        email: usuario.email,
        telefono: usuario.telefono,
        calificacion: usuario.calificacion,
        transacciones: usuario.transacciones || [],
        id: usuario.id,
      });

      fetch("http://localhost:3000/products")
        .then((res) => res.json())
        .then((data) => {
          const productosDelUsuario = data.filter((producto) => Number(producto.ownerId) === Number(usuario.id));
          setUserListings(productosDelUsuario);
        })
        .catch((error) => {
          console.error("❌ Error al obtener productos:", error);
        });

      fetch("http://localhost:3000/mensajes")
        .then(res => res.json())
        .then(mensajesData => {
          const mensajesFiltrados = mensajesData
            .filter(m => Number(m.paraId) === Number(usuario.id))
            .map(mensaje => ({
              ...mensaje,
              nombreRemitente: mensaje.de || 'Usuario desconocido',
              productoTitle: mensaje.productoTitle || '',
              imagenNombre: mensaje.imagenNombre || '',
              fecha: mensaje.fecha || '',
            }));
          setMensajes(mensajesFiltrados);
        })
        .catch(error => {
          console.error("❌ Error al obtener mensajes:", error);
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.nuevoMensaje) {
      const nuevoMensaje = location.state.nuevoMensaje;
      setMensajes((prevMensajes) => {
        const existe = prevMensajes.some(msg =>
          msg.productoOfrecido === nuevoMensaje.productoOfrecido &&
          msg.descripcion === nuevoMensaje.descripcion &&
          msg.condiciones === nuevoMensaje.condiciones &&
          msg.imagen === nuevoMensaje.imagen
        );
        return existe ? prevMensajes : [...prevMensajes, nuevoMensaje];
      });
    }
  }, [location.state]);

  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuarioActual) {
      localStorage.setItem("usuarioActual", JSON.stringify({
        ...usuarioActual,
        transacciones: userData.transacciones
      }));
    }
  }, [userData.transacciones]);

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleMarcarComoIntercambiado = (producto) => {
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
  };

  const handleEliminarProducto = (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (confirmacion) {
      fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            setUserListings(prev => prev.filter(p => p.id !== id));
          } else {
            throw new Error("Error al eliminar");
          }
        })
        .catch((err) => console.error("❌ Error al eliminar producto:", err));
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
            <img src="/images/fotoperfil.jpeg" alt="Foto de perfil" />
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
              <p><strong>Ubicación:</strong> {userData.ubicacion || 'Argentina, Tucumán'}</p>
              <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
              <p><strong>Teléfono:</strong> {userData.telefono || '0381-5088-999'}</p>
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
              {userListings.length === 0 ? (
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
                        <span className="categoria">{producto.categoria}</span>
                        <div className="acciones-producto" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                          <button className="btn-intercambio" onClick={() => handleMarcarComoIntercambiado(producto)}>✅ Marcar como Intercambiado</button>
                          <button className="btn-editar-producto" onClick={() => handleEditarProducto(producto)}>✏️ Editar Producto</button>
                          <button className="btn-eliminar-producto" onClick={() => handleEliminarProducto(producto.id)}>🗑️ Eliminar Producto</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transacciones' && (
            <div className="transacciones">
              <h2>Mis Transacciones</h2>
              {userData.transacciones.length === 0 ? (
                <p>No tienes transacciones aún.</p>
              ) : (
                <ul className="transacciones-lista">
                  {userData.transacciones.map((t) => (
                    <li key={t.id} className="transaccion-item">
                      <strong>{t.title}</strong><br />
                      <span>Fecha: {t.fecha}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mensajes-container">
              <h2>Mensajes</h2>
              {mensajes.length === 0 ? (
                <p>No tienes mensajes aún.</p>
              ) : (
                <ul className="mensajes-lista">
                  {mensajes.map((msg, i) => (
                    <li key={i} className="mensaje-item">
                      <strong>De:</strong> {msg.nombreRemitente}<br />
                      <strong>Producto Ofrecido:</strong> {msg.productoOfrecido}<br />
                      <strong>Descripción:</strong> {msg.descripcion}<br />
                      <strong>Condiciones:</strong> {msg.condiciones}<br />
                      {msg.productoTitle && <><strong>Producto de Interes:</strong> {msg.productoTitle}<br /></>}
                      {msg.imagenNombre && (
                        <div style={{ marginTop: '10px' }}>
                          <strong>Imagen añadida:</strong><br />
                          <img
                            src={msg.imagenNombre.startsWith("data:image") ? msg.imagenNombre : `/images/${msg.imagenNombre}`}
                            alt="Producto ofrecido"
                            style={{ width: '150px', borderRadius: '8px' }}
                          />
                        </div>
                      )}
                      {msg.fecha && <><strong>Fecha de Envío:</strong> {msg.fecha}</>}
                    </li>
                  ))}
                </ul>
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
