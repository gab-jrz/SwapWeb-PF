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
  const [respuestaMensaje, setRespuestaMensaje] = useState({}); // nuevo estado para las respuestas por mensaje

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuario) {
      navigate("/login");
    } else {
      const imagenUrl = usuario.imagen
        ? usuario.imagen.startsWith("/images/")
          ? usuario.imagen
          : `/images/${usuario.imagen}`
        : '/images/fotoperfil.jpg';

      setUserData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        ubicacion: usuario.ubicacion || 'Tucumán',
        email: usuario.email,
        imagen: imagenUrl,
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
  }, [navigate, location]);

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

    // Crear nuevo mensaje de respuesta
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    const mensajeOriginal = mensajes.find(m => m.id === id);

    const nuevoMensaje = {
      id: Date.now(), // id único temporal
      de: usuario.nombre + ' ' + usuario.apellido,
      nombreRemitente: usuario.nombre + ' ' + usuario.apellido,
      paraId: mensajeOriginal.deId || null, // suponiendo que el mensaje original tiene un id del remitente
      paraNombre: mensajeOriginal.de,
      productoOfrecido: `Respuesta a: ${mensajeOriginal.productoOfrecido}`,
      descripcion: respuesta,
      condiciones: '',
      imagenNombre: '',
      fecha: new Date().toLocaleString(),
    };

    setMensajes(prev => [...prev, nuevoMensaje]);
    setRespuestaMensaje(prev => ({ ...prev, [id]: '' })); // limpiar textarea

    // Aquí podrías agregar fetch POST para guardar en backend si lo necesitas
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
            <img src={userData.imagen} alt="Foto de perfil" />
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
                          <button className="btn-eliminar-producto" onClick={() => handleEliminarProducto(producto.id)}>🗑️ Eliminar</button>
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
              <h2>Mensajes</h2>
              {mensajes.length === 0 ? (
                <p>No tienes mensajes nuevos.</p>
              ) : (
                mensajes.map((mensaje) => (
                  <div key={mensaje.id} className="mensaje-card" style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>
                    
                    <p><strong>De:</strong> {mensaje.nombreRemitente}</p>
                    <p><strong>Producto de Interes :</strong> {mensaje.productoTitle}</p>
                    <p><strong>Producto ofrecido:</strong> {mensaje.productoOfrecido}</p>
                    <p><strong>Caracteristicas:</strong> {mensaje.descripcion}</p>
                    
                    <p><strong>Fecha:</strong> {mensaje.fecha}</p>
                    {mensaje.imagenNombre && (
                      <img
                        src={`/images/${mensaje.imagenNombre}`}
                        alt={`Imagen de ${mensaje.productoOfrecido}`}
                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
                      />
                    )}
                    <textarea
                      placeholder="Escribe tu respuesta aquí..."
                      value={respuestaMensaje[mensaje.id] || ''}
                      onChange={(e) => handleRespuestaChange(mensaje.id, e.target.value)}
                      style={{ width: '100%', marginTop: '10px' }}
                    />
                    <button onClick={() => handleEnviarRespuesta(mensaje.id)} style={{ marginTop: '5px' }}>
                      Enviar respuesta
                    </button>
                  </div>
                ))
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
