import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiTrash2, FiSave, FiX, FiUpload } from 'react-icons/fi';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';
import '../styles/Editar.css';

const API_URL = 'http://localhost:3001/api';

// Lista de provincias argentinas
const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
].sort();

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
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    provincia: '',
    imagen: null,
    imagenPreview: ''
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Efecto para cargar los datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      
      if (!usuarioActual) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/${usuarioActual.id}`);
        if (!response.ok) throw new Error('Error al cargar los datos del usuario');
        
        const data = await response.json();
        console.log('🔍 Datos del usuario en Editar:', data);
        console.log('🖼️ Campo imagen:', data.imagen);
        
        setUsuario(data);
        
        // Construir URL de imagen
        let imagenUrl = '';
        if (data.imagen) {
          // Si la imagen ya incluye http, usarla directamente
          if (data.imagen.startsWith('http')) {
            imagenUrl = data.imagen;
          } else {
            // Si no, construir la URL con el API_URL
            imagenUrl = data.imagen.startsWith('/') ? `${API_URL}${data.imagen}` : `${API_URL}/${data.imagen}`;
          }
        }
        
        console.log('🔗 URL de imagen construida:', imagenUrl);
        
        // Actualizar el estado del formulario con los datos del usuario
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          provincia: data.provincia || '',
          imagen: null,
          imagenPreview: imagenUrl
        });
        
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        setNotificacion({
          mostrar: true,
          mensaje: 'Error al cargar los datos del usuario',
          tipo: 'error'
        });
      } finally {
        setCargando(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejador para la carga de imágenes
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setNotificacion({
        mostrar: true,
        mensaje: 'Por favor, sube un archivo de imagen válido',
        tipo: 'error'
      });
      return;
    }

    // Validar tamaño del archivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotificacion({
        mostrar: true,
        mensaje: 'La imagen es demasiado grande (máx 5MB)',
        tipo: 'error'
      });
      return;
    }

    try {
      setCargandoImagen(true);
      
      // Comprimir la imagen
      const compressedImage = await compressImage(file);
      
      // Crear vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagen: compressedImage,
          imagenPreview: reader.result
        }));
      };
      reader.readAsDataURL(compressedImage);
      
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      setNotificacion({
        mostrar: true,
        mensaje: 'Error al procesar la imagen',
        tipo: 'error'
      });
    } finally {
      setCargandoImagen(false);
    }
  };

  // Manejador para eliminar la foto de perfil
  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null,
      imagenPreview: ''
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejador para guardar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editando) {
      setEditando(true);
      return;
    }
    
    try {
      setCargando(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('apellido', formData.apellido);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('provincia', formData.provincia);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }
      
      const response = await fetch(`${API_URL}/users/${usuario.id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error al actualizar los datos');
      
      const updatedUser = await response.json();
      
      // Actualizar el usuario en el localStorage
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
      localStorage.setItem('usuarioActual', JSON.stringify({
        ...usuarioActual,
        ...updatedUser
      }));
      
      setNotificacion({
        mostrar: true,
        mensaje: 'Datos actualizados correctamente',
        tipo: 'exito'
      });
      
      setEditando(false);
      
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      setNotificacion({
        mostrar: true,
        mensaje: 'Error al actualizar los datos',
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  // Manejador para cancelar la edición
  const handleCancel = () => {
    setEditando(false);
    
    // Construir URL de imagen para cancelar
    let imagenUrl = '';
    if (usuario.imagen) {
      if (usuario.imagen.startsWith('http')) {
        imagenUrl = usuario.imagen;
      } else {
        imagenUrl = usuario.imagen.startsWith('/') ? `${API_URL}${usuario.imagen}` : `${API_URL}/${usuario.imagen}`;
      }
    }
    
    // Restaurar los datos originales del usuario
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      provincia: usuario.provincia || '',
      imagen: null,
      imagenPreview: imagenUrl
    });
  };

  // Mostrar loading mientras se cargan los datos
  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="editar-perfil-container">
        <h1 className="titulo-edicion">
          {editando ? 'Editar Perfil' : 'Mi Perfil'}
        </h1>
        
        <form onSubmit={handleSubmit} className="formulario-edicion">
          {/* Sección de foto de perfil */}
          <div className="seccion-foto">
            <div 
              className="contenedor-foto-perfil"
              onMouseEnter={() => editando && setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {formData.imagenPreview ? (
                <img 
                  src={formData.imagenPreview} 
                  alt="Foto de perfil" 
                  className="foto-perfil"
                />
              ) : (
                <div className="foto-placeholder">
                  <FiUser size={48} className="icono-usuario" />
                </div>
              )}
              
              {editando && (
                <div className={`overlay-foto ${isHovered ? 'visible' : ''}`}>
                  <label className="boton-cambiar-foto">
                    <FiCamera />
                    <span>Cambiar foto</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="input-archivo"
                    />
                  </label>
                  
                  {formData.imagenPreview && (
                    <button 
                      type="button" 
                      className="boton-eliminar-foto"
                      onClick={handleRemovePhoto}
                    >
                      <FiTrash2 />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              )}
              
              {cargandoImagen && (
                <div className="cargando-foto">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Campos del formulario */}
          <div className="campos-formulario">
            <div className="fila-campos">
              <div className={`grupo-campo ${editando ? 'editando' : ''}`}>
                <label htmlFor="nombre">
                  <FiUser className="icono-campo" />
                  Nombre
                </label>
                {editando ? (
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="valor-campo">{formData.nombre || 'No especificado'}</p>
                )}
              </div>
              
              <div className={`grupo-campo ${editando ? 'editando' : ''}`}>
                <label htmlFor="apellido">
                  <FiUser className="icono-campo" />
                  Apellido
                </label>
                {editando ? (
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="valor-campo">{formData.apellido || 'No especificado'}</p>
                )}
              </div>
            </div>
            
            <div className="fila-campos">
              <div className={`grupo-campo ${editando ? 'editando' : ''}`}>
                <label htmlFor="email">
                  <FiMail className="icono-campo" />
                  Correo electrónico
                </label>
                {editando ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="valor-campo">{formData.email}</p>
                )}
              </div>
              
              <div className={`grupo-campo ${editando ? 'editando' : ''}`}>
                <label htmlFor="telefono">
                  <FiPhone className="icono-campo" />
                  Teléfono
                </label>
                {editando ? (
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="valor-campo">{formData.telefono || 'No especificado'}</p>
                )}
              </div>
            </div>
            
            <div className="fila-campos">
              <div className={`grupo-campo ${editando ? 'editando' : ''}`}>
                <label htmlFor="provincia">
                  <FiMapPin className="icono-campo" />
                  Provincia
                </label>
                {editando ? (
                  <select
                    id="provincia"
                    name="provincia"
                    value={formData.provincia || 'Tucumán'}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una provincia</option>
                    {PROVINCIAS.map((provincia) => (
                      <option key={provincia} value={provincia}>
                        {provincia}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="valor-campo">{formData.provincia || 'No especificada'}</p>
                )}
              </div>
              <div className="grupo-campo"></div> {/* Espacio en blanco para alinear */}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="acciones-formulario">
            {editando ? (
              <>
                <button 
                  type="button" 
                  className="boton-secundario"
                  onClick={handleCancel}
                  disabled={cargando}
                >
                  <FiX />
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="boton-primario"
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <span className="spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Guardar cambios
                    </>
                  )}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="boton-primario"
                onClick={() => setEditando(true)}
              >
                <FiUser />
                Editar perfil
              </button>
            )}
          </div>
        </form>
        
        {/* Notificación */}
        {notificacion.mostrar && (
          <div className={`notificacion ${notificacion.tipo}`}>
            <p>{notificacion.mensaje}</p>
            <button 
              className="cerrar-notificacion"
              onClick={() => setNotificacion({ ...notificacion, mostrar: false })}
            >
              &times;
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Editar;
