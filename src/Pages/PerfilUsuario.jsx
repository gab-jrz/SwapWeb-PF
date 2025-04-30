import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PerfilUsuario.css';
import Header from '../Component/Header.jsx';
import Footer from '../Component/Footer.jsx';

const PerfilUsuario = () => {
  // Mock user data - in a real app, this would come from an API or context
  const [userData, setUserData] = useState({
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    telefono: '123-456-7890',
    fechaRegistro: '12/01/2024',
    imagen: "/images/fotoperfil.jpeg",
    ubicacion: 'Ciudad de México',
    calificacion: 4.5,
    transacciones: 23
  });

  // Mock user listings
  const [userListings, setUserListings] = useState([
    {
      id: 1,
      titulo: 'Bicicleta de montaña',
      precio: 2500,
      imagen: "/images/bici-de-montana.jpg",
      estado: 'En venta'
    },
    {
      id: 2,
      titulo: 'Teléfono Samsung Galaxy S10',
      precio: 3500,
      imagen: "/images/s10.jpg",
      estado: 'En venta'
    },
    {
      id: 3,
      titulo: 'Consola PlayStation 4',
      precio: 4800,
      imagen: "/images/ps4.jpg",
      estado: 'Vendido'
    }
  ]);

  // Mock user transactions
  const [userTransactions, setUserTransactions] = useState([
    {
      id: 1,
      item: 'TV Sony 42"',
      fecha: '10/04/2024',
      tipo: 'Compra',
      estado: 'Completado'
    },
    {
      id: 2,
      item: 'Laptop Dell',
      fecha: '23/03/2024',
      tipo: 'Venta',
      estado: 'Completado'
    },
    {
      id: 3,
      item: 'Mesa de comedor',
      fecha: '15/02/2024',
      tipo: 'Venta',
      estado: 'Completado'
    }
  ]);

  // Active tab state
  const [activeTab, setActiveTab] = useState('articulos');

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="perfil-usuario-container">
      <Header />
      
      <div className="perfil-usuario-content">
        <div className="perfil-header">
          <div className="perfil-imagen">
            <img src={userData.imagen} alt="Foto de perfil" />
          </div>
          
          <div className="perfil-info">
            <h1>{userData.nombre}</h1>
            <div className="perfil-stats">
              <div className="stat">
                <span className="stat-value">{userData.calificacion}</span>
                <span className="stat-label">Calificación</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData.transacciones}</span>
                <span className="stat-label">Transacciones</span>
              </div>
              <div className="stat">
                <span className="stat-value">{userData.fechaRegistro}</span>
                <span className="stat-label">Miembro desde</span>
              </div>
            </div>
            
            <div className="perfil-detalles">
              <p><strong>Ubicación:</strong> {userData.ubicacion}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Teléfono:</strong> {userData.telefono}</p>
            </div>
            
            <div className="perfil-acciones">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-configuracion">Configuración</button>
            </div>
          </div>
        </div>
        
        <div className="perfil-tabs">
          <button 
            className={`tab-btn ${activeTab === 'articulos' ? 'active' : ''}`}
            onClick={() => handleTabChange('articulos')}
          >
            Mis Artículos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transacciones' ? 'active' : ''}`}
            onClick={() => handleTabChange('transacciones')}
          >
            Mis Transacciones
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favoritos' ? 'active' : ''}`}
            onClick={() => handleTabChange('favoritos')}
          >
            Favoritos
          </button>
        </div>
        
        <div className="perfil-tab-content">
          {activeTab === 'articulos' && (
            <div className="articulos-container">
              <div className="articulos-header">
                <h2>Mis Artículos</h2>
                <Link to="/publicar" className="btn-publicar">Publicar Nuevo</Link>
              </div>
              
              <div className="articulos-grid">
                {userListings.map(item => (
                  <div key={item.id} className={`articulo-card ${item.estado === 'Vendido' ? 'vendido' : ''}`}>
                    <div className="articulo-imagen">
                      <img src={item.imagen} alt={item.titulo} />
                      {item.estado === 'Vendido' && <span className="badge-vendido">Vendido</span>}
                    </div>
                    <div className="articulo-info">
                      <h3>{item.titulo}</h3>
                      <p className="articulo-precio">${item.precio}</p>
                      <div className="articulo-acciones">
                        <button className="btn-editar-articulo">Editar</button>
                        <button className="btn-eliminar-articulo">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'transacciones' && (
            <div className="transacciones-container">
              <h2>Historial de Transacciones</h2>
              <table className="transacciones-tabla">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {userTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.item}</td>
                      <td>{transaction.fecha}</td>
                      <td>{transaction.tipo}</td>
                      <td>
                        <span className={`estado-${transaction.estado.toLowerCase()}`}>
                          {transaction.estado}
                        </span>
                      </td>
                      <td>
                        <button className="btn-detalles">Ver Detalles</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'favoritos' && (
            <div className="favoritos-container">
              <h2>Artículos Favoritos</h2>
              <p className="no-favoritos">No tienes artículos favoritos aún.</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PerfilUsuario;