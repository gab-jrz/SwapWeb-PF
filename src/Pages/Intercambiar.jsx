import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Intercambiar.css";
import Footer from "../Component/Footer";
import Header from "../Component/Header";

const Intercambiar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productoId, productoTitle, ownerId, ownerNombre, ownerApellido } = location.state || {};

  const [formData, setFormData] = useState({
    productoOfrecido: "",
    descripcion: "",
    condiciones: "",
  });

  const [imagenNombre, setImagenNombre] = useState(""); // Nombre del archivo de la imagen

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

    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

    const mensaje = {
      de: `${usuarioActual.nombre} ${usuarioActual.apellido}`,
      para: `${ownerNombre} ${ownerApellido}`,
      paraId: ownerId,
      productoId,
      productoTitle,
      productoOfrecido: formData.productoOfrecido,
      descripcion: formData.descripcion,
      condiciones: formData.condiciones,
      imagenNombre, // Solo nombre del archivo
      fecha: new Date().toISOString(),
    };

    try {
      await fetch("http://localhost:3000/mensajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mensaje),
      });

      alert("¡Propuesta enviada con éxito!");

      // Resetear campos
      setFormData({ productoOfrecido: "", descripcion: "", condiciones: "" });
      setImagenNombre("");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

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
            {JSON.parse(localStorage.getItem("usuarioActual")).nombre}{" "}
            {JSON.parse(localStorage.getItem("usuarioActual")).apellido}
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

          <button type="submit" className="btn-enviar">
            Enviar propuesta
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default Intercambiar;
