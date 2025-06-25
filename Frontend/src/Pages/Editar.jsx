import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Editar.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';

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

const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-confirmar" onClick={onConfirm}>Confirmar</button>
          <button className="btn-cancelar-modal" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const Notification = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

const Editar = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(() => {
    const data = JSON.parse(localStorage.getItem('usuarioActual'));
    return data || null;
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '0381-5088-999',
    ubicacion: 'Argentina, Tucumán',
    imagen: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/${userData.id}`);
        if (!response.ok) throw new Error('Error al obtener datos del usuario');
        
        const userDataFromDB = await response.json();
        setFormData({
          nombre: userDataFromDB.nombre,
          apellido: userDataFromDB.apellido,
          email: userDataFromDB.email,
          telefono: userDataFromDB.telefono || '0381-5088-999',
          ubicacion: userDataFromDB.ubicacion || 'Argentina, Tucumán',
          imagen: userDataFromDB.imagen || null,
        });
        
        if (userDataFromDB.imagen) {
          if (userDataFromDB.imagen.startsWith('data:image')) {
            setPreviewImage(userDataFromDB.imagen);
          } else {
            const imagePath = userDataFromDB.imagen.startsWith('/images/') 
              ? userDataFromDB.imagen 
              : `/images/${userDataFromDB.imagen}`;
            setPreviewImage(imagePath);
          }
        } else {
          setPreviewImage('/images/fotoperfil.jpg');
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          message: 'Error al cargar los datos del usuario',
          type: 'error'
        });
      }
    };

    fetchUserData();
  }, [userData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setNotification({
          message: 'Por favor selecciona un archivo de imagen válido',
          type: 'error'
        });
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
          setFormData(prev => ({ ...prev, imagen: compressedImage }));
        };
        reader.readAsDataURL(compressedImage);
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        setNotification({
          message: error.message || 'Error al procesar la imagen',
          type: 'error'
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono || '0381-5088-999',
      ubicacion: userData.ubicacion || 'Argentina, Tucumán',
      imagen: userData.imagen || null,
    });
    if (userData.imagen) {
      setPreviewImage(`/images/${userData.imagen.replace('/images/', '')}`);
    } else {
      setPreviewImage(null);
    }
    setIsEditing(false);
    setNotification({ message: '', type: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      setNotification({
        message: 'Por favor completa todos los campos obligatorios',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageData = null;
      
      if (formData.imagen instanceof Blob) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(formData.imagen);
        });
      } 
      else if (formData.imagen) {
        imageData = formData.imagen;
      }

      const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imagen: imageData
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      const updatedUser = await response.json();
      
      const usuarioActualizado = {
        ...userData,
        ...updatedUser,
        imagen: updatedUser.imagen
      };

      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
      setUserData(usuarioActualizado);

      setIsEditing(false);
      setIsModalOpen(false);
      setNotification({
        message: '¡Cambios guardados correctamente!',
        type: 'success'
      });

      if (updatedUser.imagen) {
        if (updatedUser.imagen.startsWith('data:image')) {
          setPreviewImage(updatedUser.imagen);
        } else {
          const imagePath = updatedUser.imagen.startsWith('/images/') 
            ? updatedUser.imagen 
            : `/images/${updatedUser.imagen}`;
          setPreviewImage(imagePath);
        }
      }

      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setNotification({
        message: 'Error al guardar los cambios. Por favor, intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header search={false} />
      <div className="edicion-perfil-container">
        <button 
          className="btn-regresar-edicion" 
          onClick={() => {
            const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
            navigate(`/perfil/${usuarioActual.id}`);
          }}
        >
          ← Volver
        </button>

        <Notification 
          message={notification.message} 
          type={notification.type} 
        />

        <div className="contenido-principal">
          <div className="seccion-imagen">
            <div className="contenedor-imagen-edicion">
              <img
                src={previewImage || '/images/fotoperfil.jpg'}
                alt="Foto de perfil"
                className="imagen-perfil-edicion"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/fotoperfil.jpg';
                }}
              />
              {isEditing && (
                <div className="selector-imagen">
                  <label htmlFor="imagen-input" className="btn-seleccionar-imagen">
                    Editar foto
                  </label>
                  <input
                    type="file"
                    id="imagen-input"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
            {!isEditing && (
              <button className="btn-iniciar-edicion" onClick={handleEdit}>
                Editar Perfil
              </button>
            )}
          </div>

          <div className="seccion-datos">
            <h2 className="titulo-datos">Datos Personales</h2>
            
            {!isEditing ? (
              <div className="datos-vista">
                <div className="fila-dato">
                  <span className="etiqueta">Nombre:</span>
                  <span className="valor">{formData.nombre}</span>
                </div>
                <div className="fila-dato">
                  <span className="etiqueta">Apellido:</span>
                  <span className="valor">{formData.apellido}</span>
                </div>
                <div className="fila-dato">
                  <span className="etiqueta">Email:</span>
                  <span className="valor">{formData.email}</span>
                </div>
                <div className="fila-dato">
                  <span className="etiqueta">Teléfono:</span>
                  <span className="valor">{formData.telefono}</span>
                </div>
                <div className="fila-dato">
                  <span className="etiqueta">Ubicación:</span>
                  <span className="valor">{formData.ubicacion}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="formulario-edicion">
                <div className="grupo-campo">
                  <label htmlFor="nombre">Nombre:</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="grupo-campo">
                  <label htmlFor="apellido">Apellido:</label>
                  <input 
                    type="text" 
                    id="apellido" 
                    name="apellido" 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="grupo-campo">
                  <label htmlFor="email">Email:</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="grupo-campo">
                  <label htmlFor="telefono">Teléfono:</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="grupo-campo">
                  <label htmlFor="ubicacion">Ubicación:</label>
                  <input 
                    type="text" 
                    id="ubicacion" 
                    name="ubicacion" 
                    value={formData.ubicacion} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="acciones-formulario">
                  <button 
                    type="submit" 
                    className="btn-guardar-edicion"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancelar-edicion" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar cambios"
        message="¿Estás seguro de que deseas guardar los cambios realizados?"
      />

      <Footer />
    </>
  );
};

export default Editar;
