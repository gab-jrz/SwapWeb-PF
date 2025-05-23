import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditarProducto.css";
import Header from "../Component/Header";
import Footer from "../Component/Footer";

const API_URL = 'http://localhost:3001/api';

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    id: "",
    title: "",
    description: "",
    categoria: "",
    image: "",
    ownerId: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchProducto = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }
        
        const data = await response.json();
        setProducto(data);
        setPreviewImage(data.image);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        alert("Error al cargar el producto. Por favor, intenta nuevamente.");
        navigate("/perfil");
      }
    };

    fetchProducto();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({
      ...producto,
      [name]: value,
    });

    if (name === "image") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar producto");
      }
      
      const updatedProduct = await response.json();
      alert("Producto actualizado correctamente");
      navigate("/perfil");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto. Por favor, intenta nuevamente.");
    }
  };

  const categorias = [
    "Electrónicos", 
    "Ropa", 
    "Hogar", 
    "Juguetes", 
    "Deportes", 
    "Libros", 
    "Música", 
    "Coleccionables",
    "Herramientas",
    "Otro"
  ];

  if (isLoading) {
    return <div className="loading-container">Cargando información del producto...</div>;
  }

  return (
    <div className="editar-producto-container">
      <Header search={false} />
      
      <div className="editar-producto-content">
        <button 
          className="btn-volver"
          onClick={() => navigate("/perfil")}
        >
          ← Volver al perfil
        </button>

        <div className="editar-producto-card">
          <h2 className="editar-producto-title">Editar Producto</h2>
          
          <div className="producto-preview">
            <div className="producto-imagen-preview">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Vista previa del producto" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              ) : (
                <div className="imagen-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-editar-producto">
            <div className="form-group">
              <label htmlFor="title">Título del Producto</label>
              <input
                type="text"
                id="title"
                name="title"
                value={producto.title}
                onChange={handleChange}
                placeholder="Nombre descriptivo del producto"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={producto.description}
                onChange={handleChange}
                placeholder="Describe tu producto, incluye detalles como estado, antigüedad, etc."
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={producto.categoria}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">URL de la Imagen</label>
              <input
                type="text"
                id="image"
                name="image"
                value={producto.image}
                onChange={handleChange}
                placeholder="URL de la imagen del producto"
                required
              />
              <small className="form-help-text">
                Ingresa la URL completa de la imagen (ej: https://ejemplo.com/imagen.jpg)
              </small>
            </div>

            <div className="form-group" style={{ display: 'none' }}>
              <label htmlFor="ownerId">ID del Dueño</label>
              <input
                type="number"
                id="ownerId"
                name="ownerId"
                value={producto.ownerId}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-guardar">
                Guardar Cambios
              </button>
              <button 
                type="button" 
                className="btn-cancelar"
                onClick={() => navigate("/perfil")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditarProducto;