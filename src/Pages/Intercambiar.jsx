import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Intercambiar.css";
import Footer from "../Component/Footer";
import Header from "../Component/Header";

const API_URL = 'http://localhost:3001/api';

const Intercambiar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productoId, productoTitle, ownerId, ownerNombre, ownerApellido } = location.state || {};

  const [formData, setFormData] = useState({
    productoOfrecido: "",
    descripcion: "",
    condiciones: "",
  });

  const [imagenNombre, setImagenNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de imágenes disponibles en public/images
  const opcionesImagenes = [
    { nombre: "bici-de-montana.jpg", etiqueta: "Bici de Montaña" },
    { nombre: "otra-imagen.jpg", etiqueta: "Otra Imagen" }, // ejemplo para agregar más
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    setImagenNombre(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Evitar múltiples envíos
    }

    try {
      setIsSubmitting(true);
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

      if (!usuarioActual) {
        alert("Debes iniciar sesión para enviar una propuesta");
        navigate("/login");
        return;
      }

      const mensaje = {
        de: `${usuarioActual.nombre} ${usuarioActual.apellido}`,
        deId: usuarioActual.id,
        paraId: ownerId,
        paraNombre: `${ownerNombre} ${ownerApellido}`,
        productoId,
        productoTitle,
        productoOfrecido: formData.productoOfrecido,
        descripcion: formData.descripcion,
        condiciones: formData.condiciones,
        imagenNombre
      };

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mensaje),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la propuesta");
      }

      await response.json();
      alert("¡Propuesta enviada con éxito!");

      // Redirigir al perfil después de enviar
      navigate("/perfil");

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert("Error al enviar la propuesta. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location.state) {
    return (
      <div className="intercambiar-container">
        <Header search={false} />
        <div className="intercambiar-error">
          <h2>Error: No se encontró la información del producto</h2>
          <button className="btn-menu" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="intercambiar-container">
      <Header search={false} />

      <div className="intercambiar-detalles">
        <h2>
          Estás enviando una propuesta a{" "}
          <span className="resaltado">{ownerNombre} {ownerApellido}</span>
        </h2>
        <p>
          Producto de interés: <strong>{productoTitle}</strong>
        </p>
        <p>
          Propuesta enviada por:{" "}
          <strong>
            {JSON.parse(localStorage.getItem("usuarioActual"))?.nombre || ""}{" "}
            {JSON.parse(localStorage.getItem("usuarioActual"))?.apellido || ""}
          </strong>
        </p>
      </div>

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
          Lugar de intercambio:
          <textarea
            name="condiciones"
            value={formData.condiciones}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Imagen del producto ofrecido:
          <select value={imagenNombre} onChange={handleSelectChange} required>
            <option value="" disabled>
              -- Selecciona una imagen --
            </option>
            {opcionesImagenes.map(({ nombre, etiqueta }) => (
              <option key={nombre} value={nombre}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>

        {imagenNombre && (
          <div className="preview-imagen">
            <p>Vista previa:</p>
            <img
              src={`/images/${imagenNombre}`}
              alt="Imagen seleccionada"
              style={{ maxWidth: "200px", maxHeight: "200px" }}
            />
          </div>
        )}

        <div className="botones-intercambio">
          <button
            type="button"
            className="btn-menu"
            onClick={() => navigate(`/producto/${productoId}`)}
          >
            ← Regresar al producto
          </button>

          <button 
            type="submit" 
            className="btn-enviar"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar propuesta"}
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default Intercambiar;
