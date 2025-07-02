import React from 'react';
import '../styles/TransactionCard.css';

const TransactionCard = ({ transaccion, currentUserId, onDelete }) => {
  // Determinar si el usuario fue quien ofreció o quien recibió
  const esPropietario = transaccion.userIdPropietario === currentUserId;
  const miProducto = esPropietario ? transaccion.productoOfrecido : transaccion.productoSolicitado;
  const productoOtro = esPropietario ? transaccion.productoSolicitado : transaccion.productoOfrecido;
  const nombreOtro = esPropietario ? (transaccion.nombreOtro || 'Sin nombre') : (transaccion.nombrePropietario || 'Sin nombre');
  const fecha = new Date(transaccion.fecha);
  const fechaStr = `${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return (
    <div className="transaction-card"
      style={{
        background:'#fff',
        borderRadius:12,
        boxShadow:'0 1px 4px #0001',
        padding:'12px 16px',
        display:'flex',
        alignItems:'center',
        gap:12,
        marginBottom:10,
        minHeight:56
      }}>
      <div className="transaction-icon" style={{width:20,height:20,marginRight:10,display:'flex',alignItems:'center',color:'#009688'}} aria-label="intercambio">
        {/* Icono SVG profesional de intercambio circular */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 11C3.5 7.96243 5.96243 5.5 9 5.5H11V3.7C11 3.3134 11.4477 3.10536 11.7236 3.38268L15.2236 6.88268C15.4214 7.08046 15.4214 7.41954 15.2236 7.61732L11.7236 11.1173C11.4477 11.3946 11 11.1866 11 10.8V9H9C7.067 9 5.5 10.567 5.5 12.5C5.5 13.0523 5.94772 13.5 6.5 13.5C7.05228 13.5 7.5 13.0523 7.5 12.5" stroke="#009688" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="transaction-info" style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:15.5,color:'#23272f',marginBottom:2,whiteSpace:'normal',wordBreak:'break-word'}}>
          {(miProducto || 'Producto desconocido')} fue intercambiado por {(productoOtro || 'Producto desconocido')} con <span style={{color:'#009688'}}>{nombreOtro || 'Sin nombre'}</span>
        </div>
        <div style={{fontSize:13,color:'#888',marginBottom:0}}>{fechaStr}</div>
      </div>
      <button
        onClick={onDelete}
        style={{
          background:'#fff',
          color:'#dc3545',
          border:'1px solid #dc3545',
          borderRadius:6,
          padding:'2px 8px',
          fontWeight:600,
          fontSize:12.5,
          cursor:'pointer',
          marginLeft:5,
          minWidth:0
        }}
        title="Eliminar registro"
      >
        Eliminar
      </button>
    </div>
  );
};

export default TransactionCard;
