import React, { useState } from 'react';
import '../styles/RatingModal.css';

const RatingModal = ({ open, onClose, onSubmit, userName }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleStarClick = (star) => {
    setStars(star);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars < 1) {
      setError('Por favor, selecciona una calificación.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ stars, comment });
      setStars(0);
      setComment('');
      onClose();
    } catch (err) {
      setError('Error al enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-modal-backdrop">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Calificar a {userName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="stars-row">
            {[1,2,3,4,5].map(num => (
              <span
                key={num}
                className={`star ${num <= stars ? 'selected' : ''}`}
                onClick={() => handleStarClick(num)}
                role="button"
                aria-label={`Calificar con ${num} estrella${num>1?'s':''}`}
              >★</span>
            ))}
          </div>
          <textarea
            placeholder="Deja un comentario (opcional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
