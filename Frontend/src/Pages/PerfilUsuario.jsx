import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import '../styles/PerfilUsuario-Remodelado.css';
import Header from '../Component/Header.jsx';
import ArticuloCard from '../components/ArticuloCard.jsx';
import Footer from '../Component/Footer.jsx';
import DeleteModal from '../Component/DeleteModal.jsx';
import ConfirmModal from '../Component/ConfirmModal.jsx';
import StepperIntercambio from '../Component/StepperIntercambio.jsx';
import '../styles/StepperIntercambio.css';
import ChatBubble from '../Component/ChatBubble.jsx';
import TransactionCard from '../Component/TransactionCard.jsx';
import RatingModal from '../Component/RatingModal';
import { useDarkMode } from '../hooks/useDarkMode';

const API_URL = 'http://localhost:3001/api'; // Backend URL

const PerfilUsuario = () => {
  const [darkMode] = useDarkMode();
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuarioActual')));
  useEffect(() => {
    if (!usuario || !usuario.id) {
      window.location.href = '/login';
      return;
    }
  }, [usuario]);
  // --- DECLARACIÓN DE ESTADOS ---

  // Sincronización global de usuario tras edición (todos los datos)
  useEffect(() => {
    const handleProfileUpdated = (event) => {
      const updatedUser = event.detail;
      // Actualizar todos los campos relevantes del usuario
      setUsuario(updatedUser);
      localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
      // Imagen de perfil robusta
      let imagenUrl = '/images/fotoperfil.jpg';
      if (updatedUser.imagen) {
        if (updatedUser.imagen.startsWith('data:image')) {
          imagenUrl = updatedUser.imagen;
        } else if (updatedUser.imagen.startsWith('http')) {
          imagenUrl = updatedUser.imagen;
        } else {
          imagenUrl = updatedUser.imagen.startsWith('/')
            ? `${API_URL}${updatedUser.imagen}`
            : `${API_URL}/${updatedUser.imagen}`;
        }
      }
      setImagenPerfil(imagenUrl);
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdated);
    // Al montar, sincronizar desde localStorage si existe actualización pendiente
    const usuarioLS = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioLS && usuarioLS.id) {
      setUsuario(usuarioLS);
      let imagenUrl = '/images/fotoperfil.jpg';
      if (usuarioLS.imagen) {
        if (usuarioLS.imagen.startsWith('data:image')) {
          imagenUrl = usuarioLS.imagen;
        } else if (usuarioLS.imagen.startsWith('http')) {
          imagenUrl = usuarioLS.imagen;
        } else {
          imagenUrl = usuarioLS.imagen.startsWith('/')
            ? `${API_URL}${usuarioLS.imagen}`
            : `${API_URL}/${usuarioLS.imagen}`;
        }
      }
      setImagenPerfil(imagenUrl);
    }
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdated);
  }, []);

  // Pestaña activa ('articulos', 'transacciones', 'mensajes', 'favoritos')
  const [activeTab, setActiveTab] = useState('articulos');

  // Cargar favoritos desde localStorage
  useEffect(() => {
    const loadFavorites = () => {
      const favoritesFromStorage = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoritos(favoritesFromStorage);
    };
    
    loadFavorites();
    
    // Escuchar cambios en localStorage (cuando se agregan/quitan favoritos)
    const handleStorageChange = (e) => {
      if (e.key === 'favorites') {
        loadFavorites();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleFavoritesChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesChanged', handleFavoritesChange);
    };
  }, []);

  // Función para eliminar producto de favoritos
  const handleRemoveFromFavorites = (productId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updatedFavorites = favorites.filter(fav => fav.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavoritos(updatedFavorites);
    
    // Disparar evento para sincronizar con otros componentes
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  // Datos del usuario y sus productos
  
  const [productos, setProductos] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  // Imagen de perfil sincronizada globalmente
  const [imagenPerfil, setImagenPerfil] = useState('/images/fotoperfil.jpg');

  // Gestión de chats y mensajes
  const [chats, setChats] = useState({});
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  // Refs para scroll inteligente
  
  
  // Para saber si el usuario envió el último mensaje
  const lastMessageFromMeRef = useRef(false);

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

  // --- SCROLL INTELIGENTE ---
  // Guardar si el usuario estaba abajo ANTES del update
  const wasUserAtBottomRef = useRef(true);
  useLayoutEffect(() => {
    if (activeTab !== 'mensajes') return;
    wasUserAtBottomRef.current = isUserAtBottom();
  }, [chatSeleccionado]);

  // Scroll inteligente: solo baja si el usuario estaba abajo o si envió mensaje propio
  useLayoutEffect(() => {
    if (activeTab !== 'mensajes') return;
    const mensajes = chats[chatSeleccionado] || [];
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    const ultimoMensaje = mensajes[mensajes.length - 1];
    // Detectar si el último mensaje es del usuario actual
    const fromMe = ultimoMensaje && usuarioActual && ultimoMensaje.deId === usuarioActual.id;
    // Si el usuario estaba abajo o envió mensaje propio, scrollea
    if (wasUserAtBottomRef.current || fromMe) {
      scrollToBottom();
    }
    // Actualizar ref para la próxima
    lastMessageFromMeRef.current = !!fromMe;
  }, [chats, chatSeleccionado, activeTab]);

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

// Mantener el chat seleccionado tras polling/fetch
  useEffect(() => {
    // Si el chat seleccionado ya no existe tras un fetch, selecciona el primero disponible
    if (chatSeleccionado && chats[chatSeleccionado]) {
      // El chat seleccionado sigue existiendo, no hacer nada
      return;
    }
    const chatKeys = Object.keys(chats);
    if (chatKeys.length > 0) {
      setChatSeleccionado(chatKeys[0]);
    } else {
      setChatSeleccionado(null); // No hay chats disponibles
    }
  }, [chats, chatSeleccionado]);

  // Eliminar un chat completo (todos los mensajes)
  const handleDeleteChat = async (chatKey) => {
    const mensajesChat = chats[chatKey];
    if (!mensajesChat || mensajesChat.length === 0) return;
    if (!window.confirm("¿Eliminar este chat y todos sus mensajes?")) return;
    // Elimina todos los mensajes de este chat en el backend
    for (const msg of mensajesChat) {
      await fetch(`${API_URL}/messages/${msg._id || msg.id}`, { method: 'DELETE' });
    }
    // Quita el chat del estado local
    setChats(prev => {
      const nuevo = { ...prev };
      delete nuevo[chatKey];
      return nuevo;
    });
    // Si el chat eliminado era el seleccionado, selecciona el siguiente disponible
    const chatKeys = Object.keys(chats).filter(key => key !== chatKey);
    setChatSeleccionado(chatKeys.length > 0 ? chatKeys[0] : null);
    // Refresca mensajes desde backend para asegurar sincronización
    fetchMensajes(userData.id);
  };


  // Efecto para recargar productos y transacciones tras un intercambio
  useEffect(() => {
    const handleProductsUpdated = () => {
      // Vuelve a cargar los datos del usuario (productos y transacciones)
      if (typeof loadUserData === 'function') {
        loadUserData();
      }
    };
    
    const handleProfileUpdated = (event) => {
      console.log('🔄 Perfil actualizado detectado, sincronizando datos...');
      console.log('📦 Datos del evento:', event.detail);
      const updatedUser = event.detail;
      
      // Actualizar el estado del usuario con los nuevos datos
      console.log('🔄 Actualizando userData con:', updatedUser);
      setUserData(updatedUser);
      
      // Actualizar la imagen de perfil si cambió
      if (updatedUser.imagen) {
        let imagenUrl = '';
        if (updatedUser.imagen.startsWith('data:')) {
          imagenUrl = updatedUser.imagen;
        } else if (updatedUser.imagen.startsWith('http')) {
          imagenUrl = updatedUser.imagen;
        } else {
          const API_URL = 'http://localhost:3001/api';
          imagenUrl = updatedUser.imagen.startsWith('/') 
            ? `${API_URL}${updatedUser.imagen}` 
            : `${API_URL}/${updatedUser.imagen}`;
        }
        console.log('🖼️ Actualizando imagen de perfil a:', imagenUrl);
        setImagenPerfil(imagenUrl);
      }
      
      console.log('✅ Datos del perfil sincronizados exitosamente');
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    window.addEventListener('userProfileUpdated', handleProfileUpdated);
    
    console.log('🎧 Event listeners registrados: productsUpdated y userProfileUpdated');
    
    // Verificar si hay actualizaciones pendientes en localStorage
    const checkPendingUpdates = () => {
      console.log('🔍 Verificando actualizaciones pendientes en localStorage...');
      const pendingUpdate = localStorage.getItem('profileUpdatePending');
      console.log('💾 Contenido de profileUpdatePending:', pendingUpdate);
      
      if (pendingUpdate) {
        try {
          const updateData = JSON.parse(pendingUpdate);
          const timeDiff = Date.now() - updateData.timestamp;
          
          // Si la actualización es reciente (menos de 30 segundos)
          if (timeDiff < 30000) {
            console.log('🔄 Actualización pendiente encontrada en localStorage');
            console.log('📦 Aplicando datos pendientes:', updateData.userData);
            
            // Aplicar la actualización
            setUserData(updateData.userData);
            
            // Actualizar imagen si es necesario
            if (updateData.userData.imagen) {
              let imagenUrl = '';
              if (updateData.userData.imagen.startsWith('data:')) {
                imagenUrl = updateData.userData.imagen;
              } else if (updateData.userData.imagen.startsWith('http')) {
                imagenUrl = updateData.userData.imagen;
              } else {
                const API_URL = 'http://localhost:3001/api';
                imagenUrl = updateData.userData.imagen.startsWith('/') 
                  ? `${API_URL}${updateData.userData.imagen}` 
                  : `${API_URL}/${updateData.userData.imagen}`;
              }
              setImagenPerfil(imagenUrl);
            }
            
            console.log('✅ Actualización pendiente aplicada exitosamente');
          }
          
          // Limpiar la actualización pendiente
          localStorage.removeItem('profileUpdatePending');
          console.log('🧹 Actualización pendiente limpiada de localStorage');
          
        } catch (error) {
          console.error('❌ Error procesando actualización pendiente:', error);
          localStorage.removeItem('profileUpdatePending');
        }
      }
    };
    
    // Verificar actualizaciones pendientes al montar el componente
    console.log('🚀 Llamando a checkPendingUpdates...');
    checkPendingUpdates();
    console.log('✅ checkPendingUpdates ejecutado');
    
    return () => {
      console.log('🧹 Removiendo event listeners');
      window.removeEventListener('productsUpdated', handleProductsUpdated);
      window.removeEventListener('userProfileUpdated', handleProfileUpdated);
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
            provincia: dataUser.provincia || usuario.provincia || 'Tucumán',
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

  // Función para marcar producto como intercambiado
  const handleMarkAsExchanged = async (producto) => {
    if (!window.confirm(`¿Estás seguro de que quieres marcar "${producto.title}" como intercambiado?`)) {
      return;
    }

    try {
      console.log('🔄 Marcando producto como intercambiado:', producto.title);
      
      // 1. Actualizar estado local inmediatamente
      setUserListings(prev => prev.filter(p => p.id !== producto.id));
      
      // 2. Crear nueva transacción para "Mis Intercambios"
      const nuevaTransaccion = {
        id: Date.now().toString(),
        productoOfrecido: producto.title,
        productoOfrecidoId: producto.id,
        productoSolicitado: 'Intercambio directo',
        productoSolicitadoId: null,
        estado: 'completado',
        fecha: new Date().toISOString(),
        tipo: 'intercambio_directo',
        descripcion: `Producto "${producto.title}" marcado como intercambiado`
      };

      // 3. Actualizar transacciones localmente
      setUserData(prev => ({
        ...prev,
        transacciones: [...(prev.transacciones || []), nuevaTransaccion]
      }));

      // 4. Persistir cambios en el backend
      // Marcar producto como intercambiado
      const productResponse = await fetch(`${API_URL}/products/${producto.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ intercambiado: true })
      });

      if (!productResponse.ok) {
        throw new Error('Error al marcar producto como intercambiado');
      }

      // Actualizar transacciones del usuario en el backend
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      const updatedTransacciones = [...(usuarioActual.transacciones || []), nuevaTransaccion];

      const userResponse = await fetch(`${API_URL}/users/${usuarioActual.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transacciones: updatedTransacciones })
      });

      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
        console.log('✅ Producto marcado como intercambiado exitosamente');
        
        // Mostrar mensaje de éxito
        alert(`"${producto.title}" ha sido marcado como intercambiado y aparecerá en "Mis Intercambios"`);
      }

    } catch (error) {
      console.error('❌ Error al marcar como intercambiado:', error);
      alert('Hubo un error al marcar el producto como intercambiado. Por favor, inténtalo de nuevo.');
      
      // Revertir cambios locales en caso de error
      setUserListings(prev => [...prev, producto]);
      setUserData(prev => ({
        ...prev,
        transacciones: prev.transacciones.filter(t => t.id !== nuevaTransaccion.id)
      }));
    }
  };

  // Función para volver a publicar producto desde intercambios
  const handleRepublish = async (transaccion) => {
    if (!window.confirm(`¿Estás seguro de que quieres volver a publicar "${transaccion.productoOfrecido}"?`)) {
      return;
    }

    try {
      console.log('🔄 Volviendo a publicar producto:', transaccion.productoOfrecido);
      
      // 1. Buscar el producto en el backend usando el ID de la transacción
      const productResponse = await fetch(`${API_URL}/products/${transaccion.productoOfrecidoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!productResponse.ok) {
        throw new Error('No se pudo encontrar el producto');
      }

      const producto = await productResponse.json();

      // 2. Marcar producto como NO intercambiado en el backend
      const updateResponse = await fetch(`${API_URL}/products/${transaccion.productoOfrecidoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ intercambiado: false })
      });

      if (!updateResponse.ok) {
        throw new Error('Error al actualizar el producto');
      }

      // 3. Actualizar estado local inmediatamente
      // Agregar producto de vuelta a "Mis Artículos"
      setUserListings(prev => [...prev, {
        ...producto,
        intercambiado: false,
        estado: 'activo'
      }]);
      
      // Remover transacción de "Mis Intercambios"
      setUserData(prev => ({
        ...prev,
        transacciones: prev.transacciones.filter(t => t.id !== transaccion.id)
      }));

      // 4. Actualizar transacciones del usuario en el backend
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      const updatedTransacciones = usuarioActual.transacciones.filter(t => t.id !== transaccion.id);

      const userResponse = await fetch(`${API_URL}/users/${usuarioActual.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transacciones: updatedTransacciones })
      });

      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
        console.log('✅ Producto republicado exitosamente');
        
        // Mostrar mensaje de éxito
        alert(`"${transaccion.productoOfrecido}" ha sido republicado y aparecerá en "Mis Artículos"`);
        
        // Cambiar automáticamente a la pestaña de artículos
        setActiveTab('articulos');
      }

    } catch (error) {
      console.error('❌ Error al republicar producto:', error);
      alert('Hubo un error al republicar el producto. Por favor, inténtalo de nuevo.');
    }
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

  const handleRefreshMensaje = React.useCallback(() => {
    // Solo refrescar si realmente es necesario (ej: después de enviar un mensaje)
    if (userData?.id) {
      fetchMensajes(userData.id);
    }
  }, [userData?.id]);

  // Estado para controlar si el usuario está en la pestaña de mensajes y la visibilidad
  const [isMessagesTabActive, setIsMessagesTabActive] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsMessagesTabActive(document.visibilityState === 'visible' && activeTab === 'mensajes');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab]);

  // Eliminado useEffect con polling inteligente
  // useEffect(() => {
  //   if (!userData?.id || activeTab !== 'mensajes') return;
  //   let timeoutId;
  //   let isMounted = true;
  //   // Eliminado fetchWithBackoff - causaba re-renders constantes
  //   // const fetchWithBackoff = async (attempt = 0) => {
  //   //   if (!isMounted) return;
  //   //   try {
  //   //     await fetchMensajes(userData.id);
  //   //     const delay = 15000; // 15 segundos entre fetchs exitosos
  //   //     timeoutId = setTimeout(() => fetchWithBackoff(0), delay);
  //   //   } catch (error) {
  //   //     // Si hay error, esperar más tiempo antes de reintentar
  //   //     const delay = Math.min(1000 * (2 ** (attempt + 1)), 60000);
  //   //     timeoutId = setTimeout(() => fetchWithBackoff(attempt + 1), delay);
  //   //   }
  //   // };
  //   // fetchWithBackoff();
  //   return () => {
  //     isMounted = false;
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [userData?.id, activeTab, isMessagesTabActive]);

  // Scroll inteligente: solo bajar automáticamente cuando corresponde
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [userSentMessage, setUserSentMessage] = React.useState(false);
  const chatMessagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  
  // Detectar si el usuario está al final del chat
  const isUserAtBottom = React.useCallback(() => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // 50px de tolerancia
  }, []);
  
  // Scroll inteligente: solo cuando el usuario envía mensaje o está al final
  const scrollToBottom = React.useCallback((force = false) => {
    if (force || userSentMessage || isUserAtBottom()) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUserSentMessage(false);
    }
  }, [userSentMessage, isUserAtBottom]);

  // Optimizar renderizado de mensajes del chat
  const chatMessages = React.useMemo(() => {
    if (!chatSeleccionado || !chats[chatSeleccionado]) return [];
    return chats[chatSeleccionado];
  }, [chatSeleccionado, chats]);

  // Detectar si el usuario está al final del chat
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Solo activar autoScroll si está a menos de 100px del fondo
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
  };

  // Efecto: solo hacer scroll automático si el usuario está al final
  React.useEffect(() => {
    if (autoScroll && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, autoScroll]);

  // Cuando el usuario envía un mensaje, forzar autoScroll
  // (NO redeclarar, solo mantener la original que ya existe antes en el archivo)

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
      {/* Botón Regresar */}
      <div className="regresar-container-premium">
        <button className="btn-regresar-premium" onClick={() => navigate("/")}> 
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Regresar
        </button>
      </div>

      {/* Cabecera Premium */}
      <div className="perfil-header-premium">
        <div 
          className="perfil-card-premium"
        >
          {/* Avatar Premium */}
          <div className="avatar-container-premium">
            <div className="avatar-wrapper-premium">
              <img 
                src={imagenPerfil} 
                alt="Foto de perfil" 
                className="avatar-image-premium"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/images/fotoperfil.jpg';
                }}
              />
              <div className="avatar-ring-premium"></div>
            </div>
          </div>

          {/* Información Principal */}
          <div className="perfil-main-info-premium">
            <h1 className="perfil-nombre-premium">
              {`${capitalize(userData.nombre)} ${capitalize(userData.apellido)}`}
            </h1>
            
            {/* Stats Premium */}
            <div className="perfil-stats-premium">
              <div className="stat-card-premium">
                <button
                  className="rating-button-premium"
                  onClick={() => navigate(`/calificaciones/${userData.id}`)}
                  aria-label="Ver calificaciones"
                >
                  <div className="rating-content-premium">
                    <div className="stars-premium">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star star-premium`}
                          style={{
                            color: userData?.calificacion >= star ? '#FFD700' : '#e1e5e9',
                          }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="rating-number-premium">
                      {userData?.calificacion?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </button>
                <span className="stat-label-premium">Calificación</span>
              </div>
              
              <div className="stat-card-premium">
                <div className="stat-number-premium">{userData.transacciones.length}</div>
                <span className="stat-label-premium">Transacciones</span>
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
                <span className="detalle-value-premium">{(userData.zona || userData.ubicacion || 'Tucumán')}</span>
              </div>
              
              {userData.mostrarContacto ? (
                <>
                  <div className="detalle-item-premium">
                    <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span className="detalle-label-premium">Email:</span>
                    <span className="detalle-value-premium">{userData.email || 'No disponible'}</span>
                  </div>
                  <div className="detalle-item-premium">
                    <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="detalle-label-premium">Teléfono:</span>
                    <span className="detalle-value-premium">{userData.telefono || 'Privado'}</span>
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

            {/* Botones de Acción Premium */}
            <div className="perfil-acciones-premium">
              <button className="btn-editar-premium" onClick={handleEditClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar Perfil
              </button>
              <button className="btn-configuracion-premium" onClick={() => navigate('/configuracion')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="perfil-usuario-content">

        {/* Tabs Premium */}
        <div className="perfil-tabs-premium">
          <button className={`tab-btn-premium ${activeTab === 'articulos' ? 'active' : ''}`} onClick={() => handleTabChange('articulos')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
            Mis Artículos
          </button>
          <button className={`tab-btn-premium ${activeTab === 'transacciones' ? 'active' : ''}`} onClick={() => handleTabChange('transacciones')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10"></path>
              <path d="M7 17 17 7"></path>
            </svg>
            Mis Intercambios
          </button>
          <button className={`tab-btn-premium ${activeTab === 'mensajes' ? 'active' : ''}`} onClick={() => handleTabChange('mensajes')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Mensajes
          </button>
          <button className={`tab-btn-premium ${activeTab === 'favoritos' ? 'active' : ''}`} onClick={() => handleTabChange('favoritos')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Favoritos
          </button>
        </div>

        <div className="perfil-tab-content">
          {activeTab === 'favoritos' && (
            <div className="mis-favoritos">
              <h2>Favoritos</h2>
              {/* Aquí se mostrarán los productos favoritos del usuario */}
              {Array.isArray(favoritos) && favoritos.length > 0 ? (
                <div className="favoritos-grid">
                  {favoritos.map((producto) => (
                    <div key={producto.id || producto._id} className="favorito-card-premium">
                      <div className="favorito-img-wrap">
                        <img
                          src={
                            producto.images && producto.images.length > 0
                              ? producto.images[0] || '/images/placeholder-product.jpg'
                              : producto.image || '/images/placeholder-product.jpg'
                          }
                          alt={producto.title}
                          className="favorito-img"
                        />
                      </div>
                      <div className="favorito-content">
                        <div className="favorito-categoria-badge">
                          {producto.categoria}
                        </div>
                        <h3 className="favorito-title">{producto.title}</h3>
                        <p className="favorito-desc">{producto.description}</p>
                        <div className="favorito-meta-box">
                          <div className="favorito-fecha-simple">
                            Publicado el: {producto.fechaPublicacion ? new Date(producto.fechaPublicacion).toLocaleDateString() : 'Sin fecha'}
                          </div>
                          <div className="favorito-provincia-simple">
                            En: {producto.provincia || 'Sin especificar'}
                          </div>
                        </div>
                        <div className="favorito-actions">
                          <button 
                            className="favorito-consultar-btn" 
                            onClick={() => navigate(`/producto/${producto.id}`)}
                            title="Consultar este producto"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Consultar este producto
                          </button>
                          <button 
                            className="favorito-remove-btn" 
                            onClick={() => handleRemoveFromFavorites(producto.id)}
                            title="Eliminar de favoritos"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            Eliminar de favoritos
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes productos favoritos aún.</p>
              )}
            </div>
          )}
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
                    <ArticuloCard
                      key={producto.id}
                      producto={{
                        ...producto,
                        fechaPublicacion: producto.fechaPublicacion || producto.createdAt,
                        estado: producto.intercambiado ? 'intercambiado' : 'activo',
                      }}
                      onEdit={handleEditarProducto}
                      onMarkAsExchanged={handleMarkAsExchanged}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transacciones' && (
            <div className="mis-transacciones">
              <h2>Mis Intercambios</h2>
              {userData.transacciones.length === 0 ? (
                <p>No tienes intercambios aún.</p>
              ) : (
                <div className="transacciones-grid">
                  {userData.transacciones
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
                    .map((t, idx) => (
                    <TransactionCard
                      key={idx}
                      transaccion={t}
                      currentUserId={userData.id}
                      onDelete={() => {
                        setTransToDelete({ ...t, idx });
                        setShowConfirmDeleteTrans(true);
                      }}
                      onRate={(ratingData) => {
                        setRatingTarget(ratingData);
                        setShowRatingModal(true);
                      }}
                      onRepublish={handleRepublish}
                    />
                  ))}
                </div>
              )}
              {/* Modal de confirmación para eliminar transacción */}
              <ConfirmModal
                isOpen={showConfirmDeleteTrans}
                onCancel={() => { setShowConfirmDeleteTrans(false); setTransToDelete(null); }}
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
                      
                      // Mostrar toast de confirmación
                      const toast = document.createElement('div');
                      toast.textContent = 'Registro de intercambio eliminado exitosamente';
                      toast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        z-index: 10000;
                        font-weight: 600;
                        font-size: 14px;
                        animation: slideInRight 0.3s ease-out;
                      `;
                      document.body.appendChild(toast);
                      
                      // Eliminar toast después de 3 segundos
                      setTimeout(() => {
                        if (toast.parentNode) {
                          toast.style.animation = 'slideOutRight 0.3s ease-out';
                          setTimeout(() => {
                            if (toast.parentNode) {
                              document.body.removeChild(toast);
                            }
                          }, 300);
                        }
                      }, 3000);
                      
                    } catch (err) {
                      console.error('❌ Error al eliminar transacción:', err);
                      
                      // Toast de error
                      const errorToast = document.createElement('div');
                      errorToast.textContent = 'Error al eliminar el registro';
                      errorToast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                        z-index: 10000;
                        font-weight: 600;
                        font-size: 14px;
                      `;
                      document.body.appendChild(errorToast);
                      
                      setTimeout(() => {
                        if (errorToast.parentNode) {
                          document.body.removeChild(errorToast);
                        }
                      }, 3000);
                    } finally {
                      setShowConfirmDeleteTrans(false);
                      setTransToDelete(null);
                    }
                  }}
                  title="Eliminar registro de intercambio"
                  message="¿Estás seguro que deseas eliminar este registro de intercambio? Esta acción no se puede deshacer."
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

                          <div className="chat-row">
                            {(() => {
                              let avatarUrl = '';
                              let iniciales = '';
                              
                              if (ultimoMensaje) {
                                if (ultimoMensaje.deId === usuarioActual.id) {
                                  // Mostrar avatar del destinatario (el otro usuario)
                                  avatarUrl = ultimoMensaje.paraImagen || '';
                                  iniciales = (ultimoMensaje.paraNombre || ultimoMensaje.para || 'U').substring(0, 2).toUpperCase();
                                } else {
                                  // Mostrar avatar del remitente (el otro usuario)
                                  avatarUrl = ultimoMensaje.deImagen || '';
                                  iniciales = (ultimoMensaje.deNombre || ultimoMensaje.de || 'U').substring(0, 2).toUpperCase();
                                }
                              }
                              
                              // Priorizar siempre la imagen real del backend
                              return (
                                <>
                                  {avatarUrl ? (
                                    <img
                                      className="chat-avatar"
                                      src={avatarUrl}
                                      alt="avatar"
                                      onError={(e) => {
                                        // Solo si falla la carga de imagen, mostrar iniciales
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  {/* Fallback con iniciales solo si no hay imagen */}
                                  <div
                                    className="chat-avatar"
                                    style={{
                                      display: avatarUrl ? 'none' : 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'linear-gradient(135deg, #b0e0ff 0%, #92d1fa 100%)',
                                      color: '#2d9cdb',
                                      fontSize: '14px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {iniciales}
                                  </div>
                                </>
                              );
                            })()}
                            <div className="chat-name">{otroNombre}</div>
                            {noLeidos && (
                              <span className="chat-badge">{unreadByChat[key]}</span>
                            )}
                          </div>
                          <div className="chat-preview">
                            {textoUltimo}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* mensajes del chat seleccionado */}
                  <div className="chat-messages" style={{flex:1, overflowY:'auto', maxHeight:'60vh'}} ref={chatContainerRef}>
                                        {(!chatSeleccionado || !chats[chatSeleccionado] || chats[chatSeleccionado].length === 0) ? (
                      <p>Selecciona un chat</p>
                    ) : (
                      <div>
                        <div className="chat-header-premium" style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 16, 
                          background: 'linear-gradient(135deg, #f7faff 0%, #e6f2fb 100%)', 
                          borderRadius: 16, 
                          padding: '12px 20px', 
                          marginBottom: '1rem', 
                          boxShadow: '0 4px 12px rgba(146, 209, 250, 0.15)',
                          border: '1px solid #b0e0ff'
                        }}>
                          {/* Avatar del usuario actual */}
                          <img
                            src={userData.imagen || '/avatar-default.png'}
                            alt="Tu avatar"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              border: '2px solid #92d1fa',
                              boxShadow: '0 2px 6px rgba(146, 209, 250, 0.3)',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = '/avatar-default.png';
                            }}
                          />
                          
                          {/* Icono de intercambio */}
                          <div style={{
                            background: 'linear-gradient(135deg, #2d9cdb 0%, #38a3e2 100%)',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 'bold',
                            boxShadow: '0 2px 6px rgba(45, 156, 219, 0.3)'
                          }}>
                            ⇄
                          </div>
                          
                          {/* Avatar del otro usuario */}
                          {(() => {
                            const mensajesChat = chats[chatSeleccionado];
                            if (!mensajesChat || mensajesChat.length === 0) return null;
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            
                            // Buscar en todos los mensajes para encontrar la imagen del otro usuario
                            let otherUserImage = '';
                            let otherUserName = '';
                            let iniciales = '';
                            
                            for (const mensaje of mensajesChat) {
                              if (mensaje.deId === usuarioActual.id) {
                                // El otro usuario es el destinatario
                                if (mensaje.paraImagen) {
                                  otherUserImage = mensaje.paraImagen;
                                }
                                if (!otherUserName && mensaje.paraNombre) {
                                  otherUserName = mensaje.paraNombre;
                                }
                              } else {
                                // El otro usuario es el remitente
                                if (mensaje.deImagen) {
                                  otherUserImage = mensaje.deImagen;
                                }
                                if (!otherUserName && mensaje.deNombre) {
                                  otherUserName = mensaje.deNombre;
                                }
                              }
                              
                              // Si ya tenemos imagen y nombre, salir del loop
                              if (otherUserImage && otherUserName) break;
                            }
                            
                            // Fallback para el nombre
                            if (!otherUserName) {
                              const ultimoMensaje = mensajesChat[mensajesChat.length - 1];
                              if (ultimoMensaje.deId === usuarioActual.id) {
                                otherUserName = ultimoMensaje.paraNombre || ultimoMensaje.para || 'Usuario';
                              } else {
                                otherUserName = ultimoMensaje.deNombre || ultimoMensaje.de || 'Usuario';
                              }
                            }
                            
                            iniciales = otherUserName.substring(0, 2).toUpperCase();
                            
                            return otherUserImage ? (
                              <img
                                src={otherUserImage}
                                alt={`Avatar de ${otherUserName}`}
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: '50%',
                                  border: '2px solid #92d1fa',
                                  boxShadow: '0 2px 6px rgba(146, 209, 250, 0.3)',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  // Si falla la imagen, crear avatar con iniciales
                                  e.target.style.display = 'none';
                                  const fallbackDiv = document.createElement('div');
                                  fallbackDiv.className = 'chat-avatar';
                                  fallbackDiv.style.cssText = `
                                    width: 42px;
                                    height: 42px;
                                    border-radius: 50%;
                                    border: 2px solid #92d1fa;
                                    box-shadow: 0 2px 6px rgba(146, 209, 250, 0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    background: linear-gradient(135deg, #b0e0ff 0%, #92d1fa 100%);
                                    color: #2d9cdb;
                                    font-size: 14px;
                                    font-weight: bold;
                                  `;
                                  fallbackDiv.textContent = iniciales;
                                  e.target.parentNode.insertBefore(fallbackDiv, e.target.nextSibling);
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: '50%',
                                  border: '2px solid #92d1fa',
                                  boxShadow: '0 2px 6px rgba(146, 209, 250, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'linear-gradient(135deg, #b0e0ff 0%, #92d1fa 100%)',
                                  color: '#2d9cdb',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}
                              >
                                {iniciales}
                              </div>
                            );
                          })()} 
                          
                          {/* Información del chat */}
                          <div style={{ flex: 1, marginLeft: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#2d9cdb', marginBottom: 2 }}>
                              {(() => {
                                const mensajesChat = chats[chatSeleccionado];
                                if (!mensajesChat || mensajesChat.length === 0) return 'Chat';
                                const ultimoMensaje = mensajesChat[mensajesChat.length - 1];
                                const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                                if (ultimoMensaje) {
                                  if (ultimoMensaje.deId === usuarioActual.id) {
                                    return ultimoMensaje.paraNombre || ultimoMensaje.para || 'Usuario';
                                  } else {
                                    return ultimoMensaje.deNombre || ultimoMensaje.de || 'Usuario';
                                  }
                                }
                                return 'Chat';
                              })()} 
                            </div>
                            <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                              Intercambio en progreso
                            </div>
                          </div>
                          
                          {/* Solo botón Ver Perfil */}
                          {(() => {
                            const mensajesChat = chats[chatSeleccionado];
                            if (!mensajesChat || mensajesChat.length === 0) return null;
                            const base = mensajesChat[0];
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            const otherId = base.deId === usuarioActual.id ? base.paraId : base.deId;
                            return (
                              <button
                                onClick={() => window.open(`/perfil/${otherId}`, '_blank')}
                                style={{ 
                                  background: 'linear-gradient(135deg, #2d9cdb 0%, #38a3e2 100%)', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: 20, 
                                  padding: '8px 16px', 
                                  fontSize: 14, 
                                  cursor: 'pointer', 
                                  fontWeight: 600,
                                  boxShadow: '0 2px 8px rgba(45, 156, 219, 0.3)',
                                  transition: 'all 0.2s'
                                }}
                                title="Ver perfil del usuario"
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(45, 156, 219, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 8px rgba(45, 156, 219, 0.3)';
                                }}
                              >
                                Ver Perfil
                              </button>
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
                          const avatarActual = userData.imagen || '';
                          
                          // Buscar avatar del otro usuario en los mensajes
                          let avatarOtro = '';
                          for (const mensaje of mensajes) {
                            if (mensaje.deId === usuarioActual.id) {
                              if (mensaje.paraImagen) {
                                avatarOtro = mensaje.paraImagen;
                                break;
                              }
                            } else {
                              if (mensaje.deImagen) {
                                avatarOtro = mensaje.deImagen;
                                break;
                              }
                            }
                          }
                          
                          const perfilActual = `/perfil`; // Ruta al perfil privado del usuario
                          const perfilOtro = `/perfil/${otroId}`; // Ruta al perfil público del otro usuario

                          const steps = [
                            { label: 'Propuesta enviada', icon: '⚡', completed: true },
                            { label: 'Tu confirmación', icon: '◉', completed: yoConfirmado, active: !yoConfirmado, userName: 'Tú', avatarUrl: avatarActual, profileUrl: perfilActual },
                            { label: `Confirmación de ${otroNombre || 'otro'}`, icon: '◉', completed: otroConfirmado, active: !otroConfirmado && yoConfirmado, userName: otroNombre, avatarUrl: avatarOtro, profileUrl: perfilOtro },
                            { label: 'Intercambio completado', icon: '✦', completed: intercambioCompletado }
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
                              {/* Botón de calificación movido al final del chat */}

                              <RatingModal
                                open={showRatingModal}
                                onClose={()=>setShowRatingModal(false)}
                                userName={ratingTarget?.otroNombre || 'usuario'}
                                onSubmit={async ({stars, comment}) => {
                                  setRatingLoading(true);
                                  try {
                                    // Obtener datos del intercambio desde el mensaje
                                    const productoOfrecido = mensajeIntercambio?.productoOfrecido || '';
                                    const productoSolicitado = mensajeIntercambio?.productoTitle || '';
                                    
                                    await fetch(`${API_URL}/ratings`, {
                                      method: 'POST',
                                      headers: {'Content-Type': 'application/json'},
                                      body: JSON.stringify({
                                        deId: usuarioActual.id,
                                        paraId: ratingTarget.otroId,
                                        transId: ratingTarget.transId,
                                        stars,
                                        comment,
                                        productoOfrecido,
                                        productoSolicitado
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
                                      senderProfileImage={
  mensaje.deId === usuarioActual.id
    ? usuarioActual.imagen
    : (mensaje.deId !== usuarioActual.id && mensaje.deImagen)
      ? mensaje.deImagen
      : (mensaje.paraId !== usuarioActual.id && mensaje.paraImagen)
        ? mensaje.paraImagen
        : avatarOtro
}
                                      currentUserProfileImage={usuarioActual.imagen}
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
                          
                          {/* Botón de calificación al final del chat */}
                          {(() => {
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            const mensajes = chats[chatSeleccionado] || [];
                            const mensajeIntercambio = mensajes.find(m => m.productoId && m.productoOfrecidoId);
                            
                            if (!mensajeIntercambio) return null;
                            
                            const intercambioCompletado = mensajeIntercambio.confirmaciones?.length >= 2;
                            const otroId = mensajeIntercambio.deId === usuarioActual.id ? mensajeIntercambio.paraId : mensajeIntercambio.deId;
                            const otroNombre = mensajeIntercambio.deId === usuarioActual.id ? 
                              (mensajeIntercambio.paraNombre || mensajeIntercambio.para || 'el usuario') : 
                              (mensajeIntercambio.deNombre || mensajeIntercambio.de || 'el usuario');
                            const puedeCalificar = intercambioCompletado && !mensajeIntercambio.calificado;
                            
                            return puedeCalificar ? (
                              <div style={{ 
                                marginTop: 16, 
                                padding: '16px 20px', 
                                background: '#ffffff', 
                                borderRadius: 12, 
                                border: '2px solid #e8f5e8',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                  <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)'
                                  }}>✓</div>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: 17, color: '#1a237e', marginBottom: 4 }}>
                                      ¡Intercambio completado con éxito!
                                    </div>
                                    <div style={{ fontSize: 15, color: '#283593', fontWeight: 600 }}>
                                      Califica tu experiencia con <span style={{ 
                                        color: '#1565c0', 
                                        fontWeight: 800,
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                      }}>{otroNombre || 'el usuario'}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  style={{
                                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 25,
                                    padding: '14px 28px',
                                    fontWeight: 800,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3), 0 0 0 0 rgba(76, 175, 80, 0.5)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                    animation: 'pulseGlowGreen 2s ease-in-out infinite alternate'
                                  }}
                                  onClick={()=>{ setRatingTarget({otroId, otroNombre, transId: mensajeIntercambio.transId || mensajeIntercambio._id}); setShowRatingModal(true); }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                                    e.target.style.animation = 'none';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 20px rgba(76, 175, 80, 0.3), 0 0 0 0 rgba(76, 175, 80, 0.5)';
                                    e.target.style.animation = 'pulseGlowGreen 2s ease-in-out infinite alternate';
                                  }}
                                >
                                  ⭐ Calificar Ahora
                                </button>
                              </div>
                            ) : null;
                          })()}
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