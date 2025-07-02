import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`http://localhost:3001/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setMessage('Contraseña actualizada con éxito');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Nueva contraseña</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </form>
        <div className="redirect-register">
          <p><Link to="/login">Volver a iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
