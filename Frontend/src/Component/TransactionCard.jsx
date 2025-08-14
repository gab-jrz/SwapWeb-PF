import React from 'react';
import '../styles/TransactionCard.css';

const TransactionCard = ({ transaccion, currentUserId, onDelete, onRate, onRepublish }) => {
  // Debug: ver estructura de la transacción
  console.log('🔍 Estructura de transacción:', transaccion);
  console.log('🔍 Campos disponibles:', Object.keys(transaccion));
  console.log('🔍 Valores de campos:', {
    userIdPropietario: transaccion.userIdPropietario,
    userIdSolicitante: transaccion.userIdSolicitante,
    nombrePropietario: transaccion.nombrePropietario,
    nombreSolicitante: transaccion.nombreSolicitante,
    nombreOtro: transaccion.nombreOtro,
    para: transaccion.para,
    de: transaccion.de,
    paraNombre: transaccion.paraNombre,
    deNombre: transaccion.deNombre
  });
  
  // Determinar si el usuario fue quien ofreció o quien recibió
  const esPropietario = transaccion.userIdPropietario === currentUserId;
  const miProducto = esPropietario ? transaccion.productoOfrecido : transaccion.productoSolicitado;
  const productoOtro = esPropietario ? transaccion.productoSolicitado : transaccion.productoOfrecido;
  let nombreOtro = transaccion.otroUserNombre || 'Usuario';
  
  // Si no hay otroUserNombre, intentar obtener el nombre del otroUserId
  if (!nombreOtro || nombreOtro.trim() === '') {
    nombreOtro = 'Usuario';
  }
  const fecha = new Date(transaccion.fecha);
  const fechaStr = `${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  // Determinar si se puede calificar (intercambio completado y no calificado aún)
  const puedeCalificar = transaccion.estado === 'completado' && !transaccion.calificado;
  
  const handleRateClick = () => {
    if (onRate && puedeCalificar) {
      onRate({
        otroId: transaccion.otroUserId,
        otroNombre: nombreOtro,
        transId: transaccion._id
      });
    }
  };
  return (
    <div className="transaction-card"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
        borderRadius: 16,
        border: '1px solid rgba(102, 126, 234, 0.12)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        minHeight: 'auto',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.12)';
      }}
    >
      {/* Borde decorativo superior */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #009688 100%)',
        borderRadius: '16px 16px 0 0'
      }}></div>
      <div className="transaction-icon" style={{
        width: 32,
        height: 32,
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        color: '#009688',
        background: 'rgba(0, 150, 136, 0.1)',
        borderRadius: '50%',
        padding: 10,
        boxShadow: '0 2px 8px rgba(0, 150, 136, 0.2)'
      }} aria-label="intercambio">
        {/* Icono SVG profesional de intercambio circular más grande */}
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 11C3.5 7.96243 5.96243 5.5 9 5.5H11V3.7C11 3.3134 11.4477 3.10536 11.7236 3.38268L15.2236 6.88268C15.4214 7.08046 15.4214 7.41954 15.2236 7.61732L11.7236 11.1173C11.4477 11.3946 11 11.1866 11 10.8V9H9C7.067 9 5.5 10.567 5.5 12.5C5.5 13.0523 5.94772 13.5 6.5 13.5C7.05228 13.5 7.5 13.0523 7.5 12.5" stroke="#009688" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="transaction-info" style={{flex:1,minWidth:0}}>
        {/* Título del intercambio */}
        <div style={{
          fontWeight: 700,
          fontSize: 17,
          color: '#1a237e',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Intercambio Completado</span>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
          }}></div>
        </div>
        
        {/* Información de productos */}
        <div style={{
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 10,
          border: '1px solid rgba(33, 150, 243, 0.15)',
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.08)',
          position: 'relative'
        }}>
          {/* Borde decorativo izquierdo */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            borderRadius: '0 4px 4px 0'
          }}></div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
          }}>
            <div style={{
              width: 6,
              height: 18,
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)'
            }}></div>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1565c0',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>Tu Producto</span>
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: 8,
            lineHeight: 1.4
          }}>
            {miProducto || 'Producto no especificado'}
          </div>
          

          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
          }}>
            <div style={{
              width: 6,
              height: 18,
              background: 'linear-gradient(135deg, #009688 0%, #00695c 100%)',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0, 150, 136, 0.3)'
            }}></div>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#00695c',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>Producto Recibido</span>
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.4
          }}>
            {productoOtro || 'Producto no especificado'}
          </div>
        </div>
        
        {/* Información del usuario mejorada */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          borderRadius: 10,
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {(nombreOtro || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#666',
              marginBottom: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Intercambiado con
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#667eea',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              {nombreOtro || 'Usuario no identificado'}
            </div>
          </div>
        </div>
        
        {/* Fecha y hora mejorada */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '8px 12px',
          background: 'rgba(158, 158, 158, 0.08)',
          borderRadius: 8,
          border: '1px solid rgba(158, 158, 158, 0.15)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
            borderRadius: '50%',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontSize: 13,
            color: '#666',
            fontWeight: 600
          }}>
            {fechaStr}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        {/* Botón de volver a publicar */}
        {onRepublish && (
          <button
            onClick={() => onRepublish(transaccion)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3), 0 4px 15px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              minWidth: '120px',
              height: '38px',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(10px)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4), 0 6px 20px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3), 0 4px 15px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            title="Volver a publicar este producto"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16l-5 5v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver a publicar
          </button>
        )}


        
        {/* Botón de eliminar */}
        <button
          onClick={onDelete}
          style={{
            background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            padding: '10px',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 25px rgba(255, 71, 87, 0.3), 0 4px 15px rgba(255, 71, 87, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            minWidth: '38px',
            width: '38px',
            height: '38px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.02)';
            e.target.style.boxShadow = '0 12px 35px rgba(255, 71, 87, 0.4), 0 6px 20px rgba(255, 71, 87, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 8px 25px rgba(255, 71, 87, 0.3), 0 4px 15px rgba(255, 71, 87, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          title="Eliminar intercambio"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
