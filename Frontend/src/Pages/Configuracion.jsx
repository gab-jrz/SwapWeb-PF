import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../styles/Configuracion.css";

const Configuracion = () => {
  const navigate = useNavigate();

  const defaultConfig = {
    mostrarContacto: true,
    recibirNotificaciones: true,
    notificacionesEmail: true,
    zona: "Tucumán",
    idioma: "es",
  };

  const buildConfig = useCallback(() => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuarioActual && usuarioActual.mostrarContacto !== undefined) {
      return {
        ...defaultConfig,
        mostrarContacto: !!usuarioActual.mostrarContacto,
        zona: usuarioActual.zona || defaultConfig.zona,
      };
    }
    const saved = JSON.parse(localStorage.getItem("userConfig"));
    return saved ? { ...defaultConfig, ...saved } : defaultConfig;
  }, []);

  const [config, setConfig] = useState(buildConfig);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuarioActual) {
      navigate("/login");
    }
  }, [navigate]);

  // Cada vez que se monta / vuelve a la vista, refrescamos desde localStorage y BD
  useEffect(() => {
    setConfig(buildConfig());
  }, [buildConfig]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    alert("Contraseña actualizada con éxito");
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuarioActual) {
      alert("No se encontró el usuario actual");
      return;
    }

    // 1. Guardar config visuales/cliente
    localStorage.setItem("userConfig", JSON.stringify(config));

    // 2. Sincronizar preferencia mostrarContacto con backend
    try {
      const response = await fetch(`http://localhost:3001/api/users/${usuarioActual.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mostrarContacto: config.mostrarContacto }),
      });
      if (!response.ok) throw new Error("Error al actualizar preferencias");
      const updated = await response.json();
      localStorage.setItem("usuarioActual", JSON.stringify(updated));
      // Limpiar configuración legacy para evitar inconsistencias
      localStorage.removeItem("userConfig");
      alert("Configuraciones guardadas con éxito");
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la preferencia de privacidad");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      alert("Cuenta eliminada con éxito");
      navigate("/");
    }
  };

  return (
    <>
    <Header search={false} />

      <button className="btn-menu" style={{ margin: 20 }} onClick={() => {
        const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
        navigate(`/perfil/${usuarioActual?.id || 2}`);
      }}>
        ← Volver al Perfil
      </button>
    <div className="configuracion-container">
      

      <div className="config-options">
        <h2>Configuraciones de Cuenta</h2>

        {/* PRIVACIDAD */}
        <div className="config-section">
          <h3 className="config-section-title">Privacidad</h3>
          <div className="config-option">
            <label>
              <input
                type="checkbox"
                name="mostrarContacto"
                checked={config.mostrarContacto}
                onChange={handleChange}
              />
              Mostrar mi información de contacto (Email y Teléfono)
            </label>
          </div>
        </div>

        {/* NOTIFICACIONES */}
        <div className="config-section">
          <h3 className="config-section-title">Notificaciones</h3>
          <div className="config-option">
            <label>
              <input
                type="checkbox"
                name="recibirNotificaciones"
                checked={config.recibirNotificaciones}
                onChange={handleChange}
              />
              Recibir notificaciones sobre intercambios
            </label>
          </div>
          <div className="config-option">
            <label>
              <input
                type="checkbox"
                name="notificacionesEmail"
                checked={config.notificacionesEmail}
                onChange={handleChange}
              />
              Recibir notificaciones por email
            </label>
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div className="config-section">
          <h3 className="config-section-title">Preferencias</h3>
          <div className="config-option">
            <label>
              Zona de cobertura para intercambios:
              <select name="zona" value={config.zona} onChange={handleChange}>
                <option value="Tucumán">Tucumán</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Argentina">Toda Argentina</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
          </div>
          <div className="config-option">
            <label>
              Idioma de la aplicación:
              <select name="idioma" value={config.idioma} onChange={handleChange}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </label>
          </div>
        </div>

        {/* CONTRASEÑA */}
        <div className="config-section config-password-section">
          <h3 className="config-section-title">Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordSave}>
            <div className="config-option">
              <label>
                Contraseña actual:
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="config-password-input"
                  required
                />
              </label>
            </div>
            <div className="config-option">
              <label>
                Nueva contraseña:
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="config-password-input"
                  required
                />
              </label>
            </div>
            <div className="config-option">
              <label>
                Confirmar nueva contraseña:
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="config-password-input"
                  required
                />
              </label>
            </div>
            <button type="submit" className="btn-guardar" style={{ marginTop: 15 }}>
              Actualizar Contraseña
            </button>
          </form>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="config-action-buttons">
          <button className="btn-guardar" onClick={handleSave}>
            Guardar Configuraciones
          </button>
          <button className="btn-eliminar" onClick={handleDeleteAccount}>
            Eliminar mi cuenta
          </button>
        </div>
      </div>
   
     
    </div>
     <>
     <Footer />
    </>
    </>
    
  );
};

export default Configuracion;