import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';
import DeleteModal from '../Component/DeleteModal.jsx';

const API_URL = 'http://localhost:3001/api'; // Backend URL

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
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]);
  const [mensajesEnviados, setMensajesEnviados] = useState([]);
  const [activeTab, setActiveTab] = useState('articulos');
  const [respuestaMensaje, setRespuestaMensaje] = useState({}); // nuevo estado para las respuestas por mensaje
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: ''
  });

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuario) {
      navigate("/login");
    } else {
      let imagenUrl;
      if (usuario.imagen) {
        // Si la imagen es base64
        if (usuario.imagen.startsWith('data:image')) {
          imagenUrl = usuario.imagen;
        }
        // Si la imagen es una ruta
        else {
          imagenUrl = usuario.imagen.startsWith("/images/")
            ? usuario.imagen
            : `/images/${usuario.imagen}`;
        }
      } else {
        imagenUrl = '/images/fotoperfil.jpg';
      }

      setUserData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        ubicacion: usuario.zona || 'Tucumán',
        email: usuario.email,
        imagen: imagenUrl,
        telefono: usuario.telefono,
        calificacion: usuario.calificacion,
        transacciones: usuario.transacciones || [],
        id: usuario.id,
      });

      fetch(`${API_URL}/products/user/${usuario.id}`)
        .then((res) => res.json())
        .then((data) => {
          setUserListings(data);
        })
        .catch((error) => {
          console.error("❌ Error al obtener productos:", error);
        });

      // Propuestas recibidas
      fetch(`${API_URL}/messages/${usuario.id}`)
        .then(res => res.json())
        .then(mensajesData => {
          setMensajesRecibidos(mensajesData);
        })
        .catch(error => {
          console.error("❌ Error al obtener mensajes recibidos:", error);
        });

      // Propuestas enviadas
      fetch(`${API_URL}/messages/enviados/${usuario.id}`)
        .then(res => res.json())
        .then(mensajesData => {
          setMensajesEnviados(mensajesData);
        })
        .catch(error => {
          console.error("❌ Error al obtener mensajes enviados:", error);
        });
    }
  }, [navigate, location]);

  useEffect(() => {
    if (location.state?.nuevoMensaje) {
      const nuevoMensaje = location.state.nuevoMensaje;
      setMensajesRecibidos(prevMensajes => {
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

  const handleEliminarProducto = (producto) => {
    setDeleteModal({
      isOpen: true,
      productId: producto.id,
      productTitle: producto.title
    });
  };

  const confirmDelete = () => {
    const id = deleteModal.productId;
    fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al eliminar el producto");
        }
        setUserListings(prev => prev.filter(p => p.id !== id));
        setDeleteModal({ isOpen: false, productId: null, productTitle: '' });
      })
      .catch((err) => {
        console.error("❌ Error al eliminar producto:", err);
      });
  };

  const handleEditarProducto = (producto) => {
    navigate(`/editar-producto/${producto.id}`);
  };

  const handleEditClick = () => navigate('/editar');

  // Maneja el cambio de texto en la respuesta de un mensaje
  const handleRespuestaChange = (id, texto) => {
    setRespuestaMensaje(prev => ({ ...prev, [id]: texto }));
  };

  // Maneja el envío de la respuesta a un mensaje
  const handleEnviarRespuesta = (id) => {
    const respuesta = respuestaMensaje[id];
    if (!respuesta || respuesta.trim() === '') {
      alert("Por favor, escribe una respuesta antes de enviar.");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    const mensajeOriginal = mensajesRecibidos.find(m => m.id === id);

    const nuevoMensaje = {
      de: usuario.nombre + ' ' + usuario.apellido,
      deId: usuario.id,
      paraId: mensajeOriginal.deId,
      paraNombre: mensajeOriginal.de,
      productoOfrecido: `Respuesta a: ${mensajeOriginal.productoOfrecido}`,
      descripcion: respuesta,
      condiciones: '',
      imagenNombre: '',
    };

    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoMensaje)
    })
    .then(response => response.json())
    .then(data => {
      setMensajesRecibidos(prev => [...prev, {
        ...data,
        nombreRemitente: nuevoMensaje.de,
        fecha: new Date().toLocaleString()
      }]);
      setRespuestaMensaje(prev => ({ ...prev, [id]: '' }));
    })
    .catch(error => {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    });
  };

  return (
    <div className="perfil-usuario-container">
      <Header search={false} />
      <button className="btn-menu" style={{ margin: 10 }} onClick={() => navigate("/")}>
        ← Inicio
      </button>

      <div className="perfil-usuario-content">
        <div className="perfil-header">
          <div className="perfil-imagen">
            <img 
              src={userData.imagen || '/images/fotoperfil.jpg'} 
              alt="Foto de perfil" 
              onError={(e) => {
                e.target.onerror = null; // Prevenir loop infinito
                e.target.src = '/images/fotoperfil.jpg';
              }}
            />
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
              <button className="btn-publicar" onClick={() => navigate("/publicarproducto")} style={{ marginBottom: '1rem' }}>
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
                          <button className="btn-editar-producto" onClick={() => handleEditarProducto(producto)}>✏️ Editar</button>
                          <button className="btn-eliminar-producto" onClick={() => handleEliminarProducto(producto)}>🗑️ Eliminar</button>
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
                <p>No tienes transacciones aún.</p>
              ) : (
                <ul>
                  {userData.transacciones.map((transaccion, index) => (
                    <li key={index}>
                      <strong>{transaccion.title}</strong> - {transaccion.descripcion} - Fecha: {transaccion.fecha}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mis-mensajes">
              <h2>Propuestas recibidas</h2>
              {mensajesRecibidos.length === 0 ? (
                <p>No tienes propuestas recibidas.</p>
              ) : (
                mensajesRecibidos.map((mensaje) => (
                  <div key={mensaje._id} className="mensaje-card">
                    <div className="mensaje-header">
                      <div className="mensaje-avatar">📩</div>
                      <div className="mensaje-info">
                        <div className="mensaje-campo"><strong>De:</strong> {mensaje.de}</div>
                        <div className="mensaje-campo mensaje-producto"><strong>Producto de Interés:</strong> {mensaje.productoTitle}</div>
                        <div className="mensaje-campo"><strong>Producto ofrecido:</strong> {mensaje.productoOfrecido}</div>
                      </div>
                    </div>
                    <div className="mensaje-campo"><strong>Propuesta:</strong> {mensaje.condiciones}</div>
                    <div className="mensaje-fecha">🗓️ {mensaje.createdAt ? new Date(mensaje.createdAt).toLocaleString() : ''}</div>
                    {mensaje.imagenNombre && (
                      <img
                        className="mensaje-img"
                        src={mensaje.imagenNombre.startsWith('data:image') ? mensaje.imagenNombre : `/images/${mensaje.imagenNombre}`}
                        alt={`Imagen de ${mensaje.productoOfrecido}`}
                      />
                    )}
                    <button className="btn-conversar" style={{marginTop: '1rem'}}>Abrir Chat</button>
                  </div>
                ))
              )}
              <h2>Propuestas enviadas</h2>
              {mensajesEnviados.length === 0 ? (
                <p>No has enviado propuestas.</p>
              ) : (
                mensajesEnviados.map((mensaje) => (
                  <div key={mensaje._id} className="mensaje-card">
                    <div className="mensaje-header">
                      <div className="mensaje-avatar">✉️</div>
                      <div className="mensaje-info">
                        <div className="mensaje-campo"><strong>Para:</strong> {mensaje.paraNombre}</div>
                        <div className="mensaje-campo mensaje-producto"><strong>Producto de Interés:</strong> {mensaje.productoTitle}</div>
                        <div className="mensaje-campo"><strong>Producto ofrecido:</strong> {mensaje.productoOfrecido}</div>
                      </div>
                    </div>
                    <div className="mensaje-campo"><strong>Propuesta:</strong> {mensaje.condiciones}</div>
                    <div className="mensaje-fecha">🗓️ {mensaje.createdAt ? new Date(mensaje.createdAt).toLocaleString() : ''}</div>
                    {mensaje.imagenNombre && (
                      <img
                        className="mensaje-img"
                        src={mensaje.imagenNombre.startsWith('data:image') ? mensaje.imagenNombre : `/images/${mensaje.imagenNombre}`}
                        alt={`Imagen de ${mensaje.productoOfrecido}`}
                      />
                    )}
                    <button className="btn-conversar" style={{marginTop: '1rem'}}>Conversar</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productTitle: '' })}
        onConfirm={confirmDelete}
        productTitle={deleteModal.productTitle}
      />
    </div>
  );
};

export default PerfilUsuario;