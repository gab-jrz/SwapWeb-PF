import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import { categorias } from "../categorias";
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
    images: [], // Ahora es un array de imágenes
  });

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaInput, setCaracteristicaInput] = useState("");
  const [caracteristicasError, setCaracteristicasError] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
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
          setFormData(prev => ({ ...prev, images: [...prev.images, compressedImage] }));
        };
        reader.readAsDataURL(compressedImage);
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        showNotification(error.message || 'Error al procesar la imagen', 'error');
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

  // Características: validación
  const totalCaracteres = caracteristicas.reduce((acc, c) => acc + c.length, 0);

  const handleAddCaracteristica = () => {
    if (!caracteristicaInput.trim()) return;
    if (caracteristicas.length >= 15) {
      setCaracteristicasError("Máximo 15 ítems.");
      return;
    }
    if (totalCaracteres + caracteristicaInput.length > 1000) {
      setCaracteristicasError("Máximo 1000 caracteres en total.");
      return;
    }
    setCaracteristicas([...caracteristicas, caracteristicaInput.trim()]);
    setCaracteristicaInput("");
    setCaracteristicasError("");
  };

  const handleEditCaracteristica = (idx, value) => {
    if (value.length > 1000) return;
    const nuevas = [...caracteristicas];
    nuevas[idx] = value;
    setCaracteristicas(nuevas);
  };

  const handleRemoveCaracteristica = idx => {
    setCaracteristicas(caracteristicas.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.categoria) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    if (formData.images.length === 0) {
      showNotification('Por favor selecciona al menos una imagen para tu producto', 'error');
      return;
    }
    if (caracteristicas.length > 15) {
      setCaracteristicasError("Máximo 15 ítems.");
      return;
    }
    if (totalCaracteres > 1000) {
      setCaracteristicasError("Máximo 1000 caracteres en total.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsLoading(true);
    console.log('Iniciando publicación del producto...');

    try {
      // Convertir todas las imágenes a base64
      const imagesBase64 = await Promise.all(formData.images.map(imgFile => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imgFile);
        });
      }));
      console.log('Imágenes convertidas a Base64');

      const productoData = {
        title: formData.title,
        description: formData.description,
        categoria: formData.categoria,
        images: imagesBase64,
        ownerId: user.id,
        date: new Date().toISOString(),
        status: 'available'
      };
      if (caracteristicas.length > 0) {
        productoData.caracteristicas = caracteristicas;
      }

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

          {/* Características del Producto - Checklist dinámica */}
          <div className="form-group">
            <label>Características del Producto <span style={{fontWeight:400, fontSize:'0.95em', color:'#6366f1'}}>(opcional, máx 15 ítems/1000 caracteres)</span></label>
            <div className="caracteristicas-checklist">
              <div className="caracteristicas-input-row">
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Ej: Batería nueva, Incluye caja, Garantía vigente..."
                  value={caracteristicaInput}
                  onChange={e => setCaracteristicaInput(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); handleAddCaracteristica(); }}}
                  disabled={caracteristicas.length>=15 || totalCaracteres>=1000}
                />
                <button type="button" className="btn-add-caracteristica" onClick={handleAddCaracteristica} disabled={!caracteristicaInput.trim() || caracteristicas.length>=15 || totalCaracteres+caracteristicaInput.length>1000}>
                  +
                </button>
              </div>
              <div className="caracteristicas-list">
                {caracteristicas.map((item, idx) => (
                  <div className="caracteristica-item" key={idx}>
                    <span className="caracteristica-bullet">✔️</span>
                    <input
                      type="text"
                      value={item}
                      maxLength={200}
                      onChange={e => handleEditCaracteristica(idx, e.target.value)}
                      className="caracteristica-edit-input"
                      style={{width:'70%'}}
                    />
                    <button type="button" className="btn-remove-caracteristica" title="Eliminar" onClick={()=>handleRemoveCaracteristica(idx)}>×</button>
                  </div>
                ))}
              </div>
              <div className="caracteristicas-limits">
                <span>{caracteristicas.length}/15 ítems</span> | <span>{totalCaracteres}/1000 caracteres</span>
              </div>
              {caracteristicasError && <div className="caracteristicas-error">{caracteristicasError}</div>}
            </div>
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
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Imágenes del Producto</label>
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImages.length > 0 ? (
                <div className="preview-multi-container">
                  {previewImages.map((img, idx) => (
                    <div className="preview-container" key={idx}>
                      <img src={img} alt={`Vista previa ${idx + 1}`} className="preview-image" />
                      <button
                        type="button"
                        className="remove-image"
                        title="Eliminar imagen"
                        onClick={e => {
                          e.stopPropagation();
                          setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                          setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Arrastra y suelta hasta 3 imágenes aquí o haz clic para seleccionar</p>
                  <span>Formatos aceptados: JPG, PNG, GIF</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={e => handleFileSelect(e.target.files)}
                disabled={previewImages.length >= 3}
              />
            </div>
            <div className="multi-image-warning">Puedes subir hasta 3 imágenes.</div>
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
