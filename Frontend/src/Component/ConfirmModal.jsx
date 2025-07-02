import React from 'react';
import '../styles/DeleteModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
