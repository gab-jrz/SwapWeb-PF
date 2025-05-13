import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Asegúrate de tener el archivo CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const usuarioGuardado = usuarios.find((user) => user.email === email);

    if (usuarioGuardado) {
      if (usuarioGuardado.password === password) {
        // Guardar estado de sesión y usuario actual
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioGuardado)); /* Guardando USUARIO DE MANERA CORRECTA*/

        // Depuración
        console.log("✅ Usuario logueado correctamente:", usuarioGuardado);
        console.log("🆔 ID del usuario logueado:", usuarioGuardado?.id);

        navigate(`/perfil/${usuarioGuardado.id}`);

      } else {
        alert("Contraseña incorrecta. Intenta nuevamente.");
      }
    } else {
      alert("Usuario no encontrado. Verifica tus credenciales.");
    }
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
