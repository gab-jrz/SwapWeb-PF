import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Component/Header';
import { categorias } from "../categorias";
import Footer from '../Component/Footer';
import "../styles/PublicarProducto.css";
import "../styles/DonationForm.css";
import "../styles/DonationFormThemes.css";
import { initDarkModeDetector } from '../utils/darkModeDetector';
import ThanksModal from '../Component/ThanksModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DonationCreateNew = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isThanksOpen, setIsThanksOpen] = useState(false);
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
  const totalCaracteres = caracteristicas.reduce((acc, c) => acc + c.length, 0);

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
    setCaracteristicasError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    // La imagen es obligatoria: requiere al menos 1 foto
    if (!formData.images || formData.images.length === 0) {
      showNotification('Agrega al menos 1 foto de la donación', 'error');
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

      // Cerrar confirmación y abrir agradecimiento (auto-dismiss 3s)
      setIsModalOpen(false);
      setIsThanksOpen(true);
      
      // Cerrar el modal de agradecimiento después de 3 segundos y redirigir a la lista de donaciones
      setTimeout(() => {
        setIsThanksOpen(false);
        // Redirigir a la lista de donaciones con un estado para mostrar mensaje de éxito
        navigate('/donaciones', { 
          state: { 
            showSuccess: true,
            message: '¡Donación publicada con éxito!' 
          } 
        });
      }, 3000);
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
    <div className="perfil-usuario-container donation-light">
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
        <div className="publicar-form-card">
          <h2>
            <i className="fas fa-heart"></i>
            Crear Nueva Donación
          </h2>
          <p>Comparte algo que ya no necesitas con quienes lo pueden aprovechar</p>
          
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              {notification.message}
            </div>
          )}

          <form className="publicar-producto-form" onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="form-group">
              <label htmlFor="title">Título de la Donación *</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ej: Ropa de niño talla 4-6 años en excelente estado"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <div className="input-helper">{formData.title.length}/100 caracteres</div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                name="category"
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

            <div className="form-group">
              <label htmlFor="condition">Estado del Artículo *</label>
              <select
                id="condition"
                name="condition"
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

            <div className="form-group">
              <label htmlFor="description">Descripción Detallada *</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe detalladamente lo que estás donando: estado, características, historia del artículo, motivo de donación, etc."
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                required
              />
              <div className="input-helper">{formData.description.length}/1000 caracteres</div>
            </div>

            {/* Características adicionales */}
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
                    disabled={caracteristicas.length >= 15}
                    className="caracteristica-input"
                  />
                  <button 
                    type="button" 
                    className="btn-add-caracteristica" 
                    onClick={handleAddCaracteristica} 
                    disabled={!caracteristicaInput.trim() || caracteristicas.length >= 15 || (totalCaracteres + caracteristicaInput.length > 1000)}
                  >
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
                      <button 
                        type="button" 
                        className="btn-remove-caracteristica" 
                        title="Eliminar" 
                        onClick={() => handleRemoveCaracteristica(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="caracteristicas-limits">
                  <span>{caracteristicas.length}/15 ítems</span> | <span>{totalCaracteres}/1000 caracteres</span>
                </div>
                {caracteristicasError && <div className="caracteristicas-error">{caracteristicasError}</div>}
              </div>
            </div>

            {/* Información de entrega */}
            <div className="form-group">
              <label htmlFor="pickupMethod">Método de Entrega *</label>
              <select
                id="pickupMethod"
                name="pickupMethod"
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

            <div className="form-group">
              <label htmlFor="location">Ubicación <span>(Opcional)</span></label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Ej: CABA, Palermo"
                value={formData.location}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            {/* Galería de fotos */}
            <div className="form-group">
              <label>Galería de Fotos * <span>(Obligatorio)</span></label>
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

            {/* Botones de acción */}
            <div className="form-actions" style={{display:'flex', gap:'1rem', justifyContent:'flex-end', alignItems:'center', flexWrap:'wrap'}}>
              <button 
                type="button" 
                className="btn-regresar"
                onClick={() => navigate('/donaciones')}
                style={{display:'inline-flex', alignItems:'center', justifyContent:'center', height:'48px'}}
              >
                <i className="fas fa-times" style={{marginRight:8}}></i>
                Cancelar
              </button>
              
              <button type="submit" className="btn-publicar" style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'auto', padding:'12px 24px', whiteSpace:'nowrap'}}>
                <i className="fas fa-heart" style={{marginRight:8}}></i>
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

      <ThanksModal
        isOpen={isThanksOpen}
        onClose={() => {
          setIsThanksOpen(false);
          navigate('/perfil', { state: { activeTab: 'donaciones' } });
        }}
        title="¡Gracias por tu donación!"
        message="Tu donación ya está visible para la comunidad."
      />

      <Footer />
    </div>
  );
};

export default DonationCreateNew;
