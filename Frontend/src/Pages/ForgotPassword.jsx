import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';
import Logo from '../components/Logo.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setMessage('Revisa tu correo para continuar');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="register-header">
        <Logo style={{ fontSize: "1.8rem !important" }} />
        <Link to="/" className="register-home-link">← Volver al inicio</Link>
      </header>
      <div className="login-container">
        <div className="login-form">
        <h2>Restablecer contraseña</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>
        <div className="redirect-register">
          <p><Link to="/login">Volver a iniciar sesión</Link></p>
        </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
