import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import '../styles/PerfilUsuario-Remodelado.css';
import BackButton from '../Component/BackButton';
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
import DonationCard from '../Component/DonationCard.jsx';
import '../styles/DonationsList.css';
import { useDarkMode } from '../hooks/useDarkMode';
import { getProductImageUrl } from '../utils/getProductImageUrl';
import { normalizeImageUrl } from '../utils/normalizeImageUrl';
import ProductCard from '../Component/ProductCard.jsx';
import '../styles/Home.css';

const API_URL = 'http://localhost:3001/api'; // Backend URL

// Función para obtener URL de imágenes de donaciones
const getDonationImageUrl = (imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  return `${API_URL.replace('/api', '')}/uploads/products/${imageName}`;
};

// Helper para convertir un File a data URL (base64) para envío de imágenes
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });

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

  // Pestaña activa ('articulos', 'transacciones', 'mensajes', 'favoritos', 'donaciones')
  const [activeTab, setActiveTab] = useState('articulos');

  // Estados para donaciones
  const [donaciones, setDonaciones] = useState([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);

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
  // Donación asociada al chat seleccionado
  const [chatDonation, setChatDonation] = useState(null);
  const [chatDonationLoading, setChatDonationLoading] = useState(false);
  const [chatDonationError, setChatDonationError] = useState(null);

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
      const normalized = normalizeImageUrl(url);
      console.log('[AvatarOtro] url cruda:', url, ' normalizada:', normalized, ' idOtro:', idOtro);
      setAvatarOtro(normalized);
    } else if (idOtro) {
      import('../utils/getUserProfileImage').then(mod => mod.getUserProfileImage(idOtro).then(setAvatarOtro));
    } else {
      setAvatarOtro('/images/fotoperfil.jpg');
    }
  }, [chatSeleccionado, chats]);

  // Cargar detalles de la donación cuando el chat seleccionado está asociado a una donación
  useEffect(() => {
    try {
      setChatDonationError(null);
      if (!chatSeleccionado || !chats[chatSeleccionado] || chats[chatSeleccionado].length === 0) {
        setChatDonation(null);
        return;
      }
      const base = chats[chatSeleccionado][0];
      const did = base?.donacionId;
      if (!did) {
        setChatDonation(null);
        return;
      }
      setChatDonationLoading(true);
      fetch(`${API_URL}/donations/${did}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => setChatDonation(data))
        .catch(err => setChatDonationError(err.message || 'Error al cargar donación'))
        .finally(() => setChatDonationLoading(false));
    } catch (e) {
      setChatDonationError(e.message);
      setChatDonationLoading(false);
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
  // Confirmación para eliminar donación (en pestaña Mis Intercambios)
  const [showConfirmDeleteDonation, setShowConfirmDeleteDonation] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);

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

  // Agrupar mensajes en chats (separados por artículo y usuario)
  const agruparMensajes = (mensajes, userId) => {
    const chatsAgrupados = {};
    const noLeidosPorChat = {};

    const makeKey = (parts) => parts.filter(Boolean).join('::');

    mensajes.forEach(msg => {
      // Determinar el ID del otro usuario en el chat
      const otroUsuarioId = msg.deId === userId ? msg.paraId : msg.deId;

      // Identificador robusto de producto
      const productId = msg.productoId || msg.producto_ofrecido_id || msg.productoOfrecidoId || msg.producto?.id || msg.producto?.productoId || null;
      const productTitle = msg.productoTitle || msg.producto_ofrecido || msg.productoOfrecido || msg.producto?.title || msg.producto?.nombre || null;

      // Crear chatId robusto por contexto
      let chatId;
      if (msg.donacionId) {
        // Donaciones: separar por donacionId y usuario contraparte (sin ordenar)
        chatId = makeKey(['don', msg.donacionId, otroUsuarioId]);
      } else if (productId) {
        // Productos: separar por productId y usuario contraparte
        chatId = makeKey(['prod', productId, otroUsuarioId]);
      } else if (productTitle) {
        // Fallback: separar por título cuando no hay id (evita mezclar artículos distintos)
        chatId = makeKey(['prodt', productTitle.trim().toLowerCase(), otroUsuarioId]);
      } else {
        // Último recurso: separar por usuario (misceláneo)
        chatId = makeKey(['usr', otroUsuarioId]);
      }

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

    // Ordenar mensajes por fecha en cada chat y asegurar consistencia de nombres
    Object.keys(chatsAgrupados).forEach(chatId => {
      const chatMensajes = chatsAgrupados[chatId];
      chatMensajes.sort((a, b) => new Date(a.createdAt || a.fecha) - new Date(b.createdAt || b.fecha));

      if (chatMensajes.length > 0) {
        const primerMensaje = chatMensajes[0];
        const nombreConsistente = primerMensaje.deId === userId ?
          (primerMensaje.paraNombre || primerMensaje.para || 'Usuario') :
          (primerMensaje.deNombre || primerMensaje.de || 'Usuario');

        chatMensajes.forEach(msg => {
          if (msg.deId === userId) {
            msg.paraNombre = nombreConsistente;
          } else {
            msg.deNombre = nombreConsistente;
          }
        });
      }
    });

    return { chatsAgrupados, noLeidosPorChat };
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Sincronizar pestaña activa según la ruta (/chat) o estado de navegación
  useEffect(() => {
    if (location?.pathname === '/chat') {
      setActiveTab('mensajes');
      return;
    }
    if (location?.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location?.pathname, location?.state]);

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

  // Menú contextual global para lista de chats
  const [chatListMenu, setChatListMenu] = useState({ visible: false, x: 0, y: 0, key: null });
  const chatListMenuRef = useRef(null);

  useEffect(() => {
    if (!chatListMenu.visible) return;
    const handleClick = (e) => {
      if (chatListMenuRef.current && !chatListMenuRef.current.contains(e.target)) {
        setChatListMenu((p) => ({ ...p, visible: false }));
      }
    };
    const handleKey = (e) => { if (e.key === 'Escape') setChatListMenu((p) => ({ ...p, visible: false })); };
    const handleScrollOrResize = () => setChatListMenu((p) => ({ ...p, visible: false }));
    document.addEventListener('mousedown', handleClick, true);
    window.addEventListener('keydown', handleKey, true);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', handleClick, true);
      window.removeEventListener('keydown', handleKey, true);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize, true);
    };
  }, [chatListMenu.visible]);

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
  // Reemplazá TODO el cuerpo de updateChatsAndUnread por esto:
  const updateChatsAndUnread = React.useCallback(() => {
    const uid = userData?.id || JSON.parse(localStorage.getItem('usuarioActual'))?.id;
    if (!uid) return;
  
    const { chatsAgrupados, noLeidosPorChat } = agruparMensajes(mensajes, uid);
  
    setChats(chatsAgrupados);
    setUnreadByChat(noLeidosPorChat);
  }, [mensajes, userData?.id]);
  
  
  // Efecto para actualizar chats cuando cambian los mensajes
  useEffect(() => {
    if (mensajes.length === 0) return;
    const { chatsAgrupados, noLeidosPorChat } = agruparMensajes(mensajes, userData?.id);
    setChats(chatsAgrupados);
    setUnreadByChat(noLeidosPorChat);
  }, [mensajes, userData?.id]);
  
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

  // Marcar como leídos los mensajes del chat seleccionado y limpiar notificaciones
  useEffect(() => {
    if (activeTab !== 'mensajes' || !chatSeleccionado) return;
    const uid = userData?.id || JSON.parse(localStorage.getItem('usuarioActual') || '{}')?.id;
    if (!uid) return;

    // Solo si hay no leídos en el chat seleccionado
    if (!unreadByChat[chatSeleccionado] || unreadByChat[chatSeleccionado] <= 0) return;

    const markAsRead = async () => {
      try {
        // Backend: marcar mensajes como leídos para este usuario
        await fetch(`${API_URL}/messages/mark-read/${uid}`, { method: 'PUT' });

        // Actualizar estado local: agregar uid a leidoPor de los mensajes recibidos
        setMensajes(prev => prev.map(m => {
          const already = Array.isArray(m.leidoPor) && m.leidoPor.includes(uid);
          if (m.paraId === uid && !already) {
            return { ...m, leidoPor: [...(m.leidoPor || []), uid] };
          }
          return m;
        }));

        // Limpiar contador de no leídos del chat actual
        setUnreadByChat(prev => ({ ...prev, [chatSeleccionado]: 0 }));

        // Backend: marcar todas las notificaciones como leídas para este usuario
        try {
          await fetch(`${API_URL}/notifications/user/${uid}/read-all`, { method: 'PUT' });
        } catch (e) {
          // No bloquear si falla notificaciones
          console.warn('No se pudieron marcar notificaciones como leídas:', e);
        }
      } catch (e) {
        console.error('Error marcando mensajes como leídos:', e);
      }
    };

    markAsRead();
  }, [activeTab, chatSeleccionado, unreadByChat, userData?.id]);

  const fetchMensajes = (uid) => {
    const idToUse = uid || userData?.id;
    if (!idToUse) {
      console.log('❌ No hay ID de usuario');
      return;
    }
    
    fetch(`${API_URL}/messages/${idToUse}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const mapped = data.map(m => ({
          ...m,
          descripcion: m.descripcion || m.texto || '',
          deId: m.deId || m.de || null,
          paraId: m.paraId || m.para || null,
          deNombre: m.deNombre || m.de || '',
          paraNombre: m.paraNombre || m.para || '',
          fecha: m.createdAt || m.fecha || new Date().toISOString()
        }));
        
        
        
        // Actualizar mensajes
        const mensajesUnicos = uniqMessages(mapped);
        setMensajes(mensajesUnicos);
        
        // Agrupar mensajes en chats
        const { chatsAgrupados, noLeidosPorChat } = agruparMensajes(mensajesUnicos, idToUse);
        
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

  async function handleEnviarMensaje() {
    if (!chatSeleccionado || !chats[chatSeleccionado]?.length) return;
  
    const base = chats[chatSeleccionado][0];
    const otherId = base.deId === userData.id ? base.paraId : base.deId;
    const paraNombre = base.deId === userData.id ? (base.de || base.deNombre || '') : `${userData.nombre} ${userData.apellido}`;
    const hasContextOnly = (!nuevoTexto || !nuevoTexto.trim()) && !imagenAdjunta && (base.productoId || base.productoOfrecidoId || base.donacionId);
    // Si no hay texto ni imagen ni contexto, no enviar
    if (!nuevoTexto?.trim() && !imagenAdjunta && !hasContextOnly) return;
    // Mongoose requiere 'descripcion'. Determinar placeholder adecuado
    const descripcionFinal = (nuevoTexto && nuevoTexto.trim())
      ? nuevoTexto.trim()
      : (imagenAdjunta ? '[imagen]' : '[propuesta]');
  
    const tempId = `temp-${Date.now()}`;
    const mensajeOptimista = {
      _id: tempId,
      deId: userData.id,
      paraId: otherId,
      de: `${userData.nombre} ${userData.apellido}`,
      paraNombre,
      // 🔴 usar el campo que renderiza el chat:
      descripcion: descripcionFinal,
      // copiar contexto del intercambio para que caiga en el mismo chat
      productoId: base.productoId,
      productoOfrecidoId: base.productoOfrecidoId,
      productoTitle: base.productoTitle,
      productoOfrecido: base.productoOfrecido,
      donacionId: base.donacionId,
      donacionTitle: base.donacionTitle,
      fecha: new Date().toISOString(),
      esTemporal: true
    };
  
    setMensajes(prev => [...prev, mensajeOptimista]);
    setNuevoTexto('');
    setImagenAdjunta(null);
  
    try {
      let imagenBase64 = null;
      if (imagenAdjunta instanceof File) {
        imagenBase64 = await fileToDataUrl(imagenAdjunta); // o tu lector actual
      }
  
      const payload = {
        deId: userData.id,
        paraId: otherId,
        de: `${userData.nombre} ${userData.apellido}`,
        paraNombre,
        // 🔴 enviar como descripcion (si tu backend espera "texto", mandá ambos):
        descripcion: descripcionFinal,
        texto: descripcionFinal,
        imagenNombre: imagenBase64,
        // contexto del intercambio:
        productoId: base.productoId,
        productoOfrecidoId: base.productoOfrecidoId,
        productoTitle: base.productoTitle,
        productoOfrecido: base.productoOfrecido,
        donacionId: base.donacionId,
        donacionTitle: base.donacionTitle,
        leido: false
      };
  
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!res.ok) {
        let serverMsg = '';
        try {
          serverMsg = await res.text();
        } catch (_) {}
        throw new Error(serverMsg || `Error al enviar (HTTP ${res.status})`);
      }
  
      const saved = await res.json();
      // normalizá el mensaje que vuelve del backend
      const normalizado = {
        ...saved,
        descripcion: saved.descripcion ?? saved.texto ?? '',
        fecha: saved.createdAt ?? saved.fecha ?? new Date().toISOString()
      };
  
      setMensajes(prev => prev.map(m => (m._id === tempId ? normalizado : m)));
    } catch (err) {
      // revertir optimista
      setMensajes(prev => prev.filter(m => m._id !== tempId));
      alert(`Error al enviar el mensaje. ${err?.message || ''}`.trim());
    }
  }
  
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
    // 1) Eliminar en backend en paralelo (no bloquear UI)
    try {
      const ids = mensajesChat.map(m => m._id || m.id).filter(Boolean);
      await Promise.all(
        ids.map(id => fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' }))
      );
    } catch (e) {
      console.warn('Error eliminando mensajes en backend (se continuará con UI):', e);
    }

    // 2) Quitar mensajes del estado local inmediatamente
    setMensajes(prev => prev.filter(m => !mensajesChat.some(x => (x._id || x.id) === (m._id || m.id))));

    // 3) Quitar el chat del estado local
    setChats(prev => {
      const nuevo = { ...prev };
      delete nuevo[chatKey];
      return nuevo;
    });

    // 4) Actualizar contadores de no leídos
    setUnreadByChat(prev => {
      const nuevo = { ...prev };
      delete nuevo[chatKey];
      return nuevo;
    });

    // 5) Si el chat eliminado era el seleccionado, seleccionar otro disponible
    const remainingKeys = Object.keys(chats).filter(key => key !== chatKey);
    setChatSeleccionado(remainingKeys.length > 0 ? remainingKeys[0] : null);
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
      const normalized = {
        ...updatedUser,
        provincia: updatedUser.provincia || updatedUser.zona || 'Tucumán',
      };
      
      // Actualizar el estado del usuario con los nuevos datos
      console.log('🔄 Actualizando userData con:', normalized);
      setUserData(normalized);
      
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
            provincia: (dataUser.zona || dataUser.provincia || usuario.zona || usuario.provincia || 'Tucumán'),
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

  // NUEVA FUNCIÓN: Limpiar productos huérfanos del home
  const limpiarProductosHuerfanos = async () => {
    if (!window.confirm('¿Estás seguro de que quieres limpiar productos huérfanos del home? Esto eliminará productos que no aparecen en "Mis Artículos" pero siguen en el home.')) {
      return;
    }

    try {
      console.log('🧹 Iniciando limpieza de productos huérfanos...');
      
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      if (!usuarioActual || !usuarioActual.id) {
        console.error('❌ No se encontró usuario actual');
        return;
      }

      // Obtener datos frescos del usuario
      const resUser = await fetch(`${API_URL}/users/${usuarioActual.id}`);
      if (!resUser.ok) {
        throw new Error('Error al obtener datos del usuario');
      }
      
      const userData = await resUser.json();
      const productosActuales = userData.productos || [];
      const transaccionesActuales = userData.transacciones || [];
      
      console.log('📊 Productos actuales en BD:', productosActuales.length);
      console.log('📊 Transacciones actuales:', transaccionesActuales.length);
      
      // Identificar productos que fueron intercambiados (aparecen en transacciones completadas)
      const productosIntercambiados = transaccionesActuales
        .filter(t => t.estado === 'completado')
        .map(t => t.productoOfrecido)
        .filter(Boolean);
      
      console.log('🔄 Productos intercambiados encontrados:', productosIntercambiados);
      
      // Filtrar productos que NO fueron intercambiados (productos huérfanos)
      const productosLimpios = productosActuales.filter(producto => {
        const esHuerfano = productosIntercambiados.includes(producto.titulo);
        if (esHuerfano) {
          console.log(`🗑️ Producto huérfano identificado: "${producto.titulo}"`);
        }
        return !esHuerfano;
      });
      
      const productosEliminados = productosActuales.length - productosLimpios.length;
      
      if (productosEliminados > 0) {
        // Actualizar la lista de productos sin los huérfanos
        const updateResponse = await fetch(`${API_URL}/users/${usuarioActual.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productos: productosLimpios }),
        });
        
        if (updateResponse.ok) {
          console.log(`✅ ${productosEliminados} productos huérfanos eliminados del home`);
          
          // Actualizar datos locales
          setUserData(prev => ({ ...prev, productos: productosLimpios }));
          localStorage.setItem('usuarioActual', JSON.stringify({ ...userData, productos: productosLimpios }));
          
          // Forzar actualización del home
          window.dispatchEvent(new CustomEvent('productsUpdated'));
          
          alert(`✅ Limpieza completada: ${productosEliminados} productos huérfanos eliminados del home.`);
        } else {
          throw new Error('Error al actualizar productos en el servidor');
        }
      } else {
        console.log('✨ No se encontraron productos huérfanos para eliminar');
        alert('✨ No se encontraron productos huérfanos. El home está limpio.');
      }
      
    } catch (error) {
      console.error('❌ Error en limpieza de productos huérfanos:', error);
      alert('❌ Error al limpiar productos huérfanos. Revisa la consola para más detalles.');
    }
  };

  // Hacer las funciones accesibles globalmente para la consola
  useEffect(() => {
    window.limpiarProductosHuerfanos = limpiarProductosHuerfanos;
    
    return () => {
      delete window.limpiarProductosHuerfanos;
    };
  }, []);

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
  const mensajesSectionRef = React.useRef(null);
  const articulosSectionRef = React.useRef(null);
  const transaccionesSectionRef = React.useRef(null);
  const favoritosSectionRef = React.useRef(null);
  const donacionesSectionRef = React.useRef(null);

  
  // Detectar si el usuario está al final del chat
  const isUserAtBottom = React.useCallback(() => {
    if (!chatContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // 50px de tolerancia
  }, []);
  
  const scrollToBottom = React.useCallback((force = false) => {
    // Deshabilitar scroll automático al enviar mensajes
    if (!force) return;
    
    const container = chatContainerRef.current;
    if (!container) return;
    
    // Solo hacer scroll suave cuando se fuerza explícitamente
    const behavior = force ? 'smooth' : 'auto';
    
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior });
      setUserSentMessage(false);
    });
  }, [userSentMessage, isUserAtBottom]);

  // Evitar forzar scroll al fondo al entrar a mensajes: solo alineamos la sección
  useEffect(() => {
    if (activeTab === 'mensajes') {
      // reset flag de envío manual
      setUserSentMessage(false);
    }
  }, [activeTab]);

  // Scroll de ventana: alinear el contenedor de la sección activa con el viewport
  useEffect(() => {
    const sectionRefMap = {
      mensajes: mensajesSectionRef,
      articulos: articulosSectionRef,
      transacciones: transaccionesSectionRef,
      favoritos: favoritosSectionRef,
    };
    const offsetMap = {
      mensajes: 90,
      articulos: 120,
      transacciones: 120,
      favoritos: 120,
    };
    const refObj = sectionRefMap[activeTab];
    const el = refObj?.current;
    if (!el) return;
    const offset = offsetMap[activeTab] ?? 120;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    const behavior = activeTab === 'mensajes' ? 'auto' : 'smooth';
    const t = setTimeout(() => {
      window.scrollTo({ top: y, behavior });
    }, 0);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Reforzar scroll cuando los chats se cargan o cambia el chat seleccionado
  useEffect(() => {
    if (activeTab === 'mensajes') {
      const t = setTimeout(() => {
        // Solo hacer scroll automático si el usuario está al final del chat
        if (userSentMessage && autoScroll) {
          scrollToBottom(false);
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [chats, chatSeleccionado, activeTab, userSentMessage, scrollToBottom, autoScroll]);

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
    if (!autoScroll) return;
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
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
    // Si se cambia a la pestaña de donaciones, cargar donaciones
    if (tab === 'donaciones') {
      loadDonaciones();
    }

  };

  // Función para cargar donaciones del usuario
  const loadDonaciones = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) return;
    
    setLoadingDonaciones(true);
    try {
      console.log('📦 Cargando donaciones del usuario:', usuario.id);
      const response = await fetch(`${API_URL}/donations?donor=${usuario._id || usuario.id}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      
      const donacionesData = await response.json();
      console.log('✅ Donaciones cargadas:', donacionesData);
      setDonaciones(donacionesData);
    } catch (error) {
      console.error('❌ Error al cargar donaciones:', error);
      setDonaciones([]);
    } finally {
      setLoadingDonaciones(false);
    }
  };

  // Cargar donaciones al montar para tener el conteo disponible en header
  useEffect(() => {
    loadDonaciones();
  }, []);

  // Marcar donación como entregada y refrescar datos/eventos globales
  const handleMarkDonationDelivered = async (donacion) => {
    if (!donacion?._id && !donacion?.id) return;
    const donationId = donacion._id || donacion.id;
    if (!window.confirm(`¿Confirmás que la donación "${donacion.title || donacion.itemName}" fue entregada?`)) return;
    try {
      // Backend: cambiar estado a delivered
      const res = await fetch(`${API_URL}/donations/${donationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error HTTP ${res.status}`);
      }
      const updated = await res.json();
      // Actualizar estado local de lista
      setDonaciones(prev => prev.map(d => ( (d._id || d.id) === donationId ? { ...d, status: updated.status } : d )));
      // Si el chat seleccionado está vinculado a esta donación, refrescar detalle
      if (chatDonation && (chatDonation._id === donationId || chatDonation.id === donationId)) {
        try {
          const ref = await fetch(`${API_URL}/donations/${donationId}`);
          if (ref.ok) setChatDonation(await ref.json());
        } catch {}
      }
      // Refrescar datos del usuario (transacciones y contadores) después de marcar como entregada
      try {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
        const uid = usuarioActual?.id || userData?.id;
        if (uid) {
          const userRes = await fetch(`${API_URL}/users/${uid}`);
          if (userRes.ok) {
            const freshUser = await userRes.json();
            setUserData(prev => ({
              ...prev,
              ...freshUser,
              imagen: prev?.imagen || freshUser?.imagen,
            }));
            localStorage.setItem('usuarioActual', JSON.stringify({
              ...(JSON.parse(localStorage.getItem('usuarioActual')) || {}),
              ...freshUser,
              imagen: (JSON.parse(localStorage.getItem('usuarioActual')) || {}).imagen || freshUser?.imagen,
            }));
          }
        }
      } catch (e) {
        console.warn('No se pudo refrescar el usuario tras entregar donación:', e);
      }
      // Forzar recarga de donaciones para mantener contador y listado al día
      loadDonaciones();
      // Emitir evento global para que otras vistas se actualicen
      window.dispatchEvent(new CustomEvent('donationsUpdated', { detail: { id: donationId, status: 'delivered' } }));
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { reason: 'donation-delivered', donationId } }));
      // Feedback visual
      alert('✅ Donación marcada como entregada');
    } catch (e) {
      console.error('❌ Error al marcar donación como entregada:', e);
      alert(e.message || 'No se pudo actualizar la donación');
    }
  };

  // Escuchar evento global para refrescar donaciones (también el contador en header)
  useEffect(() => {
    const onDonationsUpdated = () => {
      loadDonaciones();
    };
    window.addEventListener('donationsUpdated', onDonationsUpdated);
    return () => window.removeEventListener('donationsUpdated', onDonationsUpdated);
  }, []);

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
      
      {/* Contenedor del botón de regresar */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem',
        marginBottom: '1rem'
      }}>
        <BackButton 
          className="icon-back-btn" 
          to="/" 
          aria-label="Volver al inicio"
          style={{
            position: 'relative',
            left: '0',
            top: '0',
            transform: 'none',
            margin: '1rem 0 0 0'
          }}
        />
      </div>

      {/* Cabecera Premium (Minimalist Lateral) */}
      <div className="perfil-header-premium minimalist">
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
                <span className="stat-label-premium">Intercambios</span>
              </div>

              <div className="stat-card-premium">
                <div className="stat-number-premium">{Array.isArray(donaciones) ? donaciones.filter(d => (d.status || '').toLowerCase() === 'delivered').length : 0}</div>
                <span className="stat-label-premium">Donaciones</span>
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
                <span className="detalle-value-premium">{(userData.zona ||  'Tucumán')}</span>
              </div>
              
              {userData.mostrarContacto ? (
                <>
                  <div className="detalle-item-premium">
                    <svg className="detalle-icon-premium" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v14a2 2 0 0 1-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
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
          <button className={`tab-btn-premium ${activeTab === 'donaciones' ? 'active' : ''}`} onClick={() => handleTabChange('donaciones')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.6 9C20.6 6.23858 18.3614 4 15.6 4C14.6565 4 13.8 4.35171 13.1435 4.95919C12.7952 4.36167 12.1565 4 11.4 4C10.6435 4 10.0048 4.36167 9.65647 4.95919C9 4.35171 8.14353 4 7.2 4C4.43858 4 2.2 6.23858 2.2 9C2.2 15 8.6 20 12 22C15.4 20 21.8 15 21.8 9H20.6Z"></path>
            </svg>
            Mis Donaciones
          </button>

        </div>

        <div className="perfil-tab-content">
          {activeTab === 'favoritos' && (
            <div className="mis-favoritos" ref={favoritosSectionRef}>
              <h2>Favoritos</h2>
              <div className="product-list">
                {Array.isArray(favoritos) && favoritos.length > 0 ? (
                  favoritos.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      id={producto.id}
                      title={producto.title}
                      description={producto.description}
                      categoria={producto.categoria}
                      image={producto.image}
                      images={producto.images}
                      fechaPublicacion={producto.fechaPublicacion || producto.createdAt}
                      provincia={producto.provincia || producto.ubicacion}
                      ownerName={producto.ownerName}
                      ownerId={producto.ownerId}
                      condicion={producto.condicion}
                      valorEstimado={producto.valorEstimado}
                      disponible={producto.disponible}
                      onConsultar={() => navigate(`/producto/${producto.id}`)}
                      hideFavoriteButton
                      showRemoveFavorite
                      onRemoveFavorite={handleRemoveFromFavorites}
                    />
                  ))
                ) : (
                  <p>No tienes productos favoritos aún.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'donaciones' && (
            <div className="mis-articulos" ref={donacionesSectionRef}>
              <h2>Mis Donaciones</h2>
              <button className="btn-publicar" onClick={() => navigate("/donaciones/publicar")}>
                + Nueva Donación
              </button>
              {loadingDonaciones ? (
                <div className="loading-spinner">Cargando donaciones...</div>
              ) : (() => {
                const visibles = (Array.isArray(donaciones) ? donaciones : []).filter(d => (d.status || '').toLowerCase() !== 'delivered');
                if (visibles.length === 0) {
                  return <p>No tienes donaciones activas.</p>;
                }
                return (
                  <div className="articulos-grid">
                    {visibles.map((donacion) => {
                      const id = donacion._id || donacion.id;
                      const donor = donacion.donor || {};
                      const donorName = `${userData.nombre || donor.nombre || ''} ${userData.apellido || donor.apellido || ''}`.trim() || donor.name || 'Yo';
                      const ownerId = userData.id || donor._id || donor.id || null;
                      const location = (userData.zona || userData.provincia || donor.ubicacion || donor.provincia || donor.location || donacion.location || 'Tucumán');
                      
                      return (
                        <div key={id} className="col-12 col-md-6 col-lg-4 mb-4">
                          <DonationCard
                            title={donacion.title || donacion.itemName}
                            description={donacion.description}
                            category={donacion.category || donacion.categoria}
                            location={location}
                            condition={donacion.condition}
                            images={donacion.images}
                            status={donacion.status}
                            createdAt={donacion.createdAt}
                            donorName={donorName}
                            ownerId={ownerId}
                            viewMode={'grid'}
                            donationId={id}
                            onAssign={() => navigate(`/donaciones/${id}`)}
                            onEdit={() => navigate(`/donation-edit/${id}`)}
                            onMarkDelivered={() => handleMarkDonationDelivered(donacion)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}



          {activeTab === 'articulos' && (
            <div className="mis-articulos" ref={articulosSectionRef}>
              <h2>Mis Artículos</h2>
              <button className="btn-publicar" onClick={() => navigate("/publicarproducto")} style={{ marginBottom: '1rem' }}>
                + Publicar Nuevo Producto
              </button>
              {userListings.length === 0 ? (
                <p>No has publicado ningún artículo aún.</p>
              ) : (
                <div className="articulos-grid">
                  {userListings.map((producto) => {
                    const normalized = {
                      // id estable
                      id: producto.id || producto._id,
                      _id: producto._id || producto.id,
                      // campos principales
                      title: producto.title || producto.titulo || producto.nombre || 'Sin título',
                      description: producto.description || producto.descripcion || producto.detalle || 'Sin descripción',
                      categoria: producto.categoria || producto.category || 'General',
                      // owner info para mostrar en la card
                      ownerName: `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || userData.username || 'Usuario',
                      ownerId: userData.id || userData._id,
                      // imágenes: asegurar array coherente
                      images: Array.isArray(producto.images)
                        ? producto.images
                        : (producto.image ? [producto.image] : []),
                      image: producto.image || (Array.isArray(producto.images) && producto.images.length > 0 ? producto.images[0] : ''),
                      // secundarios
                      fechaPublicacion: producto.fechaPublicacion || producto.createdAt || producto.fecha || null,
                      // Usar SIEMPRE la ubicación actual del perfil para las cards del propio usuario
                      provincia: (userData.zona || userData.provincia || producto.provincia || producto.zona || 'Tucumán'),
                      zona: (userData.zona || userData.provincia || producto.zona || producto.provincia || 'Tucumán'),
                      // estado derivado
                      estado: producto.intercambiado ? 'intercambiado' : 'activo',
                      // mantener resto por compatibilidad
                      ...producto,
                    };
                    return (
                      <ArticuloCard
                        key={normalized.id || normalized._id}
                        producto={normalized}
                        onEdit={handleEditarProducto}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transacciones' && (
            <div className="mis-transacciones" ref={transaccionesSectionRef}>
              <h2>Mis Intercambios</h2>
              {(() => {
                const deliveredDonations = (Array.isArray(donaciones) ? donaciones : [])
                  .filter(d => (d.status || '').toLowerCase() === 'delivered')
                  .map(d => ({
                    __kind: 'donation',
                    fecha: d.deliveryDate || d.updatedAt || d.createdAt || new Date().toISOString(),
                    title: d.title || d.itemName || 'Donación',
                    raw: d
                  }));

                const exchanges = (Array.isArray(userData.transacciones) ? userData.transacciones : [])
                  .map(t => {
                    const tipo = (t.tipo || t.type || '').toString().toLowerCase();
                    if (tipo === 'donacion' || tipo === 'donación') {
                      // Representar transacciones de donación como donaciones en la UI
                      return {
                        __kind: 'donation',
                        fecha: t.deliveryDate || t.fecha || t.updatedAt || t.createdAt || new Date().toISOString(),
                        title: t.productoOfrecido || t.titulo || t.title || 'Donación',
                        raw: t
                      };
                    }
                    // Caso por defecto: intercambio
                    return { __kind: 'exchange', ...t };
                  });

                const combined = [...exchanges, ...deliveredDonations]
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                if (combined.length === 0) {
                  return <p>No tienes intercambios aún.</p>;
                }

                return (
                  <div className="transacciones-grid">
                    {combined.map((item, idx) => {
                      if (item.__kind === 'donation') {
                        return (
                          <TransactionCard
                            key={`don-${idx}`}
                            transaccion={{
                              // Para la UI, usamos el título como "productoOfrecido"
                              productoOfrecido: item.title,
                              estado: 'completado',
                              fecha: item.fecha
                            }}
                            currentUserId={userData.id}
                            isDonation={true}
                            deliveryDate={item.fecha}
                            onDelete={() => {
                              const raw = item.raw || {};
                              // Resolver ID de donación de forma robusta
                              let did = raw._id || raw.id || raw.donationId || raw.productoOfrecidoId;
                              if (!did && (raw.title || item.title)) {
                                // Fallback: buscar en donaciones por título
                                const match = (donaciones || []).find(d => (d.title || d.itemName) === (raw.title || item.title));
                                if (match) did = match._id || match.id;
                              }
                              setDonationToDelete({ id: did, title: raw.title || raw.itemName || item.title || 'Donación' });
                              setShowConfirmDeleteDonation(true);
                            }}
                          />
                        );
                      } else {
                        return (
                          <TransactionCard
                            key={`ex-${idx}`}
                            transaccion={item}
                            currentUserId={userData.id}
                            onDelete={() => {
                              setTransToDelete({ ...item, idx });
                              setShowConfirmDeleteTrans(true);
                            }}
                            onRate={(ratingData) => {
                              setRatingTarget(ratingData);
                              setShowRatingModal(true);
                            }}
                            onRepublish={handleRepublish}
                          />
                        );
                      }
                    })}
                  </div>
                );
              })()}
              {/* Modal de confirmación para eliminar transacción */}
              <ConfirmModal
                isOpen={showConfirmDeleteTrans}
                onCancel={() => { setShowConfirmDeleteTrans(false); setTransToDelete(null); }}
                onConfirm={async () => {
                   if (!transToDelete) return;
                   try {
                     // Obtener usuario actual al inicio
                     const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                     
                     // Siempre usar _id de MongoDB para la eliminación
                     let backendEliminado = false;
                     const transId = transToDelete._id;
                     if (transId) {
                       const res = await fetch(`${API_URL}/transactions/${transId}`, { method: 'DELETE' });
                       if (res.ok) backendEliminado = true;
                     }
                     
                     // NUEVA FUNCIONALIDAD: Eliminar también el producto asociado del home
                     // Buscar y eliminar el producto que fue intercambiado
                     const productoAEliminar = transToDelete.productoOfrecido;
                     console.log('🔍 DEBUG: Producto a eliminar:', productoAEliminar);
                     console.log('🔍 DEBUG: Datos del intercambio:', transToDelete);
                     
                     if (productoAEliminar && usuarioActual && usuarioActual.id) {
                       try {
                         // Buscar el producto en la lista de productos del usuario
                         const resUserProducts = await fetch(`${API_URL}/users/${usuarioActual.id}`);
                         if (resUserProducts.ok) {
                           const userData = await resUserProducts.json();
                           const productosActuales = userData.productos || [];
                           console.log('🔍 DEBUG: Productos actuales del usuario:', productosActuales.map(p => p.titulo));
                           
                           // Encontrar el producto por nombre y eliminarlo
                           const productosActualizados = productosActuales.filter(producto => {
                             const coincide = producto.titulo !== productoAEliminar;
                             console.log(`🔍 DEBUG: Comparando "${producto.titulo}" !== "${productoAEliminar}" = ${coincide}`);
                             return coincide;
                           });
                           
                           console.log('🔍 DEBUG: Productos después del filtro:', productosActualizados.map(p => p.titulo));
                           console.log('🔍 DEBUG: Se eliminó algún producto?', productosActualizados.length !== productosActuales.length);
                           
                           // Actualizar la lista de productos del usuario
                           if (productosActualizados.length !== productosActuales.length) {
                             const updateResponse = await fetch(`${API_URL}/users/${usuarioActual.id}`, {
                               method: 'PUT',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ productos: productosActualizados }),
                             });
                             console.log('🔍 DEBUG: Respuesta de actualización:', updateResponse.status, updateResponse.ok);
                             
                             if (updateResponse.ok) {
                               console.log(`✅ Producto "${productoAEliminar}" eliminado del home`);
                               
                               // Forzar actualización del home disparando evento global
                               window.dispatchEvent(new CustomEvent('productsUpdated'));
                               console.log('🔄 Evento de actualización de productos disparado');
                             } else {
                               console.error('❌ Error en la actualización del usuario');
                             }
                           } else {
                             console.log('⚠️ No se encontró el producto para eliminar');
                           }
                         }
                       } catch (error) {
                         console.error('Error al eliminar producto del home:', error);
                       }
                     } else {
                       console.log('⚠️ No se puede eliminar: faltan datos', { productoAEliminar, usuarioId: usuarioActual?.id });
                     }
                     
                     // Si no hubo _id o la eliminación directa falló, marcar la transacción como deleted en el usuario
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
              {/* Modal de confirmación para eliminar donación */}
              <ConfirmModal
                isOpen={showConfirmDeleteDonation}
                onCancel={() => { setShowConfirmDeleteDonation(false); setDonationToDelete(null); }}
                onConfirm={async () => {
                  const donationId = donationToDelete?._id || donationToDelete?.id;
                  if (!donationId) {
                    console.error('No se pudo resolver el ID de la donación a eliminar:', donationToDelete);
                    alert('No se pudo eliminar: no se encontró el ID de la donación. Intenta nuevamente desde Mis Donaciones.');
                    return;
                  }
                  try {
                    // Eliminar donación en backend
                    const res = await fetch(`${API_URL}/donations/${donationId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    // Actualizar estado local (remover de donaciones)
                    setDonaciones(prev => prev.filter(d => (d._id || d.id) !== donationId));
                    // Emitir evento global
                    window.dispatchEvent(new CustomEvent('donationsUpdated', { detail: { id: donationId, action: 'deleted' } }));
                    // Recargar donaciones para asegurar estado consistente
                    try { loadDonaciones && loadDonaciones(); } catch {}

                    // Toast éxito
                    const toast = document.createElement('div');
                    toast.textContent = 'Donación eliminada exitosamente';
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
                    setTimeout(() => {
                      if (toast.parentNode) {
                        toast.style.animation = 'slideOutRight 0.3s ease-out';
                        setTimeout(() => { if (toast.parentNode) document.body.removeChild(toast); }, 300);
                      }
                    }, 3000);
                  } catch (err) {
                    console.error('❌ Error al eliminar donación:', err);
                    const errorToast = document.createElement('div');
                    errorToast.textContent = 'Error al eliminar la donación';
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
                    setTimeout(() => { if (errorToast.parentNode) document.body.removeChild(errorToast); }, 3000);
                  } finally {
                    setShowConfirmDeleteDonation(false);
                    setDonationToDelete(null);
                  }
                }}
                title="Eliminar donación"
                message={`¿Estás seguro que deseas eliminar la donación "${donationToDelete?.title || ''}"? Esta acción no se puede deshacer.`}
              />
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="mis-mensajes" ref={mensajesSectionRef}>
              <h2>Mensajes</h2>
              {Object.keys(chats).length === 0 && mensajes.length === 0 ? (
                <p>No tienes mensajes nuevos.</p>
              ) : Object.keys(chats).length === 0 && mensajes.length > 0 ? (
                <p>Cargando mensajes...</p>
              ) : (
                <div className="chat-layout" style={{display:'flex',gap:'1rem'}}>
                  {/* lista de chats */}
                  <div className="chat-list" style={{width:'220px',borderRight:'1px solid #ddd'}}>
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
                      // donde armás textoUltimo:
let textoUltimo = '';
if (ultimoMensaje) {
  const t = ultimoMensaje.descripcion ?? ultimoMensaje.texto ?? '';
  textoUltimo = t ? (t.length > 30 ? t.slice(0,30) + '…' : t)
                  : (ultimoMensaje.imagen ? '[Imagen]' : '(Sin mensaje)');
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
                            setChatToDelete(key);
                            const menuW = 200; // aprox
                            const menuH = 160; // aprox
                            let x = e.clientX;
                            let y = e.clientY;
                            if (x + menuW > window.innerWidth) x = Math.max(8, window.innerWidth - menuW - 8);
                            if (y + menuH > window.innerHeight) y = Math.max(8, window.innerHeight - menuH - 8);
                            setChatListMenu({ visible: true, x, y, key });
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
                          {/* Menú contextual se muestra como portal global fuera del contenedor */}

                          <div className="chat-row">
                            {(() => {
                              let avatarUrl = '';
                              let iniciales = '';
                              
                              if (ultimoMensaje) {
                                if (ultimoMensaje.deId === usuarioActual.id) {
                                  // Mostrar avatar del destinatario (el otro usuario)
                                  avatarUrl = ultimoMensaje.paraImagen ? normalizeImageUrl(ultimoMensaje.paraImagen) : '';
                                  iniciales = (ultimoMensaje.paraNombre || ultimoMensaje.para || 'U').substring(0, 2).toUpperCase();
                                } else {
                                  // Mostrar avatar del remitente (el otro usuario)
                                  avatarUrl = ultimoMensaje.deImagen ? normalizeImageUrl(ultimoMensaje.deImagen) : '';
                                  iniciales = (ultimoMensaje.deNombre || ultimoMensaje.de || 'U').substring(0, 2).toUpperCase();
                                }
                              }
                              
                              // Priorizar siempre la imagen real del backend
                              return avatarUrl ? (
                                <img
                                  className="chat-avatar"
                                  src={avatarUrl}
                                  alt="avatar"
                                  onError={(e) => {
                                    // Si falla la imagen, reemplazar por un fallback de iniciales
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = 'chat-avatar';
                                    fallbackDiv.style.cssText = `
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      background: linear-gradient(135deg, #b0e0ff 0%, #92d1fa 100%);
                                      color: #2d9cdb;
                                      font-size: 14px;
                                      font-weight: bold;
                                      width: ${e.target.width || 40}px;
                                      height: ${e.target.height || 40}px;
                                      border-radius: 50%;
                                    `;
                                    fallbackDiv.textContent = iniciales;
                                    e.target.parentNode.replaceChild(fallbackDiv, e.target);
                                  }}
                                />
                              ) : (
                                <div
                                  className="chat-avatar"
                                  style={{
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

                  {/* Portal global del menú contextual de la lista de chats */}
                  {chatListMenu.visible && ReactDOM.createPortal(
                    (
                      <div
                        ref={chatListMenuRef}
                        style={{
                          position: 'fixed',
                          top: chatListMenu.y,
                          left: chatListMenu.x,
                          zIndex: 10000,
                          background: '#fff',
                          border: '1px solid #eee',
                          borderRadius: 10,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                          padding: 0,
                          minWidth: 180,
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div
                          style={{padding:'13px 22px',cursor:'pointer',color:'#1976d2',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
                          onClick={() => {
                            try {
                              const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                              const mensajesDelChat = chats[chatListMenu.key] || [];
                              const base = mensajesDelChat[0] || null;
                              if (usuarioActual && base) {
                                const otherId = base.deId === usuarioActual.id ? base.paraId : base.deId;
                                if (otherId) window.open(`/perfil/${otherId}`, '_blank');
                              }
                            } catch {}
                            setChatListMenu((p)=>({ ...p, visible:false }));
                          }}
                        >
                          Ver perfil
                        </div>
                        <div style={{height:1,background:'#eee',margin:'0 12px'}}/>
                        <div
                          style={{padding:'13px 22px',cursor:'pointer',color:'#e65100',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
                          onClick={() => {
                            const toast = document.createElement('div');
                            toast.textContent = 'Reporte enviado. Nuestro equipo revisará el chat.';
                            toast.style.cssText = `
                              position: fixed;
                              top: 20px;
                              right: 20px;
                              background: linear-gradient(135deg, #ff8a65 0%, #ff7043 100%);
                              color: white;
                              padding: 10px 16px;
                              border-radius: 8px;
                              box-shadow: 0 4px 12px rgba(255, 112, 67, 0.3);
                              z-index: 10000;
                              font-weight: 700;
                              font-size: 13px;
                            `;
                            document.body.appendChild(toast);
                            setTimeout(() => { if (toast.parentNode) document.body.removeChild(toast); }, 2200);
                            setChatListMenu((p)=>({ ...p, visible:false }));
                          }}
                        >
                          Reportar
                        </div>
                        <div style={{height:1,background:'#eee',margin:'0 12px'}}/>
                        <div
                          style={{padding:'13px 22px',cursor:'pointer',color:'#dc3545',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
                          onClick={() => {
                            setChatToDelete(chatListMenu.key);
                            setShowConfirmChatDelete(true);
                            setChatListMenu((p)=>({ ...p, visible:false }));
                          }}
                        >
                          Eliminar chat
                        </div>
                      </div>
                    ),
                    document.body
                  )}

                  {/* mensajes del chat seleccionado */}
                  <div className="chat-messages" style={{flex:1, overflowY:'auto', maxHeight:'78vh'}} ref={chatContainerRef}>
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
                            src={normalizeImageUrl(userData.imagen) || '/avatar-default.png'}
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
                                  otherUserImage = normalizeImageUrl(mensaje.paraImagen);
                                }
                                if (!otherUserName && mensaje.paraNombre) {
                                  otherUserName = mensaje.paraNombre;
                                }
                              } else {
                                // El otro usuario es el remitente
                                if (mensaje.deImagen) {
                                  otherUserImage = normalizeImageUrl(mensaje.deImagen);
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
                          
                          {/* Acciones del chat: Ver Perfil y, si aplica, Marcar Donación Entregada */}
                          {(() => {
                            const mensajesChat = chats[chatSeleccionado];
                            if (!mensajesChat || mensajesChat.length === 0) return null;
                            const base = mensajesChat[0];
                            const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
                            const otherId = base.deId === usuarioActual.id ? base.paraId : base.deId;

                            // Evaluar si el usuario actual es dueño de la donación del chat
                            let canMarkDelivered = false;
                            let alreadyDelivered = false;
                            if (chatDonation) {
                              const donorId = typeof chatDonation.donor === 'object' ? (chatDonation.donor?._id || chatDonation.donor?.id) : chatDonation.donor;
                              const currentId = usuarioActual?._id || usuarioActual?.id;
                              const status = chatDonation.status || 'available';
                              alreadyDelivered = ['delivered', 'completed', 'removed'].includes(status);
                              canMarkDelivered = !!(chatDonation && donorId && currentId && donorId === currentId && !alreadyDelivered);
                            }

                            return (
                              <div style={{ display: 'flex', gap: 8 }}>
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

                                {base?.donacionId && (chatDonationLoading ? (
                                  <div style={{ fontSize: 12, color: '#666' }}>Cargando donación…</div>
                                ) : canMarkDelivered ? (
                                  <button
                                    onClick={handleMarkDonationDelivered}
                                    style={{ 
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                      color: 'white', 
                                      border: 'none', 
                                      borderRadius: 20, 
                                      padding: '8px 16px', 
                                      fontSize: 14, 
                                      cursor: 'pointer', 
                                      fontWeight: 700,
                                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                      transition: 'all 0.2s'
                                    }}
                                    title="Marcar esta donación como entregada"
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'translateY(-1px)';
                                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'translateY(0)';
                                      e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                    }}
                                  >
                                    Marcar como entregada
                                  </button>
                                ) : (alreadyDelivered ? (
                                  <span style={{
                                    background: '#e7f9f2', color: '#059669', borderRadius: 20,
                                    padding: '6px 12px', fontSize: 13, fontWeight: 700, alignSelf: 'center',
                                    border: '1px solid #b7f0d9'
                                  }}>Entregada</span>
                                ) : null))}
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

                        <div className={darkMode ? 'dark-mode' : ''}>
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
                                    {(() => {
                                      const computedSenderProfileImage = (
                                        mensaje.deId === usuarioActual.id
                                          ? normalizeImageUrl(usuarioActual.imagen)
                                          : (mensaje.deId !== usuarioActual.id && mensaje.deImagen)
                                            ? normalizeImageUrl(mensaje.deImagen)
                                            : (mensaje.paraId !== usuarioActual.id && mensaje.paraImagen)
                                              ? normalizeImageUrl(mensaje.paraImagen)
                                              : ''
                                      );
                                      const computedCurrentUserProfileImage = normalizeImageUrl(usuarioActual.imagen);
                                      console.log('[ChatBubble IMG]', {
                                        msgId: mensaje._id || mensaje.id,
                                        deId: mensaje.deId,
                                        paraId: mensaje.paraId,
                                        deImagen: mensaje.deImagen,
                                        paraImagen: mensaje.paraImagen,
                                        senderProfileImage: computedSenderProfileImage,
                                        currentUserProfileImage: computedCurrentUserProfileImage
                                      });
                                      return (
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
                                      senderProfileImage={computedSenderProfileImage}
                                      currentUserProfileImage={computedCurrentUserProfileImage}
                                      isFirstMessageInChat={idx === 0}
                                    />);
                                    })()}
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
                         <div className={`send-message whatsapp-send-bar ${darkMode ? 'dark-mode' : ''}`} style={{
                           display:'flex',
                           alignItems:'center',
                           gap:'0.8rem',
                           marginTop:'1.5rem',
                           background:'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 50%, rgba(241,245,249,0.95) 100%)',
                           borderRadius:'28px',
                           padding:'1.2rem 1.8rem',
                           boxShadow:'0 8px 32px rgba(102, 126, 234, 0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                           backdropFilter:'blur(15px)',
                           border:'2px solid rgba(102, 126, 234, 0.2)',
                           borderTop:'3px solid rgba(102, 126, 234, 0.4)',
                           position:'relative',
                           overflow:'hidden'
                         }}>
                           {/* Botón de adjuntar imagen al extremo izquierdo, pequeño y redondeado */}
                            <button
                              type="button"
                              className="btn-clip"
                              style={{ 
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)', 
                                border: '2px solid rgba(102, 126, 234, 0.3)', 
                                cursor: 'pointer', 
                                fontSize: 18, 
                                color: '#667eea', 
                                marginRight: 12, 
                                marginLeft: 0, 
                                order: 0, 
                                borderRadius: '50%', 
                                width: 48, 
                                height: 48, 
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent:'center', 
                                boxShadow:'0 4px 16px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'translateZ(0)'
                              }}
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
                              style={{ 
                                flex: 1, 
                                border: '2px solid rgba(102, 126, 234, 0.2)', 
                                resize: 'none', 
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)', 
                                outline: 'none', 
                                fontSize: 16, 
                                minHeight: 48, 
                                maxHeight: 120, 
                                padding: '14px 20px', 
                                color: '#2d3748',
                                borderRadius: '24px',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.1), inset 0 2px 4px rgba(0,0,0,0.05)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontFamily: 'inherit',
                                lineHeight: '1.5'
                              }}
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
                             style={{ 
                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4f46e5 100%)', 
                               color: 'white', 
                               border: '3px solid rgba(255,255,255,0.4)', 
                               borderRadius: '50%', 
                               width: 56, 
                               height: 56, 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center', 
                               fontSize: 22, 
                               marginLeft: 12, 
                               cursor: 'pointer',
                               boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)',
                               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                               transform: 'translateZ(0)',
                               backdropFilter: 'blur(8px)'
                             }}
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
        onCancel={() => { setShowConfirmChatDelete(false); setChatToDelete(null); }}
        onConfirm={async () => {
          
          // Eliminar todos los mensajes de ese chat del backend y la UI
          const mensajesChat = chats[chatToDelete] || [];
          for (const msg of mensajesChat) {
            await fetch(`${API_URL}/messages/${msg._id || msg.id}`, { method: 'DELETE' });
          }
         // Dentro de onConfirm del ConfirmModal de chat:
setMensajes(prev => prev.filter(m => {
  const uid = userData?.id || JSON.parse(localStorage.getItem('usuarioActual'))?.id;
  const otroId = m.deId === uid ? m.paraId : m.deId;
  const key = m.donacionId
    ? [m.donacionId, otroId].sort().join('_donacion_')
    : [m.productoId,  otroId].sort().join('_');
  return key !== chatToDelete;
}));

          setShowConfirmChatDelete(false);
          if (chatSeleccionado === chatToDelete) setChatSeleccionado(null);
          setChatToDelete(null);
        }}
        title="Eliminar chat"
        message="¿Estás seguro que deseas eliminar este chat completo? Esta acción no se puede deshacer."
        confirmText="Eliminar chat"
      />

      {/* ConfirmModal para eliminar mensaje individual */}
      <ConfirmModal
        isOpen={showConfirmMessageDelete}
        onCancel={() => setShowConfirmMessageDelete(false)}
        onConfirm={handleDeleteMessage}
        title="Eliminar mensaje"
        message="¿Estás seguro que deseas eliminar este mensaje? Esta acción no se puede deshacer."
        confirmText="Eliminar mensaje"
      />
    </div>
  );
}

export default PerfilUsuario;