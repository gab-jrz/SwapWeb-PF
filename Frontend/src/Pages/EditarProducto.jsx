import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditarProducto.css";
import Header from "../Component/Header";
import { categorias } from "../categorias";
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
    images: [], // ahora array
    ownerId: "",
    caracteristicas: [],
  });

  const [caracteristicaInput, setCaracteristicaInput] = useState("");
  const [caracteristicasError, setCaracteristicasError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchProducto = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }
        
        const data = await response.json();
        setProducto({ ...data, images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [] });
        setPreviewImages(Array.isArray(data.images) ? data.images : data.image ? [data.image] : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        alert("Error al cargar el producto. Por favor, intenta nuevamente.");
        const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
        navigate(`/perfil/${usuarioActual.id}`);
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
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
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
        // Reutilizar lógica de compresión de PublicarProducto.jsx
        const compressedImage = await compressImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImages(prev => [...prev, reader.result]);
          setProducto(prev => ({ ...prev, images: [...prev.images, compressedImage] }));
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
    setProducto(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
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


  // Características: validación
  const totalCaracteres = (producto.caracteristicas || []).reduce((acc, c) => acc + c.length, 0);

  const handleAddCaracteristica = () => {
    if (!caracteristicaInput.trim()) return;
    if ((producto.caracteristicas || []).length >= 15) {
      setCaracteristicasError("Máximo 15 ítems.");
      return;
    }
    if (totalCaracteres + caracteristicaInput.length > 1000) {
      setCaracteristicasError("Máximo 1000 caracteres en total.");
      return;
    }
    setProducto(prev => ({
      ...prev,
      caracteristicas: [...(prev.caracteristicas || []), caracteristicaInput.trim()]
    }));
    setCaracteristicaInput("");
    setCaracteristicasError("");
  };

  const handleEditCaracteristica = (idx, value) => {
    if (value.length > 1000) return;
    const nuevas = [...(producto.caracteristicas || [])];
    nuevas[idx] = value;
    setProducto(prev => ({ ...prev, caracteristicas: nuevas }));
  };

  const handleRemoveCaracteristica = idx => {
    setProducto(prev => ({
      ...prev,
      caracteristicas: (prev.caracteristicas || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convertir archivos nuevos a base64, mantener URLs existentes
    const imagesBase64OrUrl = await Promise.all(producto.images.map(img => {
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
    if ((producto.caracteristicas || []).length > 15) {
      setCaracteristicasError("Máximo 15 ítems.");
      return;
    }
    if (totalCaracteres > 1000) {
      setCaracteristicasError("Máximo 1000 caracteres en total.");
      return;
    }
    try {
      const bodyObj = { ...producto, images: imagesBase64OrUrl };
      if (!bodyObj.caracteristicas || bodyObj.caracteristicas.length === 0) {
        delete bodyObj.caracteristicas;
      }
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyObj),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar producto");
      }
      const updatedProduct = await response.json();
      alert("Producto actualizado correctamente");
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
      navigate(`/perfil/${usuarioActual.id}`);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto. Por favor, intenta nuevamente.");
    }
  };




  if (isLoading) {
    return <div className="loading-container">Cargando información del producto...</div>;
  }

  return (
    <div className="editar-producto-container">
      <Header search={false} />
      {notification.show && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}
      <div className="editar-producto-content">
        <button 
          className="btn-volver"
          onClick={() => {
            const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
            navigate(`/perfil/${usuarioActual.id}`);
          }}
        >
          ← Volver al perfil
        </button>

        <div className="editar-producto-card">
          <h2 className="editar-producto-title">Editar Producto</h2>
          <div className="producto-preview-multi">
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
                        handleRemoveImage(idx);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="imagen-placeholder">
                <span>Sin imagen</span>
              </div>
            )}
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
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={e => handleFileSelect(e.target.files)}
                disabled={previewImages.length >= 3}
              />
              <div className="upload-placeholder">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Arrastra y suelta hasta 3 imágenes aquí o haz clic para seleccionar</p>
                <span>Formatos aceptados: JPG, PNG, GIF</span>
              </div>
            </div>
            <div className="multi-image-warning">Puedes subir hasta 3 imágenes.</div>
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
                    disabled={(producto.caracteristicas || []).length>=15 || totalCaracteres>=1000}
                  />
                  <button type="button" className="btn-add-caracteristica" onClick={handleAddCaracteristica} disabled={!caracteristicaInput.trim() || (producto.caracteristicas || []).length>=15 || totalCaracteres+caracteristicaInput.length>1000}>
                    +
                  </button>
                </div>
                <div className="caracteristicas-list">
                  {(producto.caracteristicas || []).map((item, idx) => (
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
                  <span>{(producto.caracteristicas || []).length}/15 ítems</span> | <span>{totalCaracteres}/1000 caracteres</span>
                </div>
                {caracteristicasError && <div className="caracteristicas-error">{caracteristicasError}</div>}
              </div>
            </div>
            {/* cierre correcto de form-group características */}

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={producto.description}
                onChange={handleChange}
                placeholder="Describe el producto"
                rows={4}
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
                {categorias.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-guardar">Guardar Cambios</button>
            {/* Eliminado: input y small de imagen URL que generaban errores de sintaxis */}

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
                onClick={() => {
                  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
                  navigate(`/perfil/${usuarioActual.id}`);
                }}
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