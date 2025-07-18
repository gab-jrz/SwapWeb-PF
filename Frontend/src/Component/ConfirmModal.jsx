import React from 'react';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, children }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        {children && <div className="confirm-modal-details">{children}</div>}
        <div className="confirm-modal-actions">
          <button onClick={onConfirm} className="btn-confirm">Confirmar</button>
          <button onClick={onCancel} className="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


