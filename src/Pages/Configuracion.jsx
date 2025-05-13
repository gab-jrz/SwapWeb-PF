import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
const Configuracion = () => {
  const navigate = useNavigate();

  // Estado de las configuraciones (puedes cargar este estado desde una API o localStorage si es necesario)
  const [config, setConfig] = useState({
    mostrarContacto: true,
    zona: "Tucumán",
  });

  // Función para manejar cambios en las configuraciones
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Función para guardar cambios
  const handleSave = () => {
    // Lógica para guardar las configuraciones (puedes hacer una llamada a la API o actualizar localStorage)
    console.log("Cambios guardados:", config);
  };

  // Función para eliminar la cuenta (esto puede llevar a un proceso de eliminación de datos)
  const handleDeleteAccount = () => {
    // Lógica para eliminar la cuenta
    console.log("Cuenta eliminada");
  };

  return (
    <>
      <Header search={false} />
      <div className="configuracion-container">
        <button
          className="btn-menu"
          style={{ margin: 20 }}
          onClick={() => navigate("/perfil/2")}
        >
          ← Retornar
        </button>

        <div className="config-options">
          <h2>Configuraciones de Cuenta</h2>
          <div className="config-option">
            <label>
              <input
                type="checkbox"
                name="mostrarContacto"
                checked={config.mostrarContacto}
                onChange={handleChange}
              />
              Mostrar mi contacto (Email y Teléfono)
            </label>
          </div>

          <div className="config-option">
            <label>
              Zona de cobertura o disponibilidad para intercambios:
              <select
                name="zona"
                value={config.zona}
                onChange={handleChange}
              >
                <option value="Tucumán">Tucumán</option>
                <option value="Argentina">Toda Argentina</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
          </div>

          <div className="config-action-buttons">
            <button className="btn-guardar" onClick={handleSave}>Guardar cambios</button>
            <button className="btn-eliminar" onClick={handleDeleteAccount}>Eliminar cuenta</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Configuracion;
