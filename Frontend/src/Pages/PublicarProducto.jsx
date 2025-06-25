import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import "../styles/PublicarProducto.css";

const API_URL = 'http://localhost:3001/api';

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    // Check file size first (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Máximo tamaño permitido - reduced for larger images
        let MAX_WIDTH = 800;
        let MAX_HEIGHT = 800;
        let quality = 0.7;

        // If image is larger than 2MB, use more aggressive compression
        if (file.size > 2 * 1024 * 1024) {
          MAX_WIDTH = 600;
          MAX_HEIGHT = 600;
          quality = 0.6;
        }

        // If image is larger than 4MB, compress even more
        if (file.size > 4 * 1024 * 1024) {
          MAX_WIDTH = 400;
          MAX_HEIGHT = 400;
          quality = 0.5;
        }

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with dynamic quality
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
  });
};

const Modal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button 
            className="btn-confirmar" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Publicando...' : 'Confirmar'}
          </button>
          <button 
            className="btn-cancelar-modal" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const PublicarProducto = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoria: '',
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('usuarioActual')) || {};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileSelect = async (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
          setFormData(prev => ({ ...prev, image: compressedImage }));
        };
        reader.readAsDataURL(compressedImage);
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        showNotification(error.message || 'Error al procesar la imagen', 'error');
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.categoria) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    if (!formData.image) {
      showNotification('Por favor selecciona una imagen para tu producto', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsLoading(true);
    console.log('Iniciando publicación del producto...');

    try {
      const reader = new FileReader();
      const imageBase64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(formData.image);
      });

      const imageBase64 = await imageBase64Promise;
      console.log('Imagen convertida a Base64');

      const productoData = {
        title: formData.title,
        description: formData.description,
        categoria: formData.categoria,
        image: imageBase64,
        ownerId: user.id,
        date: new Date().toISOString(),
        status: 'available'
      };

      console.log('Enviando datos al servidor:', productoData);

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData)
      });

      console.log('Respuesta del servidor:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const savedProduct = await response.json();
      console.log('Producto guardado exitosamente:', savedProduct);
      
      showNotification('¡Producto publicado exitosamente!', 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        navigate(`/perfil/${user.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error detallado:", err);
      let errorMessage = 'Error al publicar el producto';
      
      if (err.message === 'Failed to fetch') {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor esté funcionando.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="perfil-usuario-container">
      <Header search={false} />

      <button
        className="btn-regresar"
        onClick={() => navigate(`/perfil/${user.id}`)}
      >
        ← Volver
      </button>

      <div className="publicar-producto-container">
        <h2>Publicar Nuevo Producto</h2>
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form className="publicar-producto-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título del Producto</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ej: Celular Samsung Galaxy Flip 6"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Describe tu producto en detalle..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Selecciona una categoría --</option>
              <option value="otros">Otros</option>
              <option value="tecnologia">Tecnología</option>
              <option value="electrodomesticos">Electrodomésticos</option>
              <option value="ropa">Ropa</option>
            </select>
          </div>

          <div className="form-group">
            <label>Imagen del Producto</label>
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <div className="preview-container">
                  <img src={previewImage} alt="Vista previa" className="preview-image" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Arrastra y suelta tu imagen aquí o haz clic para seleccionar</p>
                  <span>Formatos aceptados: JPG, PNG, GIF</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          </div>

          <button type="submit" className="btn-publicar">
            Publicar Producto
          </button>
        </form>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Confirmar Publicación"
        message="¿Estás seguro de que deseas publicar este producto?"
        isLoading={isLoading}
      />

      <Footer />
    </div>
  );
};

export default PublicarProducto;
