import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Logo from '../components/Logo.jsx';
import { FaHome } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <>
      <header className="register-header">
        <Logo style={{ fontSize: "1.8rem !important" }} />
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Link to="/" className="reset-home-link" aria-label="Inicio">
            <FaHome size={22} />
          </Link>
        </div>
      </header>
      <div className="login-container">
        <div className="login-form">
        <h2>Nueva contraseña</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="password-label-row">
              <span>Nueva contraseña</span>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                disabled={loading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
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

export default ResetPassword;
