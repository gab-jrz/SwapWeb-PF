import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Usamos navigate para redirigir

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se podría agregar la lógica de validación de usuario
    console.log("Iniciado sesión con:", email, password);
    
    // Cambiar el estado de "isLoggedIn" a true
    localStorage.setItem("isLoggedIn", "true");

    // Redirigimos al inicio
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar sesión</button>
        </form>
        <div className="redirect-register">
          <p>¿No tienes cuenta? <Link to="/register">Crear una cuenta aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
