import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import { categorias } from "../categorias";
import Footer from '../Component/Footer';
import "../styles/PublicarProducto.css";
import "../styles/DonationForm.css";
import { initDarkModeDetector } from '../utils/darkModeDetector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DonationCreateNew = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    pickupMethod: '',
    images: []
  });

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaInput, setCaracteristicaInput] = useState("");
  const [caracteristicasError, setCaracteristicasError] = useState("");

  const conditionOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'como_nuevo', label: 'Como nuevo' },
    { value: 'muy_bueno', label: 'Muy bueno' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' }
  ];

  const pickupMethods = [
    { value: 'domicilio', label: 'Retiro en domicilio' },
    { value: 'punto_encuentro', label: 'Punto de encuentro' },
    { value: 'envio', label: 'Envío postal' },
    { value: 'flexible', label: 'Flexible (a coordinar)' }
  ];

  useEffect(() => {
    initDarkModeDetector();
    const userData = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    if (previewImages.length >= 3) {
      showNotification('Máximo 3 imágenes permitidas', 'error');
      return;
    }

    for (let i = 0; i < Math.min(files.length, 3 - previewImages.length); i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        showNotification('Solo se permiten archivos de imagen', 'error');
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages(prev => [...prev, reader.result]);
        setFormData(prev => ({ ...prev, images: [...prev.images, file] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddCaracteristica = () => {
    if (!caracteristicaInput.trim()) return;
    if (caracteristicas.length >= 10) {
      setCaracteristicasError("Máximo 10 características permitidas.");
      return;
    }
    if (caracteristicaInput.length > 50) {
      setCaracteristicasError("Cada característica debe tener máximo 50 caracteres.");
      return;
    }
    setCaracteristicas([...caracteristicas, caracteristicaInput.trim()]);
    setCaracteristicaInput("");
    setCaracteristicasError("");
  };

  const handleRemoveCaracteristica = idx => {
    setCaracteristicas(caracteristicas.filter((_, i) => i !== idx));
    setCaracteristicasError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('pickupMethod', formData.pickupMethod);
      formDataToSend.append('donor', user._id);
      
      if (caracteristicas.length > 0) {
        formDataToSend.append('characteristics', JSON.stringify(caracteristicas));
      }

      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const savedDonation = await response.json();
      
      showNotification('¡Donación publicada exitosamente!', 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/donaciones');
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      showNotification('Error al publicar la donación', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const Modal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Publicando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="perfil-usuario-container">
      <Header search={false} />

      <div className="regresar-container-premium">
        <button className="btn-regresar" onClick={() => navigate('/donaciones')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Regresar
        </button>
      </div>

      <div className="publicar-producto-container">
        <div className="donation-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-heart"></i>
              Crear Nueva Donación
            </h2>
            <p>Comparte algo que ya no necesitas con quienes lo pueden aprovechar</p>
          </div>
          
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              {notification.message}
            </div>
          )}

          <form className="donation-form" onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i>
                Información Básica
              </h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="title" className="form-label">
                    <i className="fas fa-tag"></i>
                    Título de la Donación *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    placeholder="Ej: Ropa de niño talla 4-6 años en excelente estado"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                  <div className="input-helper">
                    {formData.title.length}/100 caracteres
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="category" className="form-label">
                    <i className="fas fa-list"></i>
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group half-width">
                  <label htmlFor="condition" className="form-label">
                    <i className="fas fa-star"></i>
                    Estado del Artículo *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    className="form-select"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Selecciona el estado</option>
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="description" className="form-label">
                    <i className="fas fa-align-left"></i>
                    Descripción Detallada *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    rows="5"
                    placeholder="Describe detalladamente lo que estás donando: estado, características, historia del artículo, motivo de donación, etc."
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={1000}
                    required
                  />
                  <div className="input-helper">
                    {formData.description.length}/1000 caracteres
                  </div>
                </div>
              </div>
            </div>

            {/* Características adicionales */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-list-ul"></i>
                Detalles Adicionales
                <span className="optional-text">(Opcional)</span>
              </h3>
              
              <div className="form-group">
                <label className="form-label">Características Específicas</label>
                <div className="characteristics-container">
                  <div className="characteristics-input-group">
                    <input
                      type="text"
                      className="characteristics-input"
                      placeholder="Ej: Color azul, Talla M, Marca Nike..."
                      value={caracteristicaInput}
                      onChange={e => setCaracteristicaInput(e.target.value)}
                      onKeyDown={e => { 
                        if(e.key==='Enter'){ 
                          e.preventDefault(); 
                          handleAddCaracteristica(); 
                        }
                      }}
                      maxLength={50}
                      disabled={caracteristicas.length >= 10}
                    />
                    <button 
                      type="button" 
                      className="add-characteristic-btn"
                      onClick={handleAddCaracteristica}
                      disabled={!caracteristicaInput.trim() || caracteristicas.length >= 10}
                    >
                      <i className="fas fa-plus"></i>
                      Agregar
                    </button>
                  </div>
                  
                  {caracteristicas.length > 0 && (
                    <div className="characteristics-list">
                      {caracteristicas.map((item, idx) => (
                        <div className="characteristic-tag" key={idx}>
                          <span className="characteristic-text">{item}</span>
                          <button
                            type="button"
                            className="remove-characteristic-btn"
                            onClick={() => handleRemoveCaracteristica(idx)}
                            title="Eliminar característica"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="characteristics-info">
                    <small>
                      <i className="fas fa-info"></i>
                      Máximo 10 características. Ayuda a otros usuarios a conocer mejor tu donación.
                    </small>
                  </div>
                  
                  {caracteristicasError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      {caracteristicasError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de entrega */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-truck"></i>
                Información de Entrega
              </h3>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="pickupMethod" className="form-label">
                    <i className="fas fa-handshake"></i>
                    Método de Entrega *
                  </label>
                  <select
                    id="pickupMethod"
                    name="pickupMethod"
                    className="form-select"
                    value={formData.pickupMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>¿Cómo prefieres entregar?</option>
                    {pickupMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group half-width">
                  <label htmlFor="location" className="form-label">
                    <i className="fas fa-map-marker-alt"></i>
                    Ubicación
                    <span className="optional-text">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    placeholder="Ej: CABA, Palermo"
                    value={formData.location}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            {/* Galería de fotos */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-camera"></i>
                Galería de Fotos
                <span className="optional-text">(Recomendado)</span>
              </h3>
              
              <div className="photo-upload-container">
                <div
                  className={`photo-drop-zone ${isDragging ? 'dragging' : ''} ${previewImages.length > 0 ? 'has-images' : ''}`}
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
                  {previewImages.length === 0 ? (
                    <div className="upload-placeholder">
                      <div className="upload-icon">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <h4>Sube fotos de tu donación</h4>
                      <p>Arrastra y suelta hasta 3 imágenes o haz clic para seleccionar</p>
                      <div className="upload-specs">
                        <span><i className="fas fa-check"></i> JPG, PNG, GIF</span>
                        <span><i className="fas fa-check"></i> Máx. 5MB por imagen</span>
                        <span><i className="fas fa-check"></i> Hasta 3 fotos</span>
                      </div>
                    </div>
                  ) : (
                    <div className="photo-preview-grid">
                      {previewImages.map((src, idx) => (
                        <div className="photo-preview-item" key={idx}>
                          <img src={src} alt={`Foto ${idx + 1}`} className="preview-image" />
                          <div className="photo-overlay">
                            <button
                              type="button"
                              className="remove-photo-btn"
                              onClick={e => {
                                e.stopPropagation();
                                setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                                setFormData(prev => ({ 
                                  ...prev, 
                                  images: prev.images.filter((_, i) => i !== idx) 
                                }));
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            {idx === 0 && (
                              <div className="main-photo-badge">
                                <i className="fas fa-star"></i>
                                Principal
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {previewImages.length < 3 && (
                        <div className="add-more-photos">
                          <i className="fas fa-plus"></i>
                          <span>Agregar más</span>
                        </div>
                      )}
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
                
                <div className="photo-tips">
                  <h4><i className="fas fa-lightbulb"></i> Consejos para mejores fotos:</h4>
                  <ul>
                    <li>Usa buena iluminación natural</li>
                    <li>Muestra diferentes ángulos del artículo</li>
                    <li>Incluye detalles importantes o defectos</li>
                    <li>La primera foto será la imagen principal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate('/donaciones')}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
              
              <button type="submit" className="btn-primary">
                <i className="fas fa-heart"></i>
                Publicar Donación
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Confirmar Publicación"
        message="¿Estás seguro de que deseas publicar esta donación?"
        isLoading={isLoading}
      />

      <Footer />
    </div>
  );
};

export default DonationCreateNew;
