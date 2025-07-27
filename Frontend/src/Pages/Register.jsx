import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css"; // Asegúrate de tener el archivo CSS

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('Tucumán');

  const PROVINCIAS = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
    'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ].sort();

  const navigate = useNavigate();

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
        zona: provinciaSeleccionada || 'Tucumán',
        telefono: "011-555-46522",
        imagen: "https://via.placeholder.com/150",
        ubicacion: provinciaSeleccionada || 'Tucumán'
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

      navigate("/login");
    } catch (error) {
      setError(error.message);
      console.error("Error en el registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <select
          value={provinciaSeleccionada}
          onChange={e => setProvinciaSeleccionada(e.target.value)}
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
  );
};

export default Register;
