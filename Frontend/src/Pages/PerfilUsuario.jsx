import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';
import DeleteModal from '../Component/DeleteModal.jsx';
<<<<<<< HEAD
import ConfirmModal from '../Component/ConfirmModal.jsx';
import ChatBubble from '../Component/ChatBubble.jsx';
import TransactionCard from '../Component/TransactionCard.jsx';
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))

const API_URL = 'http://localhost:3001/api'; // Backend URL

const PerfilUsuario = () => {
<<<<<<< HEAD
  // Estado para eliminar transacción
  const [showConfirmDeleteTrans, setShowConfirmDeleteTrans] = useState(false);
  const [transToDelete, setTransToDelete] = useState(null);

  // Estado para edición de mensaje
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const chatMessagesEndRef = React.useRef(null);
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD
    mostrarContacto: true,
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
    id: null
  });

  const [userListings, setUserListings] = useState([]);
<<<<<<< HEAD
  const [mensajes, setMensajes] = React.useState([]);
  const [chatSeleccionado, setChatSeleccionado] = React.useState(null);
  // Estados globales para menús contextuales y confirmaciones
  const [showChatMenu, setShowChatMenu] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [showConfirmChatDelete, setShowConfirmChatDelete] = useState(false);
  const [showConfirmMessageDelete, setShowConfirmMessageDelete] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Manejar cierre del menú contextual de chat
  function handleCloseChatMenu(e) {
    if (!e.target.closest('.chat-list-item')) {
      setShowChatMenu(null);
      document.removeEventListener('mousedown', handleCloseChatMenu);
    }
  }

  // Agrupar mensajes por combinación de productos para formar "chats" y contar no leídos
  const { chats, unreadByChat } = React.useMemo(()=>{
    const agrupado = {};
    const unreadMap = {};
    mensajes.forEach(m=>{
      const titulo1 = m.productoTitle || '(sin título)';
      const titulo2 = m.productoOfrecido || '(sin título)';
      const key = `${titulo1}↔${titulo2}`;
      if(!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(m);
      // contar no leídos para este chat
      const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
      if(usuario && m.paraId === usuario.id && !(m.leidoPor||[]).includes(usuario.id)){
        unreadMap[key] = (unreadMap[key] || 0) + 1;
      }
    });
    return { chats: agrupado, unreadByChat: unreadMap };
  }, [mensajes]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, chatSeleccionado]);

  // --- AGREGAR FUNCIÓN handleEnviarMensaje ---
function handleEnviarMensaje() {
  if (!nuevoTexto.trim() && !imagenAdjunta) return;
  if (!chatSeleccionado || !chats[chatSeleccionado] || chats[chatSeleccionado].length === 0) return;
  const base = chats[chatSeleccionado][0];
  const otherId = base.deId === userData.id ? base.paraId : base.deId;
  const paraNombre = base.deId === userData.id ? (base.de || base.deNombre || '') : `${userData.nombre} ${userData.apellido}`;

  // Preparar FormData si hay imagen
  let body;
  let headers = {};
  if (imagenAdjunta) {
    body = new FormData();
    body.append('deId', userData.id);
    body.append('paraId', otherId);
    body.append('de', `${userData.nombre} ${userData.apellido}`);
    body.append('paraNombre', paraNombre);
    body.append('descripcion', nuevoTexto);
    body.append('productoId', base.productoId);
    body.append('productoTitle', base.productoTitle);
    body.append('productoOfrecido', base.productoOfrecido);
    body.append('imagen', imagenAdjunta);
    // No Content-Type, fetch lo setea solo
  } else {
    body = JSON.stringify({
      deId: userData.id,
      paraId: otherId,
      de: `${userData.nombre} ${userData.apellido}`,
      paraNombre,
      descripcion: nuevoTexto,
      productoId: base.productoId,
      productoTitle: base.productoTitle,
      productoOfrecido: base.productoOfrecido
    });
    headers['Content-Type'] = 'application/json';
  }

  fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers,
    body
  })
    .then(async res => {
      if (res.ok) {
        let saved;
        if (imagenAdjunta) {
          saved = await res.json();
        } else {
          saved = await res.json();
        }
        setMensajes(prev => [...prev, saved]);
      }
      setNuevoTexto('');
      setImagenAdjunta(null);
      fetchMensajes(userData.id);
    })
    .catch(err => {
      console.error('Error enviando mensaje', err);
    });
}
// --- FIN handleEnviarMensaje ---

// seleccionar automáticamente el primer chat la primera vez
  React.useEffect(()=>{
    if(!chatSeleccionado){
      const firstKey = Object.keys(chats)[0];
      if(firstKey) setChatSeleccionado(firstKey);
    }
  }, [chats]);

  const fetchMensajes = (uid) => {
    const idToUse = uid || userData.id;
    if (!idToUse) return;
    fetch(`${API_URL}/messages/${idToUse}`)
      .then(res=>res.json())
      .then(data=>{
        const mapped = data.map(m=>({
          ...m,
          nombreRemitente: m.de || 'Usuario',
          fecha: m.createdAt || m.fecha || new Date().toISOString()
        }));
        setMensajes(mapped);
      }).catch(err=>console.error('Error mensajes',err));
  };
  const [activeTab, setActiveTab] = useState('articulos');
  const [respuestaMensaje, setRespuestaMensaje] = useState({}); // nuevo estado para las respuestas por mensaje
  const [nuevoTexto, setNuevoTexto] = useState('');
=======
  const [mensajes, setMensajes] = useState([]);
  const [activeTab, setActiveTab] = useState('articulos');
  const [respuestaMensaje, setRespuestaMensaje] = useState({}); // nuevo estado para las respuestas por mensaje
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: ''
  });
<<<<<<< HEAD
  // Estado para imagen adjunta en barra de envío
  const [imagenAdjunta, setImagenAdjunta] = useState(null);
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))

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

<<<<<<< HEAD
      // obtener datos frescos del backend
      fetch(`${API_URL}/users/${usuario.id}`)
        .then(res => res.json())
        .then(userBD => {
          localStorage.setItem('usuarioActual', JSON.stringify(userBD));
          setUserData(prev => ({ ...prev, ...userBD }));
        })
        .catch(() => {});

=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
      setUserData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        ubicacion: usuario.zona || 'Tucumán',
        email: usuario.email,
        imagen: imagenUrl,
        telefono: usuario.telefono,
        calificacion: usuario.calificacion,
        transacciones: usuario.transacciones || [],
<<<<<<< HEAD
        mostrarContacto: usuario.mostrarContacto !== undefined ? usuario.mostrarContacto : true,
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
        id: usuario.id,
      });

      fetch(`${API_URL}/products/user/${usuario.id}`)
        .then((res) => res.json())
        .then((data) => {
<<<<<<< HEAD
          setUserListings(data.filter(p => !p.intercambiado));
=======
          setUserListings(data);
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
        })
        .catch((error) => {
          console.error("❌ Error al obtener productos:", error);
        });

<<<<<<< HEAD
      fetchMensajes(usuario.id);

=======
      fetch(`${API_URL}/messages/${usuario.id}`)
        .then(res => res.json())
        .then(mensajesData => {
          const mensajesFiltrados = mensajesData.map(mensaje => ({
            ...mensaje,
            nombreRemitente: mensaje.de || 'Usuario desconocido',
            productoTitle: mensaje.productoTitle || '',
            imagenNombre: mensaje.imagenNombre || '',
            fecha: mensaje.createdAt || '',
          }));
          setMensajes(mensajesFiltrados);
        })
        .catch(error => {
          console.error("❌ Error al obtener mensajes:", error);
        });
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD
        transacciones: userData.transacciones,
        mostrarContacto: userData.mostrarContacto
=======
        transacciones: userData.transacciones
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD

    // 1. Actualizar UI inmediatamente
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
    setUserData(prev => ({
      ...prev,
      transacciones: [...prev.transacciones, nuevaTransaccion],
    }));
    setUserListings(prev => prev.filter(p => p.id !== producto.id));
<<<<<<< HEAD

    // 2. Persistir en backend - paso A) marcar producto como intercambiado en BD
    fetch(`${API_URL}/products/${producto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intercambiado: true })
    }).catch(err => console.error('❌ Error al marcar producto:', err));

    // paso B) guardar transacción en el usuario
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) return;

    const updatedTransacciones = [...(usuarioActual.transacciones || []), nuevaTransaccion];

    fetch(`${API_URL}/users/${usuarioActual.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transacciones: updatedTransacciones })
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar transacciones');
        return res.json();
      })
      .then(user => {
        // Actualizar storage y estado con la respuesta oficial
        localStorage.setItem('usuarioActual', JSON.stringify(user));
        setUserData(prev => ({ ...prev, transacciones: user.transacciones }));
      })
      .catch(err => console.error('❌ Error al persistir transacción:', err));
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
    const mensajeOriginal = mensajes.find(m => m.id === id);

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
      setMensajes(prev => [...prev, {
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

<<<<<<< HEAD
  function handleRefreshMensaje() {
    // Si tienes lógica para refrescar mensajes, ponla aquí. Por ahora, solo refresca mensajes del usuario actual si existe la función fetchMensajes
    if (userData && userData.id && typeof fetchMensajes === 'function') {
      fetchMensajes(userData.id);
    }
  }

  const handleEliminarTransaccion = () => {
    const idx = transToDelete.idx;
    const nuevaLista = [...userData.transacciones];
    nuevaLista.splice(idx, 1);
    setUserData(prev => ({ ...prev, transacciones: nuevaLista }));
    setShowConfirmDeleteTrans(false);
  };

=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD
                e.target.onerror = null; 
=======
                e.target.onerror = null; // Prevenir loop infinito
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
                e.target.src = '/images/fotoperfil.jpg';
              }}
            />
          </div>
          <div className="perfil-info">
            <h1>{`${capitalize(userData.nombre)} ${capitalize(userData.apellido)}`}</h1>
            <div className="perfil-stats">
              <div className="stat">
<<<<<<< HEAD
                <button className="stat-value" style={{background:'none',border:'none',cursor:'pointer',color:'#0d6efd'}} onClick={()=>navigate(`/calificaciones/${userData.id}`)}>{userData.calificacion}</button>
=======
                <span className="stat-value">{userData.calificacion}</span>
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
                <span className="stat-label">Calificación</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData.transacciones.length}</span>
                <span className="stat-label">Transacciones</span>
              </div>
            </div>
            <div className="perfil-detalles">
              <p><strong>Ubicación:</strong> {userData.ubicacion || 'Argentina, Tucumán'}</p>
<<<<<<< HEAD
              {userData.mostrarContacto ? (
                <>
                  <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
                  <p><strong>Teléfono:</strong> {userData.telefono ? userData.telefono : 'Privado'}</p>
                </>
              ) : (
                <p><em>Información de contacto: Privada</em></p>
              )}
=======
              <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
              <p><strong>Teléfono:</strong> {userData.telefono || '0381-5088-999'}</p>
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD
                <div className="transacciones-grid">
                  {userData.transacciones.map((t, idx) => (
                    <TransactionCard
                      key={idx}
                      transaccion={t}
                      currentUserId={userData.id}
                      onDelete={() => {
                        setTransToDelete({ ...t, idx });
                        setShowConfirmDeleteTrans(true);
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Modal de confirmación para eliminar transacción */}
              <ConfirmModal
                isOpen={showConfirmDeleteTrans}
                onClose={() => { setShowConfirmDeleteTrans(false); setTransToDelete(null); }}
                onConfirm={() => {
                  if (transToDelete && typeof transToDelete.idx === 'number') {
                    setUserData(prev => ({
                      ...prev,
                      transacciones: prev.transacciones.filter((_, i) => i !== transToDelete.idx)
                    }));
                  }
                  setShowConfirmDeleteTrans(false);
                  setTransToDelete(null);
                }}
                title="Eliminar registro de intercambio"
                message={`¿Estás seguro que deseas eliminar este registro de intercambio? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
              />
=======
                <ul>
                  {userData.transacciones.map((transaccion, index) => (
                    <li key={index}>
                      <strong>{transaccion.title}</strong> - {transaccion.descripcion} - Fecha: {transaccion.fecha}
                    </li>
                  ))}
                </ul>
              )}
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mis-mensajes">
              <h2>Mensajes</h2>
<<<<<<< HEAD
              {Object.keys(chats).length === 0 ? (
                <p>No tienes mensajes nuevos.</p>
              ) : (
                <div className="chat-layout" style={{display:'flex',gap:'1rem'}}>
                  {/* lista de chats */}
                  <div className="chat-list" style={{width:'250px',borderRight:'1px solid #ddd'}}>
                    {Object.keys(chats).map(key => {
                      const mensajesChat = chats[key];
                      const ultimoMensaje = mensajesChat[mensajesChat.length - 1];
                      // Determinar el otro usuario
                      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                      let otroNombre = '';
                      if (ultimoMensaje) {
                        if (ultimoMensaje.deId === usuarioActual.id) {
                          otroNombre = ultimoMensaje.paraNombre || ultimoMensaje.para || ultimoMensaje.paraId || 'Desconocido';
                        } else {
                          otroNombre = ultimoMensaje.deNombre || ultimoMensaje.de || ultimoMensaje.deId || 'Desconocido';
                        }
                      }
                      // Texto del último mensaje
                      let textoUltimo = '';
                      if (ultimoMensaje) {
                        if (ultimoMensaje.descripcion && ultimoMensaje.descripcion.length > 0) {
                          textoUltimo = ultimoMensaje.descripcion.length > 30 ? ultimoMensaje.descripcion.slice(0, 30) + '…' : ultimoMensaje.descripcion;
                        } else if (ultimoMensaje.imagen) {
                          textoUltimo = '[Imagen]';
                        } else {
                          textoUltimo = '(Sin mensaje)';
                        }
                      }
                      const noLeidos = unreadByChat[key] > 0;
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            setChatSeleccionado(key);
                            const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
                            if (usuario) {
                              fetch(`${API_URL}/messages/mark-read/${usuario.id}`, { method: 'PUT' }).then(() => { if (window.refreshUnread) window.refreshUnread(); }).catch(() => { });
                            }
                          }}
                          onContextMenu={e => {
                            e.preventDefault();
                            setShowChatMenu(key);
                            setChatToDelete(key);
                            document.addEventListener('mousedown', handleCloseChatMenu);
                          }}
                          style={{
                            padding: '0.7rem 0.8rem',
                            cursor: 'pointer',
                            background: chatSeleccionado === key ? '#e9ecef' : 'transparent',
                            borderBottom: '1px solid #f1f1f1',
                            fontWeight: noLeidos ? 'bold' : 'normal',
                            position: 'relative',
                            transition: 'background 0.2s',
                            minHeight: 54
                          }}
                          className={chatSeleccionado === key ? 'chat-list-item selected' : 'chat-list-item'}
                        >
                          {/* Menú contextual lateral solo texto */}
                          {showChatMenu === key && (
                            <div
                              style={{position:'absolute',top:36,right:10,zIndex:30,background:'#fff',border:'1px solid #eee',borderRadius:10,boxShadow:'0 2px 8px #0002',padding:'0',minWidth:140,display:'flex',flexDirection:'column'}}
                              tabIndex={0}
                            >
                              <div
                                style={{padding:'13px 22px',cursor:'pointer',color:'#dc3545',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
                                onClick={() => { setShowConfirmChatDelete(true); setShowChatMenu(null); }}
                              >
                                Eliminar chat
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '1rem', color: '#222' }}>{otroNombre}</div>
                            {noLeidos && (
                              <span style={{ marginLeft: 8, background: '#dc3545', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>{unreadByChat[key]}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.93rem', color: '#555', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {textoUltimo}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* mensajes del chat seleccionado */}
                  <div className="chat-messages" style={{flex:1}}>
                    {(!chatSeleccionado || chats[chatSeleccionado].length===0) ? (
                      <p>Selecciona un chat</p>
                    ) : (
                      <div>
                        <div className="chat-header" style={{
                          display: 'flex', alignItems: 'center', gap: 12, background: '#ededed', borderRadius: 12, padding: '8px 16px', marginBottom: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}>
                          <span style={{ fontSize: 28, color: '#bbb' }}>👤</span>
                          <span style={{ fontWeight: 600, fontSize: 17, color: '#222' }}>
                            {/* Mostrar el nombre real del otro usuario */}
                            {(() => {
                              const mensajesChat = chats[chatSeleccionado];
                              if (!mensajesChat || mensajesChat.length === 0) return 'Chat';
                              const ultimoMensaje = mensajesChat[mensajesChat.length - 1];
                              const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                              if (ultimoMensaje) {
                                if (ultimoMensaje.deId === usuarioActual.id) {
                                  return ultimoMensaje.paraNombre || ultimoMensaje.para || ultimoMensaje.paraId || 'Desconocido';
                                } else {
                                  return ultimoMensaje.deNombre || ultimoMensaje.de || ultimoMensaje.deId || 'Desconocido';
                                }
                              }
                              return 'Chat';
                            })()}
                          </span>
                          {/* Botón Ver Perfil */}
                          {(() => {
                            const mensajesChat = chats[chatSeleccionado];
                            if (!mensajesChat || mensajesChat.length === 0) return null;
                            const base = mensajesChat[0];
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            const otherId = base.deId === usuarioActual.id ? base.paraId : base.deId;
                            return (
                              <div style={{display:'flex', gap:8, marginLeft:'auto'}}>
                                <button
                                  onClick={() => window.open(`/perfil/${otherId}`, '_blank')}
                                  style={{ background: '#00bcd4', color: 'white', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
                                  title="Ver perfil del usuario"
                                >
                                  Ver Perfil
                                </button>
                                <button
                                  onClick={() => window.open(`/productos-usuario/${otherId}`, '_blank')}
                                  style={{ background: '#009688', color: 'white', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
                                  title="Ver productos publicados"
                                >
                                  Ver Productos
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                        {/* Mensaje informativo obligatorio */}
                        <div style={{background:'#ffeeba',color:'#856404',padding:'8px 18px',borderRadius:10,marginBottom:18,fontSize:15,fontWeight:500,boxShadow:'0 1px 2px #0001'}}>
                          ⚠️ Debes marcar el producto como intercambiado para completar el proceso.
                        </div>
                        <div ref={chatMessagesEndRef}>
                          {(() => {
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            // Agrupar mensajes por fecha (YYYY-MM-DD) y ordenar de más antiguo a más reciente
                            let mensajes = chats[chatSeleccionado] || [];
                            mensajes = mensajes.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                            let lastDate = null;
                            return mensajes.map((mensaje, idx) => {
                              const fecha = new Date(mensaje.fecha);
                              const fechaStr = fecha.toLocaleDateString();
                              const showDateHeader = !lastDate || lastDate !== fechaStr;
                              lastDate = fechaStr;
                              return (
                                <React.Fragment key={mensaje._id || mensaje.id}>
                                  {showDateHeader && (
                                    <div style={{textAlign:'center',margin:'18px 0 8px 0',color:'#888',fontSize:13,fontWeight:500}}>
                                      {fechaStr}
                                    </div>
                                  )}
                                  <div style={{ marginBottom:'1rem' }}>
                                    <ChatBubble
                                      mensaje={mensaje}
                                      fromMe={mensaje.deId === usuarioActual.id}
                                      currentUserId={usuarioActual.id}
                                      onRefresh={(action, id) => {
                                        if (action === 'edit') {
                                          setEditingMessageId(mensaje._id || mensaje.id);
                                          setEditText(mensaje.descripcion || '');
                                        } else {
                                          handleRefreshMensaje();
                                        }
                                      }}
                                      onDeleteMessage={(msg) => { setMessageToDelete(msg); setShowConfirmMessageDelete(true); }}
                                      confirmExchange={()=>handleConfirmarIntercambio(mensaje)}
                                      productoTitle={mensaje.productoTitle}
                                      productoOfrecido={mensaje.productoOfrecido}
                                      isEditing={editingMessageId === (mensaje._id || mensaje.id)}
                                      editText={editText}
                                      onEditTextChange={setEditText}
                                      onEditCancel={() => { setEditingMessageId(null); setEditText(''); }}
                                      onEditSave={async () => {
                                        const idMsg = mensaje._id || mensaje.id;
                                        await fetch(`${API_URL}/messages/${idMsg}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ descripcion: editText })
                                        });
                                        setMensajes(prev => prev.map(m => (m._id || m.id) === idMsg ? { ...m, descripcion: editText } : m));
                                        setEditingMessageId(null);
                                        setEditText('');
                                      }}
                                    />
                                  </div>
                                </React.Fragment>
                              );
                            });
                          })()}
                        </div>
                        {/* enviar nuevo mensaje estilo WhatsApp */}
                         <div className="send-message whatsapp-send-bar" style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'1rem',background:'#f7f7f7',borderRadius:24,padding:'0.4rem 1rem',boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                           {/* Botón de adjuntar imagen al extremo izquierdo, pequeño y redondeado */}
                           <button
                             type="button"
                             className="btn-clip"
                             style={{ background: '#e0f7fa', border: 'none', cursor: 'pointer', fontSize: 16, color: '#0097a7', marginRight: 10, marginLeft: 0, order: 0, borderRadius: '50%', width: 32, height: 32, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 2px #0001' }}
                             onClick={() => document.getElementById('fileInput').click()}
                             title="Adjuntar imagen"
                           >
                             📷
                           </button>
                           <input
                             type="file"
                             id="fileInput"
                             accept="image/*"
                             style={{ display: 'none' }}
                             onChange={e => {
                               if (e.target.files && e.target.files[0]) {
                                 setImagenAdjunta(e.target.files[0]);
                               }
                             }}
                           />
                           {/* Vista previa imagen adjunta */}
                           {imagenAdjunta && (
                             <div style={{ position: 'relative', display: 'inline-block', marginRight: 8 }}>
                               <img
                                 src={URL.createObjectURL(imagenAdjunta)}
                                 alt="preview"
                                 style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                               />
                               <button
                                 onClick={() => setImagenAdjunta(null)}
                                 style={{ position: 'absolute', top: -8, right: -8, background: '#ff4444', borderRadius: '50%', width: 18, height: 18, color: 'white', border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                 title="Quitar imagen"
                               >
                                 ×
                               </button>
                             </div>
                           )}
                           {/* Input de mensaje */}
                           <textarea
                             style={{ flex: 1, border: 'none', resize: 'none', background: 'transparent', outline: 'none', fontSize: 15, minHeight: 32, maxHeight: 70, padding: '8px 0', color: '#111' }}
                             rows={1}
                             value={nuevoTexto}
                             onChange={e => setNuevoTexto(e.target.value)}
                             placeholder="Escribe un mensaje..."
                             onKeyDown={e => {
                               if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 handleEnviarMensaje();
                               }
                             }}

                           />
                           {/* Botón enviar */}
                           <button
                             className="btn-send"
                             style={{ background: '#00bcd4', color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, marginLeft: 6, cursor: 'pointer' }}
                             onClick={handleEnviarMensaje}
                             title="Enviar"
                           >
                             ➤
                           </button>
                         </div>
                      </div>
                    )}
                  </div>

                </div>
=======
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
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
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
<<<<<<< HEAD

      {/* ConfirmModal para eliminar chat completo */}
      <ConfirmModal
        isOpen={showConfirmChatDelete}
        onClose={() => setShowConfirmChatDelete(false)}
        onConfirm={async () => {
          // Eliminar todos los mensajes de ese chat del backend y la UI
          const mensajesChat = chats[chatToDelete] || [];
          for (const msg of mensajesChat) {
            await fetch(`${API_URL}/messages/${msg._id || msg.id}`, { method: 'DELETE' });
          }
          setMensajes(prev => prev.filter(m => {
            const t1 = m.productoTitle || '(sin título)';
            const t2 = m.productoOfrecido || '(sin título)';
            return `${t1}↔${t2}` !== chatToDelete;
          }));
          setShowConfirmChatDelete(false);
          if (chatSeleccionado === chatToDelete) setChatSeleccionado(null);
        }}
        title="Eliminar chat"
        message="¿Estás seguro que deseas eliminar este chat completo? Esta acción no se puede deshacer."
        confirmText="Eliminar chat"
      />

      {/* ConfirmModal para eliminar mensaje individual */}
      <ConfirmModal
        isOpen={showConfirmMessageDelete}
        onClose={() => setShowConfirmMessageDelete(false)}
        onConfirm={async () => {
          if (!messageToDelete) return;
          await fetch(`${API_URL}/messages/${messageToDelete._id || messageToDelete.id}`, { method: 'DELETE' });
          setMensajes(prev => prev.filter(m => (m._id || m.id) !== (messageToDelete._id || messageToDelete.id)));
          setShowConfirmMessageDelete(false);
        }}
        title="Eliminar mensaje"
        message="¿Estás seguro que deseas eliminar este mensaje? Esta acción no se puede deshacer."
        confirmText="Eliminar mensaje"
      />
=======
>>>>>>> d75ec88 (Agrego pruebas unitarias(macha y chai), de integración(postman) y E2E(cypress))
    </div>
  );
};

export default PerfilUsuario;