import React from 'react';
import '../styles/ChatBubble.css';

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
}) => {
  const [localRating, setLocalRating] = React.useState(null);
  const [showMenu, setShowMenu] = React.useState(false);

  const handleConfirmExchange = async () => {
    try {
      await fetch(`${API_URL}/messages/${mensaje._id}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error confirmando intercambio', err);
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
        flexDirection: 'column',
        alignItems: fromMe ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <span
        className="chat-sender"
        style={{
          fontSize: 12,
          color: '#888',
          marginBottom: 2,
          marginLeft: fromMe ? 0 : 8,
          marginRight: fromMe ? 8 : 0,
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
          setShowMenu(true);
          setTimeout(() => setShowMenu(false), 5000); // autocierra tras 5s
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
              style={{padding:'13px 22px',cursor:'pointer',color:'#009688',fontWeight:600,fontSize:15,outline:'none',border:'none',background:'none',textAlign:'left'}}
              onClick={()=>{confirmExchange();setShowMenu(false);}}
            >
              Confirmar intercambio
            </div>
            <div style={{height:1,background:'#eee',margin:'0 12px'}}/>
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
  );
};

export default ChatBubble;
