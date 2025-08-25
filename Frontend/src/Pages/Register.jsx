import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css"; // Asegúrate de tener el archivo CSS
import { useToast } from "../components/ToastProvider.jsx";
import Logo from "../components/Logo.jsx";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [provincia, setProvincia] = useState('Tucumán');

  const PROVINCIAS = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
    'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ].sort();

  const navigate = useNavigate();
  const toast = useToast();

  const capitalizar = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const nombreCapitalizado = capitalizar(nombre);
      const apellidoCapitalizado = capitalizar(apellido);
      
      const nuevoUsuario = {
        id: Date.now().toString(),
        nombre: nombreCapitalizado,
        apellido: apellidoCapitalizado,
        username: `${nombreCapitalizado.toLowerCase()}${apellidoCapitalizado.toLowerCase()}`,
        email,
        password,
        provincia: provincia,
        telefono: "011-555-46522",
        imagen: "https://via.placeholder.com/150",
      };

      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoUsuario),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      // Guardar token y datos del usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("usuarioActual", JSON.stringify(data.user));
      // Toast de éxito y redirección a Home
      toast.success("Cuenta creada con éxito. ¡Bienvenido/a!");
      navigate("/");
    } catch (error) {
      setError(error.message);
      // Toast de error con detalle
      toast.error(error.message || "Error en el registro");
      console.error("Error en el registro:", error);
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
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear cuenta</h2>
        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <div className="password-label-row">
          <span>Contraseña</span>
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <div className="password-label-row">
          <span>Confirmar contraseña</span>
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword((s) => !s)}
            disabled={loading}
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <select
          value={provincia}
          onChange={e => setProvincia(e.target.value)}
          required
          disabled={loading}
          style={{marginBottom:'1rem'}}
        >
          <option value="">Selecciona una provincia</option>
          {PROVINCIAS.map(p => (
            <option value={p} key={p}>{p}</option>
          ))}
        </select>

        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>

        <p className="redirect-login">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
        </form>
      </div>
    </>
  );
};

export default Register;
