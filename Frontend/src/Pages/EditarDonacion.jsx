import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditarProducto.css";
import Header from "../Component/Header";
import Footer from "../Component/Footer";

const API_URL = 'http://localhost:3001/api';

const EditarDonacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donacion, setDonacion] = useState({
    title: "",
    description: "",
    category: "",
    images: [],
    condition: "",
    location: "",
    pickupMethod: "",
    status: "available"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const categorias = [
    "Electrodomésticos", "Muebles", "Ropa", "Libros", "Deportes",
    "Juguetes", "Tecnología", "Hogar", "Jardinería", "Mascotas", "Otros"
  ];

  const condiciones = ["Nuevo", "Como nuevo", "Usado - Buen estado", "Usado - Estado regular"];
  const metodosRecogida = ["Recogida en domicilio", "Punto de encuentro", "Envío", "A convenir"];

  useEffect(() => {
    const fetchDonacion = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/donations/${id}`);
        if (!response.ok) {
          throw new Error("Donación no encontrada");
        }
        
        const data = await response.json();
        setDonacion({ 
          ...data, 
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [] 
        });
        setPreviewImages(Array.isArray(data.images) ? data.images : data.image ? [data.image] : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar la donación:", error);
        alert("Error al cargar la donación. Por favor, intenta nuevamente.");
        navigate('/perfil');
      }
    };

    fetchDonacion();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonacion({
      ...donacion,
      [name]: value,
    });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length + previewImages.length > 3) {
      showNotification('Solo puedes subir hasta 3 imágenes.', 'error');
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona solo archivos de imagen.', 'error');
        continue;
      }
      try {
        const compressedImage = await compressImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImages(prev => [...prev, reader.result]);
          setDonacion(prev => ({ ...prev, images: [...prev.images, compressedImage] }));
        };
        reader.readAsDataURL(compressedImage);
      } catch (error) {
        showNotification(error.message || 'Error al procesar la imagen', 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = idx => {
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
    setDonacion(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!donacion.title.trim() || !donacion.category) {
      showNotification('Por favor completa todos los campos obligatorios.', 'error');
      return;
    }

    try {
      // Convertir archivos nuevos a base64, mantener URLs existentes
      const imagesBase64OrUrl = await Promise.all(donacion.images.map(img => {
        if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) {
          return img;
        }
        // Si es un File/Blob, convertir a base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(img);
        });
      }));

      const bodyObj = { ...donacion, images: imagesBase64OrUrl };
      
      const response = await fetch(`${API_URL}/donations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar donación");
      }

      showNotification("Donación actualizada correctamente", "success");
      setTimeout(() => navigate('/perfil'), 1500);
    } catch (error) {
      console.error("Error al actualizar la donación:", error);
      showNotification("Error al actualizar la donación. Por favor, intenta nuevamente.", "error");
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Cargando donación...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="editar-producto-container">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <h2>Editar Donación</h2>
        <form onSubmit={handleSubmit} className="editar-producto-form">
          
          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título de la donación *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={donacion.title}
              onChange={handleChange}
              required
              maxLength="100"
              placeholder="Ej: Sofá en buen estado"
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={donacion.description}
              onChange={handleChange}
              maxLength="500"
              placeholder="Describe tu donación con más detalle..."
              rows="4"
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label htmlFor="category">Categoría *</label>
            <select
              id="category"
              name="category"
              value={donacion.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condición */}
          <div className="form-group">
            <label htmlFor="condition">Estado del artículo</label>
            <select
              id="condition"
              name="condition"
              value={donacion.condition}
              onChange={handleChange}
            >
              <option value="">Selecciona el estado</option>
              {condiciones.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Ubicación */}
          <div className="form-group">
            <label htmlFor="location">Ubicación</label>
            <input
              type="text"
              id="location"
              name="location"
              value={donacion.location}
              onChange={handleChange}
              placeholder="Ciudad, barrio o zona"
            />
          </div>

          {/* Método de recogida */}
          <div className="form-group">
            <label htmlFor="pickupMethod">Método de entrega</label>
            <select
              id="pickupMethod"
              name="pickupMethod"
              value={donacion.pickupMethod}
              onChange={handleChange}
            >
              <option value="">Selecciona método de entrega</option>
              {metodosRecogida.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de la donación */}
          <div className="form-group">
            <label htmlFor="status">Estado de la donación</label>
            <select
              id="status"
              name="status"
              value={donacion.status}
              onChange={handleChange}
            >
              <option value="available">Disponible</option>
              <option value="reserved">Reservada</option>
              <option value="delivered">Entregada</option>
              <option value="removed">Retirada</option>
            </select>
          </div>

          {/* Imágenes */}
          <div className="form-group">
            <label>Imágenes (máximo 3)</label>
            <div
              className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Arrastra imágenes aquí o haz clic para seleccionar</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>
            
            {previewImages.length > 0 && (
              <div className="image-preview-grid">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img 
                      src={typeof img === 'string' && img.startsWith('http') ? img : 
                           typeof img === 'string' && img.startsWith('/') ? `${API_URL}${img}` : img} 
                      alt={`Preview ${idx}`} 
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/perfil')} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-actualizar">
              Actualizar Donación
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditarDonacion;
