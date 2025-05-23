import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import "../styles/PublicarProducto.css";

const PublicarProducto = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoria: '',
    image: '',
  });

  const [imagenNombre, setImagenNombre] = useState(''); // Para el select

  const opcionesImagenes = [
    { nombre: "bici-de-montana.jpg", etiqueta: "Bici de Montaña" },
    { nombre: "otra-imagen.jpg", etiqueta: "Otra Imagen" },
    // agregá más imágenes si querés
  ];

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('usuario'));

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSelectChange = (e) => {
    setImagenNombre(e.target.value);
    // También actualizar el campo image para guardar la ruta seleccionada
    setFormData({...formData, image: `/images/${e.target.value}`});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevoProducto = {
      ...formData,
      ownerId: user?.id || 1,
    };

    fetch('http://localhost:3000/productos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(nuevoProducto)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar producto');
        return res.json();
      })
      .then(() => {
        navigate('/');
      })
      .catch(err => console.error("Error al guardar producto:", err));
  };

  return (
    <div className="perfil-usuario-container">
      <Header search={false} />

      <button
        className="btn-menu"
        style={{ margin: 10 }}
        onClick={() => navigate("/perfil/2")}
      >
        ← Retornar
      </button>

      <div className="publicar-producto-container">
        <h2>Publicar Nuevo Producto</h2>
        <form className="publicar-producto-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Ej: Celular Samsung Galaxy Flip 6"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Descripción del producto..."
            value={formData.description}
            onChange={handleChange}
            required
          />

         <label htmlFor="categoria">Categoría</label>
          <select
          id="categoria"
         name="categoria"
          value={formData.categoria}
            onChange={handleChange}
          required
          >     
        <option value="" disabled>-- Selecciona una categoría --</option>
          <option value="categorías">Otros</option>
        <option value="tecnologia">Tecnología</option>
        <option value="electrodomesticos">Electrodomésticos</option>
          <option value="ropa">Ropa</option>
        </select>

          {/* Select para elegir imagen */}
          <label htmlFor="imageSelect">Selecciona una imagen</label>
          <select
            id="imageSelect"
            value={imagenNombre}
            onChange={handleSelectChange}
            required
          >
            <option value="" disabled>-- Selecciona una imagen --</option>
            {opcionesImagenes.map(({ nombre, etiqueta }) => (
              <option key={nombre} value={nombre}>
                {etiqueta}
              </option>
            ))}
          </select>

          {/* Preview de la imagen seleccionada */}
          {imagenNombre && (
            <div className="preview-imagen" style={{ marginTop: '10px' }}>
              <p>Vista previa:</p>
              <img
                src={`/images/${imagenNombre}`}
                alt="Imagen seleccionada"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}

          <button type="submit" className="btn-publicar">Publicar Producto</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default PublicarProducto;
