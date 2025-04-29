import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Intercambiar.css";
import Footer from "../Component/Footer";

const Intercambiar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productoOfrecido: "",
    descripcion: "",
    condiciones: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Intercambio propuesto:", formData);
    alert("¡Propuesta enviada con éxito!");
    setFormData({ productoOfrecido: "", descripcion: "", condiciones: "" });
  };

  return (
    <div className="intercambiar-container">
      {/* Encabezado simple */}
      <div className="intercambiar-header">
        <h2 className="app-name">
          <span style={{ color: "#00c853" }}>Swap</span>
          <span style={{ color: "#00bcd4" }}>Web</span>
        </h2>
        <button className="btn-menu" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>
      </div>

      {/* Formulario */}
      <form className="intercambiar-formulario" onSubmit={handleSubmit}>
        <h3>Proponer un Intercambio</h3>
        <label>
          Producto ofrecido:
          <input
            type="text"
            name="productoOfrecido"
            value={formData.productoOfrecido}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción del producto:
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Condiciones del intercambio:
          <textarea
            name="condiciones"
            value={formData.condiciones}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn-enviar">
          Enviar propuesta
        </button>
      </form>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Intercambiar;
