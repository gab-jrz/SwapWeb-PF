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

  const [imagen, setImagen] = useState(null);
  const [imagenBase64, setImagenBase64] = useState(null);  // Para guardar la imagen en Base64

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenBase64(reader.result);  // Guardar la imagen en Base64
      };
      reader.readAsDataURL(file);  // Convertir la imagen a Base64
      setImagen(file);  // Guardar el archivo también para la vista previa
    }
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
      imagenBase64,  // Enviar la imagen como Base64
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
      setFormData({ productoOfrecido: "", descripcion: "", condiciones: "" });
      setImagen(null);
      setImagenBase64(null);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  return (
    <div className="intercambiar-container">
      <Header search={false} />
      <div className="intercambiar-detalles">
        <h2>Estás enviando una propuesta a <span className="resaltado">{ownerNombre} {ownerApellido}</span></h2>
        <p>Producto de interés: <strong>{productoTitle}</strong></p>
        <p>Propuesta enviada por: <strong>{JSON.parse(localStorage.getItem("usuarioActual")).nombre} {JSON.parse(localStorage.getItem("usuarioActual")).apellido}</strong></p>
      </div>

      <form className="intercambiar-formulario" onSubmit={handleSubmit}>
        <h3>Proponer un Intercambio</h3>

        <label>
          Producto ofrecido:
          <input type="text" name="productoOfrecido" value={formData.productoOfrecido} onChange={handleChange} required />
        </label>

        <label>
          Descripción del producto:
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required />
        </label>

        <label>
         Lugar de intercambio:
          <textarea name="condiciones" value={formData.condiciones} onChange={handleChange} required />
        </label>

        <label>
          Imagen del producto ofrecido:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {imagen && (
          <div className="preview-imagen">
            <p>Vista previa:</p>
            <img src={URL.createObjectURL(imagen)} alt="Previsualización" />
          </div>
        )}

        <button type="button" className="btn-menu" onClick={() => navigate(`/producto/${productoId}`)}>← Regresar al producto</button>
        <button type="submit" className="btn-enviar">Enviar propuesta</button>
      </form>

      <Footer />
    </div>
  );
};

export default Intercambiar;
