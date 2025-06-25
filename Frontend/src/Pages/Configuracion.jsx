import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../styles/Configuracion.css";

const Configuracion = () => {
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    mostrarContacto: true,
    recibirNotificaciones: true,
    notificacionesEmail: true,
    zona: "Tucumán",
    idioma: "es",
  });

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

  const handleSave = () => {
    alert("Configuraciones guardadas con éxito");
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

      <button className="btn-menu" style={{ margin: 20 }} onClick={() => navigate("/perfil/2")}>
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