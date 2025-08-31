import React from 'react';

const DeliveryConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  donation,
  isProcessing 
}) => {
  if (!isOpen || !donation) return null;

  return (
    <div className="delivery-confirm-modal">
      <div className="delivery-confirm-content">
        <h3>Confirmar entrega</h3>
        <p>
          ¿Confirmás que la donación <strong>"{(donation.title || donation.itemName || '').trim()}"</strong> fue entregada?
        </p>
        <div className="delivery-confirm-buttons">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="delivery-confirm-button cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="delivery-confirm-button confirm"
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Confirmar entrega
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .delivery-confirm-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(3px);
        }
        .delivery-confirm-content {
          background: white;
          border-radius: 12px;
          padding: 25px 30px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          text-align: center;
        }
        h3 {
          color: #2d3748;
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 600;
        }
        p {
          color: #4a5568;
          margin: 0 0 25px 0;
          line-height: 1.5;
          font-size: 16px;
        }
        .delivery-confirm-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
        }
        .delivery-confirm-button {
          border: none;
          border-radius: 8px;
          padding: 10px 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delivery-confirm-button.cancel {
          background: #f1f5f9;
          color: #4a5568;
          min-width: 100px;
        }
        .delivery-confirm-button.cancel:hover {
          background: #e2e8f0;
        }
        .delivery-confirm-button.confirm {
          background: #10b981;
          color: white;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .delivery-confirm-button.confirm:hover {
          background: #059669;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeliveryConfirmationModal;
