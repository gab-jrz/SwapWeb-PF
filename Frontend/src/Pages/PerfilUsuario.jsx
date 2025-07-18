import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';
import DeleteModal from '../Component/DeleteModal.jsx';
import ConfirmModal from '../Component/ConfirmModal.jsx';
import StepperIntercambio from '../Component/StepperIntercambio.jsx';
import '../styles/StepperIntercambio.css';
import ChatBubble from '../Component/ChatBubble.jsx';
import TransactionCard from '../Component/TransactionCard.jsx';
import RatingModal from '../Component/RatingModal';

const API_URL = 'http://localhost:3001/api'; // Backend URL

const PerfilUsuario = () => {
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuarioActual || !usuarioActual.id) {
    window.location.href = '/login';
    return null;
  }
  // --- DECLARACIÓN DE ESTADOS ---

  // Pestaña activa ('articulos', 'transacciones', 'mensajes')
  const [activeTab, setActiveTab] = useState('articulos');

  // Datos del usuario y sus productos
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [transacciones, setTransacciones] = useState([]);

  // Gestión de chats y mensajes
  const [chats, setChats] = useState({});
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  // Avatar del otro usuario para el Stepper
  const [avatarOtro, setAvatarOtro] = useState('/images/fotoperfil.jpg');

  // Actualizar avatar del otro usuario cuando cambian chatSeleccionado o chats
  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    if (!chatSeleccionado || !chats[chatSeleccionado] || !usuarioActual?.id) {
      setAvatarOtro('/images/fotoperfil.jpg');
      return;
    }

    const mensajeIntercambio = chats[chatSeleccionado].find(m => m.productoId && m.productoOfrecidoId);
    if (!mensajeIntercambio) {
      setAvatarOtro('/images/fotoperfil.jpg');
      return;
    }

    const idOtro = mensajeIntercambio.deId === usuarioActual.id ? mensajeIntercambio.paraId : mensajeIntercambio.deId;
    const url = mensajeIntercambio.paraId === usuarioActual.id ? mensajeIntercambio.deImagen : mensajeIntercambio.paraImagen;

    if (url) {
      setAvatarOtro(url);
    } else if (idOtro) {
      import('../utils/getUserProfileImage').then(mod => mod.getUserProfileImage(idOtro).then(setAvatarOtro));
    } else {
      setAvatarOtro('/images/fotoperfil.jpg');
    }
  }, [chatSeleccionado, chats]);

  // Modales y confirmaciones
  const [showConfirmDeleteTrans, setShowConfirmDeleteTrans] = useState(false);
  const [transToDelete, setTransToDelete] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: ''
  });

  // Deduplicar mensajes usando firma compuesta (
  // combina remitente, receptor, texto, producto y timestamp 
  const uniqMessages = (msgs) => {
    const unique = [];
    const map = new Map();
    for (const msg of msgs) {
      if (!map.has(msg._id)) {
        map.set(msg._id, true);
        unique.push(msg);
      }
    }
    return unique;
  };

  // Agrupar mensajes en chats
  const agruparMensajes = (mensajes, userId) => {
    const chatsAgrupados = {};
    const noLeidosPorChat = {};
    
    mensajes.forEach(msg => {
      // Determinar el ID del otro usuario en el chat
      const otroUsuarioId = msg.deId === userId ? msg.paraId : msg.deId;
      const chatId = [msg.productoId, otroUsuarioId].sort().join('_');
      
      // Inicializar el chat si no existe
      if (!chatsAgrupados[chatId]) {
        chatsAgrupados[chatId] = [];
        noLeidosPorChat[chatId] = 0;
      }
      
      // Agregar mensaje al chat
      chatsAgrupados[chatId].push(msg);
      
      // Contar mensajes no leídos
      if (!msg.leidoPor?.includes(userId) && msg.deId !== userId) {
        noLeidosPorChat[chatId] = (noLeidosPorChat[chatId] || 0) + 1;
      }
    });
    
    // Ordenar mensajes por fecha en cada chat
    Object.keys(chatsAgrupados).forEach(chatId => {
      chatsAgrupados[chatId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
    
    return { chatsAgrupados, noLeidosPorChat };
  };

  const chatMessagesEndRef = React.useRef(null);
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
    mostrarContacto: true,
    id: null
  });

  const [userListings, setUserListings] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [unreadByChat, setUnreadByChat] = useState({});
  const [showChatMenu, setShowChatMenu] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [showConfirmChatDelete, setShowConfirmChatDelete] = useState(false);
  const [showConfirmMessageDelete, setShowConfirmMessageDelete] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [imagenAdjunta, setImagenAdjunta] = useState(null);
  const [nuevoTexto, setNuevoTexto] = useState('');
  // Confirmar intercambio
  const [showConfirmExchange, setShowConfirmExchange] = useState(false);
  const [mensajeIntercambio, setMensajeIntercambio] = useState(null);
  const [intercambioCompletado, setIntercambioCompletado] = useState(null);

  useEffect(() => {
    const mensajesDelChat = chats[chatSeleccionado] || [];
    const mensajeDeSistema = mensajesDelChat.find(m => m.system || m.de === 'system' || m.tipo === 'system');

    if (mensajeDeSistema) {
      const fecha = new Date(mensajeDeSistema.fecha || mensajeDeSistema.createdAt).toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'short'
      });
      setIntercambioCompletado(fecha);
    } else {
      setIntercambioCompletado(null);
    }
  }, [chatSeleccionado, chats]);

  // Manejar cierre del menú contextual de chat
  const handleCloseChatMenu = React.useCallback((e) => {
    if (!e.target.closest('.chat-list-item')) {
      setShowChatMenu(null);
      document.removeEventListener('mousedown', handleCloseChatMenu);
    }
  }, []);

  // Agrupar mensajes en chats y contar no leídos
  const updateChatsAndUnread = React.useCallback(() => {
    if (mensajes.length === 0) return;
    
    const agrupado = {};
    const unreadMap = {};
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    
    mensajes.forEach(m => {
      const titulo1 = m.productoTitle || '(sin título)';
      const titulo2 = m.productoOfrecido || '(sin título)';
      const key = `${titulo1}↔${titulo2}`;
      
      if (!agrupado[key]) {
        agrupado[key] = [];
        unreadMap[key] = 0;
      }
      
      agrupado[key].push(m);
      
      // Verificar si el mensaje no ha sido leído y no es del usuario actual
      if (usuarioActual && m.paraId === usuarioActual.id && !(m.leidoPor || []).includes(usuarioActual.id)) {
        unreadMap[key]++;
      }
    });
    
    // Ordenar mensajes por fecha en cada chat
    Object.values(agrupado).forEach(chat => {
      chat.sort((a, b) => new Date(a.fecha || a.createdAt) - new Date(b.fecha || b.createdAt));
    });
    
    // Actualizar estados
    setChats(agrupado);
    setUnreadByChat(unreadMap);
  }, [mensajes]);
  
  // Efecto para actualizar chats cuando cambian los mensajes
  useEffect(() => {
    updateChatsAndUnread();
  }, [updateChatsAndUnread]);

  // Scroll automático al último mensaje (después del render)
  useLayoutEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, chatSeleccionado]);

  const fetchMensajes = (uid) => {
    const idToUse = uid || userData?.id;
    console.log('🔍 fetchMensajes para usuario ID:', idToUse);
    if (!idToUse) {
      console.log('❌ No hay ID de usuario');
      return;
    }
    
    console.log(`🌐 Haciendo petición a: ${API_URL}/messages/${idToUse}`);
    fetch(`${API_URL}/messages/${idToUse}`)
      .then(res => {
        console.log('📥 Respuesta del servidor - Status:', res.status);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('📩 Datos recibidos:', data);
        const mapped = data.map(m => ({
          ...m,
          nombreRemitente: m.de || 'Usuario',
          fecha: m.createdAt || m.fecha || new Date().toISOString()
        }));
        
        // Actualizar mensajes
        const mensajesUnicos = uniqMessages(mapped);
        setMensajes(mensajesUnicos);
        
        // Agrupar mensajes en chats
        const { chatsAgrupados, noLeidosPorChat } = agruparMensajes(mensajesUnicos, idToUse);
        
        console.log('💬 Chats agrupados:', chatsAgrupados);
        console.log('🔔 No leídos por chat:', noLeidosPorChat);
        
        setChats(chatsAgrupados);
        setUnreadByChat(noLeidosPorChat);
        
        // Seleccionar el primer chat si no hay uno seleccionado
        if (!chatSeleccionado && Object.keys(chatsAgrupados).length > 0) {
          setChatSeleccionado(Object.keys(chatsAgrupados)[0]);
        }
      })
      .catch(err => {
        console.error('❌ Error en fetchMensajes:', err);
      });
  };

// --- FUNCIÓN handleEnviarMensaje ---
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
        setMensajes(prev => uniqMessages([...prev, saved]));
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
  useEffect(()=>{
    if(!chatSeleccionado && Object.keys(chats).length > 0){
      const firstKey = Object.keys(chats)[0];
      setChatSeleccionado(firstKey);
    }
  }, [chats, chatSeleccionado]);

  // Efecto para recargar productos y transacciones tras un intercambio
  useEffect(() => {
    const handleProductsUpdated = () => {
      // Vuelve a cargar los datos del usuario (productos y transacciones)
      if (typeof loadUserData === 'function') {
        loadUserData();
      }
    };
    window.addEventListener('productsUpdated', handleProductsUpdated);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Efecto para cargar datos del usuario al iniciar
  useEffect(() => {
    console.log('🔍 Iniciando carga de datos del perfil...');
    
    // Verificar autenticación antes de cargar datos
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
      
      if (!token || !usuario || !usuario.id) {
        console.error('❌ Usuario no autenticado o sesión expirada');
        // Limpiar datos de sesión inconsistentes
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioActual');
        navigate('/login', { state: { from: location.pathname } });
        return null;
      }
      return usuario;
    };
    
    const loadUserData = async () => {
      const usuario = checkAuth();
      if (!usuario) return;
      
      try {
        console.log('🔑 Cargando datos del perfil para el usuario:', { 
          id: usuario.id, 
          email: usuario.email 
        });

        // Configurar imagen de perfil
        let imagenUrl = '/images/fotoperfil.jpg';
        if (usuario.imagen) {
          if (usuario.imagen.startsWith('data:image')) {
            imagenUrl = usuario.imagen;
          } else {
            imagenUrl = usuario.imagen.startsWith("/images/") 
              ? usuario.imagen 
              : `/images/${usuario.imagen}`;
          }
        }

        try {
          console.log(`🌐 Solicitando datos del usuario a ${API_URL}/users/${usuario.id}...`);
          const userResponse = await fetch(`${API_URL}/users/${usuario.id}`);
          
          if (!userResponse.ok) {
            throw new Error(`Error HTTP ${userResponse.status} al obtener datos del usuario`);
          }
          
          const dataUser = await userResponse.json();
          console.log('✅ Datos del usuario recibidos:', dataUser);
          
          if (!dataUser) {
            throw new Error('No se recibieron datos del usuario');
          }
          
          // Enriquecer transacciones con nombres de productos
          console.log('🔄 Procesando transacciones...');
          if (Array.isArray(dataUser.transacciones) && dataUser.transacciones.length > 0) {
            console.log(`📊 ${dataUser.transacciones.length} transacciones encontradas`);
            const enriched = await Promise.all(dataUser.transacciones.map(async (t) => {
              const prodIds = [t.productoOfrecidoId, t.productoSolicitadoId].filter(Boolean);
              const names = {};
              
              await Promise.all(prodIds.map(async pid => {
                try {
                  const res = await fetch(`${API_URL}/products/${pid}`);
                  if (res.ok) {
                    const p = await res.json();
                    names[pid] = p.title || p.nombre || 'Producto desconocido';
                  }
                } catch (error) {
                  console.error('Error al cargar producto:', error);
                }
              }));
              
              return {
                ...t,
                productoOfrecido: names[t.productoOfrecidoId] || t.productoOfrecido,
                productoSolicitado: names[t.productoSolicitadoId] || t.productoSolicitado
              };
            }));
            dataUser.transacciones = enriched;
          }
          
          // Actualizar estado local y almacenamiento
          const updatedUserData = {
            ...dataUser,
            nombre: dataUser.nombre || usuario.nombre,
            apellido: dataUser.apellido || usuario.apellido,
            ubicacion: dataUser.zona || usuario.zona || 'Tucumán',
            email: dataUser.email || usuario.email,
            imagen: imagenUrl,
            telefono: dataUser.telefono || usuario.telefono,
            calificacion: dataUser.calificacion || usuario.calificacion || 0,
            transacciones: dataUser.transacciones || [],
            mostrarContacto: dataUser.mostrarContacto !== undefined 
              ? dataUser.mostrarContacto 
              : (usuario.mostrarContacto !== undefined ? usuario.mostrarContacto : true),
            id: dataUser.id || usuario.id,
          };
          
          // Actualizar estado local
          setUserData(updatedUserData);
          
          // Actualizar localStorage
          localStorage.setItem('usuarioActual', JSON.stringify(updatedUserData));
          
          // Cargar productos del usuario
          console.log('🛍️ Cargando productos del usuario...');
          try {
            const productsResponse = await fetch(`${API_URL}/products/user/${updatedUserData.id}`);
            
            if (!productsResponse.ok) {
              throw new Error(`Error HTTP ${productsResponse.status} al cargar productos`);
            }
            
            const products = await productsResponse.json();
            console.log(`✅ ${products.length} productos cargados`);
            
            // Filtrar productos no intercambiados
            const productosActivos = products.filter(p => !p.intercambiado);
            console.log(`🔄 ${productosActivos.length} productos activos`);
            
            setUserListings(productosActivos);
            
            // Si no hay productos, mostrar mensaje
            if (productosActivos.length === 0) {
              console.log('ℹ️ El usuario no tiene productos publicados');
            }
          } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            // Inicializar con array vacío para evitar errores
            setUserListings([]);
          }
          
          // Cargar mensajes
          fetchMensajes(updatedUserData.id);
          
        } catch (error) {
          console.error('❌ Error al cargar datos del usuario:', error);
          
          // Verificar si el error es de autenticación
          if (error.message.includes('401') || error.message.includes('403')) {
            console.error('🔒 Error de autenticación, redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioActual');
            navigate('/login', { 
              state: { 
                from: location.pathname,
                error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
              } 
            });
            return;
          }
          
          // Usar datos del localStorage como respaldo solo si son válidos
          if (usuario && usuario.id) {
            console.log('🔄 Usando datos del localStorage como respaldo...');
            setUserData({
              ...usuario,
              transacciones: Array.isArray(usuario.transacciones) ? usuario.transacciones : [],
              mostrarContacto: usuario.mostrarContacto !== false
            });
          } else {
            throw new Error('Datos de usuario no disponibles');
          }
        }
      } catch (error) {
        console.error('❌ Error crítico al cargar el perfil:', error);
        
        // Mostrar mensaje de error específico
        const errorMessage = error.message.includes('Failed to fetch')
          ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
          : 'Error al cargar el perfil. Por favor, intente recargar la página.';
          
        alert(errorMessage);
        
        // Redirigir a login solo si es un error de autenticación
        if (error.message.includes('401') || error.message.includes('403')) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioActual');
          navigate('/login', { 
            state: { 
              from: location.pathname,
              error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
            } 
          });
        }
      }
    };
    
    // Pequeño retraso para asegurar que el componente esté montado
    const loadTimer = setTimeout(() => {
      loadUserData();
    }, 100);
    
    return () => {
      console.log('🧹 Limpiando efectos del perfil');
      clearTimeout(loadTimer);
    };
  }, [navigate, location.pathname]); // Añadir location.pathname a las dependencias

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
        transacciones: userData.transacciones,
        mostrarContacto: userData.mostrarContacto
      }));
    }
  }, [userData.transacciones]);

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

  // Calificación
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const handleMarcarComoIntercambiado = (producto) => {
    const nuevaTransaccion = {
      id: producto.id,
      title: producto.title,
      descripcion: producto.description,
      fecha: new Date().toLocaleDateString(),
    };

    // 1. Actualizar UI inmediatamente
    setUserData(prev => ({
      ...prev,
      transacciones: [...prev.transacciones, nuevaTransaccion],
    }));
    setUserListings(prev => prev.filter(p => p.id !== producto.id));

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
  };

  const confirmDelete = async () => {
    if (!deleteModal.productId) return;
    
    try {
      const response = await fetch(`${API_URL}/products/${deleteModal.productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Actualizar la lista de productos eliminando el producto borrado
        setUserListings(prev => prev.filter(p => p._id !== deleteModal.productId));
        
        // Cerrar el modal
        setDeleteModal({ isOpen: false, productId: null, productTitle: '' });
        
        // Mostrar mensaje de éxito
        alert('Producto eliminado correctamente');
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('No se pudo eliminar el producto. Por favor, inténtalo de nuevo.');
    }
  };

  const handleEliminarProducto = (producto) => {
    setDeleteModal({
      isOpen: true,
      productId: producto.id,
      productTitle: producto.title
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

  function handleRefreshMensaje() {
    // Si tienes lógica para refrescar mensajes, ponla aquí. Por ahora, solo refresca mensajes del usuario actual si existe la función fetchMensajes
    if (userData && userData.id && typeof fetchMensajes === 'function') {
      fetchMensajes(userData.id);
    }
  }

  // Efecto para cargar mensajes cuando se carga el componente o cambia el usuario
  useEffect(() => {
    if (userData?.id) {
      console.log('🔄 Cargando mensajes para el usuario:', userData.id);
      fetchMensajes(userData.id);
      
      // Configurar polling para actualizar mensajes cada 30 segundos
      const intervalId = setInterval(() => {
        if (activeTab === 'mensajes') {
          console.log('🔄 Actualizando mensajes...');
          fetchMensajes(userData.id);
        }
      }, 30000);
      
      return () => {
        console.log('🧹 Limpiando intervalo de actualización de mensajes');
        clearInterval(intervalId);
      };
    }
  }, [userData?.id, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Si se cambia a la pestaña de mensajes, forzar una actualización
    if (tab === 'mensajes' && userData?.id) {
      console.log('🔄 Cambiando a pestaña de mensajes, actualizando...');
      fetchMensajes(userData.id);
    }
  };

  const handleEliminarTransaccion = () => {
    const idx = transToDelete.idx;
    const nuevaLista = [...userData.transacciones];
    nuevaLista.splice(idx, 1);
    setUserData(prev => ({ ...prev, transacciones: nuevaLista }));
    setShowConfirmDeleteTrans(false);
  };

  // Función para manejar la eliminación de un mensaje
  // Confirmar intercambio de un mensaje
  const realizarConfirmacionIntercambio = async () => {
    if(!mensajeIntercambio) return;
    try {
      const idMsg = mensajeIntercambio._id || mensajeIntercambio.id;
      const res = await fetch(`${API_URL}/messages/${idMsg}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (res.ok) {
        const data = await res.json();

        // Actualizar el estado local del mensaje para que la UI refleje la confirmación inmediatamente
        setMensajeIntercambio(prev => ({
          ...prev,
          confirmaciones: [...(prev.confirmaciones || []), userData.id],
          completed: data.completed
        }));

        // Si el intercambio se completó (ambos confirmaron), refrescar todo
        if (data.completed) {
          console.log('Intercambio completado! Refrescando mensajes y productos...');
          fetchMensajes(userData.id);
          window.dispatchEvent(new Event('productsUpdated'));
        }

        // Siempre ocultar el modal de confirmación
        setShowConfirmExchange(false);

      } else {
        const errorData = await res.json();
        console.error('Error al confirmar el intercambio:', errorData.message);
        alert(`Error: ${errorData.message || 'No se pudo confirmar el intercambio.'}`);
      }
    } catch (err) {
      console.error('Error de red al confirmar:', err);
      alert('Error de red. No se pudo conectar con el servidor.');
    }
  };


  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await fetch(`${API_URL}/messages/${messageToDelete._id || messageToDelete.id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMensajes(prev => prev.filter(m => (m._id || m.id) !== (messageToDelete._id || messageToDelete.id)));
      setShowConfirmMessageDelete(false);
    } catch (error) {
      console.error('Error al eliminar el mensaje:', error);
      alert('No se pudo eliminar el mensaje. Inténtalo de nuevo.');
    }
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
                e.target.onerror = null; 
                e.target.src = '/images/fotoperfil.jpg';
              }}
            />
          </div>
          <div className="perfil-info">
            <h1>{`${capitalize(userData.nombre)} ${capitalize(userData.apellido)}`}</h1>
            <div className="perfil-stats">
              <div className="stat">
                <button className="stat-value" style={{background:'none',border:'none',cursor:'pointer',color:'#0d6efd'}} onClick={()=>navigate(`/calificaciones/${userData.id}`)}>{userData.calificacion}</button>
                <span className="stat-label">Calificación</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData.transacciones.length}</span>
                <span className="stat-label">Transacciones</span>
              </div>
            </div>
            <div className="perfil-detalles">
              <p><strong>Ubicación:</strong> {userData.ubicacion || 'Argentina, Tucumán'}</p>
              {userData.mostrarContacto ? (
                <>
                  <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
                  <p><strong>Teléfono:</strong> {userData.telefono ? userData.telefono : 'Privado'}</p>
                </>
              ) : (
                <p><em>Información de contacto: Privada</em></p>
              )}
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
                onConfirm={async () => {
                   if (!transToDelete) return;
                   try {
                     // Siempre usar _id de MongoDB para la eliminación
                     let backendEliminado = false;
                     const transId = transToDelete._id;
                     if (transId) {
                       const res = await fetch(`${API_URL}/transactions/${transId}`, { method: 'DELETE' });
                       if (res.ok) backendEliminado = true;
                     }
                     // Si no hubo _id o la eliminación directa falló, marcar la transacción como deleted en el usuario
                     const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                     if (usuarioActual && usuarioActual.id) {
                       if (!backendEliminado) {
                         const nuevas = (usuarioActual.transacciones || []).map(t => {
                           if ((t._id && t._id === transId) || (!t._id && t.fecha === transToDelete.fecha && t.productoOfrecido === transToDelete.productoOfrecido)) {
                             return { ...t, deleted: true };
                           }
                           return t;
                         });
                         await fetch(`${API_URL}/users/${usuarioActual.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ transacciones: nuevas }),
                          });
                        }
                        // Obtener datos frescos y actualizar estado
                        const resUser = await fetch(`${API_URL}/users/${usuarioActual.id}`);
                        if (resUser.ok) {
                          const userBD = await resUser.json();
                          setUserData(prev => ({ ...prev, ...userBD }));
                          localStorage.setItem('usuarioActual', JSON.stringify(userBD));
                        }
                      }
                    } catch (err) {
                      console.error('❌ Error al eliminar transacción:', err);
                      alert('Error al eliminar el registro.');
                    } finally {
                      setShowConfirmDeleteTrans(false);
                      setTransToDelete(null);
                    }
                  }}
                  title="Eliminar registro de intercambio"
                  message="¿Estás seguro que deseas eliminar este registro de intercambio? Esta acción no se puede deshacer."
                  confirmText="Eliminar"
                />
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mis-mensajes">
              <h2>Mensajes</h2>
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
                                        {(!chatSeleccionado || !chats[chatSeleccionado] || chats[chatSeleccionado].length === 0) ? (
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
                        {/* Stepper de progreso de intercambio */}
                        {(() => {
                          const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                          const mensajes = chats[chatSeleccionado] || [];
                          const mensajeIntercambio = mensajes.find(m => m.productoId && m.productoOfrecidoId);

                          if (!mensajeIntercambio) return null;

                          const yoConfirmado = mensajeIntercambio.confirmaciones?.includes(usuarioActual.id);
                          const otroId = mensajeIntercambio.deId === usuarioActual.id ? mensajeIntercambio.paraId : mensajeIntercambio.deId;
                          const otroNombre = mensajeIntercambio.deId === usuarioActual.id ? mensajeIntercambio.paraNombre : mensajeIntercambio.de;
                          const otroConfirmado = mensajeIntercambio.confirmaciones?.includes(otroId);
                          const intercambioCompletado = mensajeIntercambio.completed;

                          // Mostrar botón de calificación si el intercambio está completado y no se ha calificado aún
                          const puedeCalificar = intercambioCompletado && !mensajeIntercambio.ratingGivenBy?.includes(usuarioActual.id);

                          // Avatar y perfil de ambos usuarios
  const avatarActual = (mensajeIntercambio.deId === usuarioActual.id ? mensajeIntercambio.deImagen : mensajeIntercambio.paraImagen) || '/images/fotoperfil.jpg';
  const perfilActual = `/perfil`; // Ruta al perfil privado del usuario
  const perfilOtro = `/perfil/${otroId}`; // Ruta al perfil público del otro usuario

                          const steps = [
                            { label: 'Propuesta enviada', icon: '📩', completed: true },
                            { label: 'Tu confirmación', icon: '👤', completed: yoConfirmado, active: !yoConfirmado, userName: 'Tú', avatarUrl: avatarActual, profileUrl: perfilActual },
                            { label: `Confirmación de ${otroNombre || 'otro'}`, icon: '👤', completed: otroConfirmado, active: !otroConfirmado && yoConfirmado, userName: otroNombre, avatarUrl: avatarOtro, profileUrl: perfilOtro },
                            { label: 'Intercambio completado', icon: '✅', completed: intercambioCompletado }
                          ];

                          return (
                            <div style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1rem 1.5rem', background: '#fff' }}>
                              <StepperIntercambio
                                steps={steps}
                                canConfirm={!yoConfirmado && !intercambioCompletado}
                                completed={intercambioCompletado}
                                onConfirm={async () => {
                                  const idMsg = mensajeIntercambio._id || mensajeIntercambio.id;
                                  const res = await fetch(`${API_URL}/messages/${idMsg}/confirm`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: usuarioActual.id })
                                  });
                                  if (res.ok) {
                                    handleRefreshMensaje();
                                  } else {
                                    const errorData = await res.json();
                                    alert(`Error: ${errorData.message || 'No se pudo confirmar el intercambio.'}`);
                                  }
                                }}
                              />
                              {puedeCalificar && (
                                <button
                                  style={{marginTop:12, background:'#fbc02d', color:'#333', border:'none', borderRadius:8, padding:'7px 18px', fontWeight:600, cursor:'pointer'}}
                                  onClick={()=>{ setRatingTarget({otroId, otroNombre, transId: mensajeIntercambio.transId || mensajeIntercambio._id}); setShowRatingModal(true); }}
                                >
                                  Calificar usuario
                                </button>
                              )}

                              <RatingModal
                                open={showRatingModal}
                                onClose={()=>setShowRatingModal(false)}
                                userName={ratingTarget?.otroNombre || 'usuario'}
                                onSubmit={async ({stars, comment}) => {
                                  setRatingLoading(true);
                                  try {
                                    await fetch(`${API_URL}/ratings`, {
                                      method: 'POST',
                                      headers: {'Content-Type': 'application/json'},
                                      body: JSON.stringify({
                                        deId: usuarioActual.id,
                                        paraId: ratingTarget.otroId,
                                        transId: ratingTarget.transId,
                                        stars,
                                        comment
                                      })
                                    });
                                    setShowRatingModal(false);
                                    handleRefreshMensaje();
                                  } catch(e) {
                                    alert('Error al enviar la calificación');
                                  } finally {
                                    setRatingLoading(false);
                                  }
                                }}
                              />
                            </div>
                          );
                        })()}

                        <div>
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
                                      confirmExchange={()=>{setMensajeIntercambio(mensaje); setShowConfirmExchange(true);}}
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
                        <div ref={chatMessagesEndRef} />
{/* Banner permanente de intercambio */}
                        {intercambioCompletado && (
                          <div style={{background:'#e8f5e9',color:'#256029',padding:'12px 18px',borderRadius:10,marginTop:12,marginBottom:8,fontSize:14,fontWeight:600,boxShadow:'0 1px 2px #0001',textAlign:'center'}}>
                            <div style={{marginBottom:4}}>Intercambio completado con éxito el {intercambioCompletado}</div>
                            <div style={{fontSize:24}}>🔄</div>
                          </div>
                        )}
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
        onConfirm={handleDeleteMessage}
        title="Eliminar mensaje"
        message="¿Estás seguro que deseas eliminar este mensaje? Esta acción no se puede deshacer."
        confirmText="Eliminar mensaje"
      />




    </div>
  );
};

export default PerfilUsuario;