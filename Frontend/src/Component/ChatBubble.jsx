import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatBubble.css';
import Notification from './Notification';

const API_URL = 'http://localhost:3001/api';

const ChatBubble = ({
  mensaje,
  fromMe,
  currentUserId,
  onRefresh,
  onDeleteMessage,
  confirmExchange,
  productoTitle,
  productoOfrecido,
  isEditing,
  editText,
  onEditTextChange,
  onEditCancel,
  onEditSave,
  socket,
  scrollToBottom,
  senderProfileImage,
  currentUserProfileImage
}) => {
  const [notifications, setNotifications] = useState([]);

  // Render especial para mensajes del sistema
  if (mensaje.system) {
    return (
      <div style={{width:'100%',display:'flex',justifyContent:'center',margin:'10px 0'}}>
        <div style={{background:'#e9ecef',color:'#555',padding:'6px 14px',borderRadius:14,fontSize:13,fontWeight:500,boxShadow:'0 1px 2px #0001'}}>
          {mensaje.descripcion}
        </div>
      </div>
    );
  }
  const bubbleRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // Efecto para manejar el scroll automático cuando se recibe un nuevo mensaje
  useEffect(() => {
    if (bubbleRef.current && scrollToBottom) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensaje, scrollToBottom]);
  
  // Efecto para configurar los listeners de socket
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
      if (newMessage.sender !== currentUserId) {
        showNotification(`Nuevo mensaje de ${newMessage.senderName}`, 'info');
      }
      if (onRefresh) onRefresh();
    };
    
    const handleExchangeConfirmed = (data) => {
      if (data.userId === currentUserId) {
        showNotification('¡Intercambio confirmado!', 'success');
      }
    };
    
    socket.on('newMessage', handleNewMessage);
    socket.on('exchangeConfirmed', handleExchangeConfirmed);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('exchangeConfirmed', handleExchangeConfirmed);
    };
  }, [socket, currentUserId, onRefresh]);
  
  const showNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const [localRating, setLocalRating] = React.useState(null);

  const handleConfirmExchange = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/${mensaje._id}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (socket) {
          socket.emit('confirmExchange', {
            messageId: mensaje._id,
            userId: currentUserId,
            recipientId: fromMe ? mensaje.receiver : mensaje.sender
          });
        }
        showNotification('Intercambio confirmado exitosamente', 'success');
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Error al confirmar el intercambio');
      }
    } catch (err) {
      console.error('Error confirmando intercambio', err);
      showNotification('Error al confirmar el intercambio', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar mensaje?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/messages/${mensaje._id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Mensaje eliminado', 'success');
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Error eliminando');
      }
    } catch (err) {
      console.error('Error eliminando mensaje', err);
      showNotification('No se pudo eliminar', 'error');
    }
  };

  const handleRate = async (value) => {
    setLocalRating(value);
    try {
      const res = await fetch(`http://localhost:3001/api/messages/${mensaje._id}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value, raterId: currentUserId }),
      });
      if (res.ok) {
        mensaje.rating = value;
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error enviando rating', err);
    }
  };

  if (mensaje.system) {
    return (
      <div className="chat-system">
        ⚠️ {mensaje.descripcion}
        {mensaje.rating === undefined && (
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((v) => (
              <span
                key={v}
                onClick={() => handleRate(v)}
                style={{
                  cursor: 'pointer',
                  color: (localRating || mensaje.rating) >= v ? '#ffc107' : '#ccc',
                }}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`chat-bubble-wrapper ${fromMe ? 'me' : 'other'}`}
      style={{
        display: 'flex',
        flexDirection: fromMe ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
      }}
    >
      {/* Foto de perfil del remitente */}
      <div
        style={{
          flexShrink: 0,
          marginTop: 4,
        }}
      >
        <img
          className="chat-profile-image"
src={fromMe ? (currentUserProfileImage || '/images/fotoperfil.jpg') : (senderProfileImage || '/images/fotoperfil.jpg')}
          alt={fromMe ? 'Mi perfil' : mensaje.nombreRemitente}
          onError={(e) => {
            console.log('❌ Error cargando imagen de perfil:', e.target.src);
            e.target.src = '/images/fotoperfil.jpg';
          }}
        />
      </div>
      
      {/* Contenedor del mensaje */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: fromMe ? 'flex-end' : 'flex-start',
          maxWidth: 'calc(100% - 48px)',
          flex: 1,
        }}
      >
        <span
          className="chat-sender"
          style={{
            fontSize: 12,
            color: '#64748b',
            marginBottom: 4,
            fontWeight: 500,
            paddingLeft: fromMe ? 0 : 4,
            paddingRight: fromMe ? 4 : 0,
          }}
        >
          {fromMe ? 'Yo' : mensaje.nombreRemitente}
        </span>
      <div
        className={`chat-bubble ${fromMe ? 'me' : 'other'}`}
        style={{
          background: fromMe ? '#f8fafc' : '#e1e9f0',
          color: '#23272f',
          borderRadius: 18,
          padding: mensaje.imagen ? '8px 10px 6px 10px' : '10px 16px',
          maxWidth: 320,
          minWidth: 60,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          position: 'relative',
          wordBreak: 'break-word',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          cursor: 'context-menu',
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (fromMe && !mensaje.system) {
            setShowMenu(true);
          }
        }}
      >
        {/* Imagen si hay */}
        {mensaje.imagen && (
          <img
            src={mensaje.imagen.startsWith('blob:') ? mensaje.imagen : `${mensaje.imagen}`}
            alt="imagen adjunta"
            style={{
              maxWidth: 220,
              maxHeight: 220,
              borderRadius: 10,
              marginBottom: mensaje.descripcion ? 8 : 0,
              background: '#eee',
              objectFit: 'cover',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            }}
          />
        )}
        {/* Texto */}
        {(mensaje.descripcion && isEditing) ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            padding: '12px 16px',
            width: '100%',
            maxWidth: 320,
            minWidth: 60,
            alignSelf: 'flex-start',
          }}>
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              style={{
                fontSize: 15,
                minHeight: 36,
                maxHeight: 90,
                resize: 'vertical',
                border: '1.5px solid #bbb',
                borderRadius: 8,
                padding: '8px',
                width: '100%',
                background: '#fff',
                color: '#23272f',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onEditSave();
                }
                if (e.key === 'Escape') onEditCancel();
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                style={{
                  background: '#00bcd4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 15
                }}
                onClick={onEditSave}
              >
                Guardar
              </button>
              <button
                style={{
                  background: '#f4f4f4',
                  color: '#23272f',
                  border: '1px solid #bbb',
                  borderRadius: 6,
                  padding: '5px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 15
                }}
                onClick={onEditCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : mensaje.descripcion ? (
          <p
            className="chat-text"
            style={{
              margin: 0,
              fontSize: 15,
              whiteSpace: 'pre-line',
            }}
          >
            {mensaje.descripcion}
          </p>
        ) : null}

        {/* Badge de producto relacionado SOLO TEXTO */}
        {(fromMe && mensaje.productoOfrecido) || (!fromMe && mensaje.productoTitle) ? (
          <div style={{ marginBottom: 6, marginTop: 2 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: fromMe ? '#e0f7fa' : '#ffe0b2',
                color: fromMe ? '#009688' : '#b26a00',
                borderRadius: 7,
                padding: '2px 10px',
                fontWeight: 600,
                fontSize: 13,
                boxShadow: '0 1px 2px #0001',
                border: fromMe ? '1.5px solid #00bcd4' : '1.5px solid #ffb300',
                maxWidth: 210,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {fromMe ? mensaje.productoOfrecido : mensaje.productoTitle}
            </span>
          </div>
        ):null}

        {/* Fecha */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: 4, justifyContent: 'space-between' }}>
          <span className="chat-meta" style={{ fontSize: 12, color: fromMe ? '#008ba3' : '#444', fontWeight: 500, letterSpacing: 0.1, background:'#fff', borderRadius:5, padding:'1px 8px', boxShadow:'0 1px 6px #0001' }}>{new Date(mensaje.fecha).toLocaleString()}</span>
        </div>

        {/* Menú contextual SOLO para mensajes propios: solo TEXTO estilo WhatsApp */}
        {showMenu && fromMe && (
            <div
            style={{
              position:'absolute',top:28,right:0,zIndex:20,minWidth:160,background:'#fff',border:'1px solid #eee',borderRadius:10,boxShadow:'0 2px 8px #0002',overflow:'hidden',display:'flex',flexDirection:'column',padding:'0'
            }}
            tabIndex={0}
            onBlur={()=>setShowMenu(false)}
          >
            <div
              style={{padding:'13px 22px',cursor:'pointer',color:'#1976d2',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
              onClick={()=>{onRefresh && onRefresh('edit', mensaje._id || mensaje.id);setShowMenu(false);}}
            >
              Editar mensaje
            </div>
            <div style={{height:1,background:'#eee',margin:'0 12px'}}/>
            <div
              style={{padding:'13px 22px',cursor:'pointer',color:'#dc3545',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
              onClick={()=>{onDeleteMessage && onDeleteMessage(mensaje); setShowMenu(false);}}
            >
              Eliminar mensaje
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatBubble, (prevProps, nextProps) => {
  // Solo re-renderizar si estos props cambian
  return (
    prevProps.mensaje._id === nextProps.mensaje._id &&
    prevProps.fromMe === nextProps.fromMe &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editText === nextProps.editText &&
    prevProps.senderProfileImage === nextProps.senderProfileImage &&
    prevProps.currentUserProfileImage === nextProps.currentUserProfileImage
  );
});
