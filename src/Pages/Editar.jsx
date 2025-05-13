import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Editar.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';

const Editar = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(() => {
    const data = JSON.parse(localStorage.getItem('usuarioActual'));
    return data || null;
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '0381-5088-999',  // Teléfono predeterminado
    ubicacion: 'Argentina, Tucumán',  // Ubicación predeterminada
    imagen: 'images/fotoperfil.jpeg',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    } else {
      setFormData({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        telefono: userData.telefono || '0381-5088-999', 
        ubicacion: userData.ubicacion || 'Argentina, Tucumán',  
        imagen: 'images/fotoperfil.jpeg',
      });
    }
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
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imagen: imageUrl,
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      setMessage({ text: 'Por favor completa todos los campos obligatorios', type: 'error' });
      return;
    }

    // 🔐 Conservamos el ID original y otros campos no editables
    const usuarioConId = {
      ...userData,
      ...formData
    };

    // 🧠 Actualizamos usuarioActual en localStorage
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioConId));
    setUserData(usuarioConId);

    // 🗃️ Si existe un array de usuarios, también actualizamos ahí
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuariosActualizados = usuarios.map(user =>
      user.id === usuarioConId.id ? usuarioConId : user
    );
    localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));

    setIsEditing(false);
    setMessage({ text: 'Perfil actualizado con éxito', type: 'success' });

    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  return (
    <>
      <Header search={false} />
      <button className="btn-menu" style={{ margin: 10 }} onClick={() => navigate("/perfil/2")}>
        ← Retornar
      </button>

      <div className="actions">
        {!isEditing && (
          <button className="btn btn-primary" onClick={handleEdit}>
            Editar Perfil
          </button>
        )}
      </div>

      <div className="perfil-container">
        <h1 className="titulo-editar">Mi Perfil</h1>

        {message.text && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="perfil-card">
          <div className="perfil-header">
            <div className="imagen-container">
              <img
                src={formData.imagen}
                alt="Foto de perfil"
                className="perfil-imagen"
              />
              {isEditing && (
                <div className="cambiar-imagen">
                  <label htmlFor="imagen-input" className="btn-cambiar-imagen">
                    Cambiar imagen
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
          </div>

          <div className="perfil-content">
            {!isEditing ? (
              <div className="info-section">
                <h3>Información Personal</h3>
                <div className="info-row"><span className="info-label">Nombre:</span> <span>{formData.nombre}</span></div>
                <div className="info-row"><span className="info-label">Apellido:</span> <span>{formData.apellido}</span></div>
                <div className="info-row"><span className="info-label">Email:</span> <span>{formData.email}</span></div>
                <div className="info-row"><span className="info-label">Teléfono:</span> <span>{formData.telefono}</span></div>
                <div className="info-row"><span className="info-label">Ubicación:</span> <span>{formData.ubicacion}</span></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="edit-form">
                <h3>Editar Información Personal</h3>

                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación</label>
                  <input type="text" id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={handleChange} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Editar;
