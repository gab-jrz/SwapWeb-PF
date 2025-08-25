import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import NotificationService from "../services/notificationService";
import "../styles/Configuracion.css";

// Toast simple
const Toast = ({ show, message, onClose }) => show ? (
  <div className="toast-success">
    {message}
    <button onClick={onClose}>&times;</button>
  </div>
) : null;

// Modal simple
const Modal = ({ show, title, message, onClose, onConfirm }) => show ? (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn-modal-confirm" onClick={onConfirm}>Aceptar</button>
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  </div>
) : null;

const Configuracion = () => {
  const navigate = useNavigate();

  const defaultConfig = {
    mostrarContacto: true,
    provincia: "Tucumán",
    idioma: "es",
    // Configuraciones de notificaciones reales
    notificaciones: {
      intercambios: {
        propuestas: true,
        cambiosEstado: true
      },
      mensajes: {
        directos: true,
        intercambio: true
      },
      calificaciones: true,
      recordatorios: true
    }
  };

  const buildConfig = useCallback(() => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuarioActual) {
      return {
        ...defaultConfig,
        mostrarContacto: !!usuarioActual.mostrarContacto,
        provincia: usuarioActual.provincia || defaultConfig.provincia,
        // Usar configuraciones de notificaciones del usuario o valores por defecto
        notificaciones: usuarioActual.notificaciones || defaultConfig.notificaciones
      };
    }
    return defaultConfig;
  }, []);

  const [config, setConfig] = useState(buildConfig);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Handler específico para notificaciones anidadas
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    const keys = name.split('.');
    
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current = newConfig;
      
      // Navegar hasta el penúltimo nivel
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Establecer el valor final
      current[keys[keys.length - 1]] = checked;
      
      return newConfig;
    });
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

  // Estados para feedback visual
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setShowModal(true);
    setPendingSave(true);
  };

  const confirmSave = async () => {
    setShowModal(false);
    setPendingSave(false);
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuarioActual) {
      setToastMsg("No se encontró el usuario actual");
      setShowToast(true);
      return;
    }
    
    try {
      // Preparar datos para actualizar en el backend
      const updateData = {
        mostrarContacto: config.mostrarContacto,
        provincia: config.provincia,
        notificaciones: config.notificaciones
      };
      
      // Actualizar configuraciones en el backend
      const response = await fetch(`http://localhost:3001/api/users/${usuarioActual.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) throw new Error("Error al actualizar configuraciones");
      
      const updated = await response.json();
      
      // Actualizar localStorage con los datos actualizados
      localStorage.setItem("usuarioActual", JSON.stringify(updated));
      localStorage.removeItem("userConfig");
      
      setToastMsg("¡Configuraciones guardadas con éxito!");
      setShowToast(true);
      
      // Auto-cerrar toast después de 3 segundos
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error guardando configuraciones:', err);
      setToastMsg("Error al guardar la configuración. Inténtalo nuevamente.");
      setShowToast(true);
      
      // Auto-cerrar toast de error después de 4 segundos
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  };

  const closeToast = () => setShowToast(false);

  const handleDeleteAccount = () => {
    if (window.confirm("¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      alert("Cuenta eliminada con éxito");
      navigate("/");
    }
  };

  return (
    <>
    <Header search={false} />
    
    {/* Botón de regreso premium */}
    <div className="regresar-container-premium">
      <button className="btn-regresar-premium" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Regresar
      </button>
    </div>

    <div className="configuracion-container">
      

      <div className="config-options">
        <h2>Configuraciones de Cuenta</h2>

        {/* PRIVACIDAD */}
        <div className="config-section">
          <h3 className="config-section-title">Privacidad</h3>
          <div className="config-option">
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <input
      type="checkbox"
      name="mostrarContacto"
      checked={config.mostrarContacto}
      onChange={handleChange}
    />
    Mostrar mi información de contacto (Email y Teléfono)
    <span className="tooltip-container">
      <span className="tooltip-icon">&#9432;</span>
      <span className="tooltip-text">
        Si activas esta opción, otros usuarios podrán ver tu email y teléfono en tu perfil público para contactarte directamente. Puedes cambiar esto en cualquier momento.
      </span>
    </span>
  </label>
  <div className="explicacion-privacidad">
    {config.mostrarContacto ? (
      <span className="explicacion-activa">Tu información de contacto será visible en tu perfil público.</span>
    ) : (
      <span className="explicacion-inactiva">Tu información de contacto permanecerá privada y no será visible para otros usuarios.</span>
    )}
  </div>
</div>
        </div>

        {/* NOTIFICACIONES */}
        <div className="config-section">
          <h3 className="config-section-title">Notificaciones</h3>
          <div className="notificaciones-grid">
            
            {/* Notificaciones de Intercambios */}
            <div className="notif-category">
              <h4 className="notif-category-title">
                <span className="notif-icon">🔄</span>
                Intercambios
              </h4>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.intercambios.propuestas"
                    checked={config.notificaciones?.intercambios?.propuestas || true}
                    onChange={handleNotificationChange}
                  />
                  Propuestas de intercambio
                </label>
              </div>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.intercambios.cambiosEstado"
                    checked={config.notificaciones?.intercambios?.cambiosEstado || true}
                    onChange={handleNotificationChange}
                  />
                  Cambios de estado
                </label>
              </div>
            </div>

            {/* Notificaciones de Donaciones */}
            <div className="notif-category">
              <h4 className="notif-category-title">
                <span className="notif-icon">❤️</span>
                Donaciones
              </h4>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.donaciones.solicitudes"
                    checked={config.notificaciones?.donaciones?.solicitudes || true}
                    onChange={handleNotificationChange}
                  />
                  Solicitudes de donación
                </label>
              </div>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.donaciones.cambiosEstado"
                    checked={config.notificaciones?.donaciones?.cambiosEstado || true}
                    onChange={handleNotificationChange}
                  />
                  Cambios de estado
                </label>
              </div>
            </div>

            {/* Notificaciones de Mensajes */}
            <div className="notif-category">
              <h4 className="notif-category-title">
                <span className="notif-icon">💬</span>
                Mensajes
              </h4>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.mensajes.directos"
                    checked={config.notificaciones?.mensajes?.directos || true}
                    onChange={handleNotificationChange}
                  />
                  Mensajes directos
                </label>
              </div>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.mensajes.intercambio"
                    checked={config.notificaciones?.mensajes?.intercambio || true}
                    onChange={handleNotificationChange}
                  />
                  Mensajes de intercambio
                </label>
              </div>
            </div>

            {/* Notificaciones de Calificaciones */}
            <div className="notif-category">
              <h4 className="notif-category-title">
                <span className="notif-icon">⭐</span>
                Calificaciones
              </h4>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.calificaciones"
                    checked={config.notificaciones?.calificaciones || true}
                    onChange={handleNotificationChange}
                  />
                  Calificaciones recibidas
                </label>
              </div>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificaciones.recordatorios"
                    checked={config.notificaciones?.recordatorios || true}
                    onChange={handleNotificationChange}
                  />
                  Recordatorios para calificar
                </label>
              </div>
            </div>

            {/* Notificaciones por Email */}
            <div className="notif-category">
              <h4 className="notif-category-title">
                <span className="notif-icon">📧</span>
                Email
              </h4>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notificacionesEmail"
                    checked={config.notificacionesEmail}
                    onChange={handleChange}
                  />
                  Resumen semanal por email
                </label>
              </div>
              <div className="config-option-small">
                <label>
                  <input
                    type="checkbox"
                    name="notifEmailUrgentes"
                    checked={config.notifEmailUrgentes || true}
                    onChange={handleChange}
                  />
                  Solo notificaciones urgentes
                </label>
              </div>
            </div>

          </div>
          
          {/* Control maestro */}
          <div className="notif-master-control">
            <label className="master-toggle">
              <input
                type="checkbox"
                name="recibirNotificaciones"
                checked={config.recibirNotificaciones}
                onChange={handleChange}
              />
              <strong>Activar todas las notificaciones</strong>
            </label>
            <p className="master-description">
              Desactivar esta opción silenciará todas las notificaciones de la aplicación.
            </p>
          </div>
        </div>

        {/* CONTRASEÑA */}
        <div className="config-section config-password-section">
          <h3 className="config-section-title">Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordSave}>
            <div className="config-option">
              <div className="password-label-row">
                <span>Contraseña actual</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showCurrentPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="config-password-input"
                placeholder="Escribe tu contraseña actual"
                required
              />
            </div>
            <div className="config-option">
              <div className="password-label-row">
                <span>Nueva contraseña</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword((s) => !s)}
                  aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="config-password-input"
                placeholder="Escribe una nueva contraseña"
                required
              />
            </div>
            <div className="config-option">
              <div className="password-label-row">
                <span>Confirmar nueva contraseña</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="config-password-input"
                placeholder="Confirma tu contraseña"
                required
              />
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
     <Toast show={showToast} message={toastMsg} onClose={closeToast} />

      <Modal
        show={showModal}
        title="Confirmar cambios"
        message="¿Estás seguro que deseas guardar los cambios en tu configuración?"
        onClose={() => { setShowModal(false); setPendingSave(false); }}
        onConfirm={confirmSave}
      />

      <Footer />
    </>
    </>
    
  );
};

export default Configuracion;