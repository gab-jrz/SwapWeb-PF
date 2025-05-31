import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Editar.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';

const API_URL = 'http://localhost:3001/api';

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
    imagen: userData?.imagen || '/images/fotoperfil.jpg',
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
          imagen: userDataFromDB.imagen || '/images/fotoperfil.jpg',
        });
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file.name,
      }));
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
      imagen: userData.imagen || '/images/fotoperfil.jpg',
    });
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
      // Actualizar en la base de datos
      const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imagen: formData.imagen.replace('/images/', '')
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      const updatedUser = await response.json();

      // Actualizar localStorage
      const usuarioActualizado = {
        ...userData,
        ...updatedUser
      };

      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
      setUserData(usuarioActualizado);

      setIsEditing(false);
      setIsModalOpen(false);
      setNotification({
        message: '¡Cambios guardados correctamente!',
        type: 'success'
      });

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
                src={`/images/${formData.imagen.replace('/images/', '')}`}
                alt="Foto de perfil"
                className="imagen-perfil-edicion"
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
                    onChange={handleImageChange}
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
