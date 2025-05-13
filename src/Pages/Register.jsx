import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css"; // Asegúrate de tener el archivo CSS

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const capitalizar = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const usuariosExistentes = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioDuplicado = usuariosExistentes.find(user => user.email === email);

    if (usuarioDuplicado) {
      alert("Este correo electrónico ya está registrado");
      return;
    }

    const idUsuario = Date.now();

    const nuevoUsuario = {
      id: idUsuario,
      nombre: capitalizar(nombre),
      apellido: capitalizar(apellido),
      email,
      password, // ⚠️ En producción deberías hashear la contraseña
      nombre_formateado: nombre.toLowerCase().replace(/\s+/g, "_"),
      telefono: "011-555-46522",
      imagen: "https://via.placeholder.com/150",
      ubicacion: "Argentina Buenos Aires",
      fechaRegistro: new Date().toLocaleDateString(),
      calificacion: 1,
      transacciones: [],
      productos: [],
      mensajes: []
    };

    usuariosExistentes.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuariosExistentes));
    localStorage.setItem("usuarioActual", JSON.stringify(nuevoUsuario));

    navigate("/login"); // o cambiar a "/perfil" si querés redirigir directamente al perfil
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Crear cuenta</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />

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

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-register">
          Registrar
        </button>

        <p className="redirect-login">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
