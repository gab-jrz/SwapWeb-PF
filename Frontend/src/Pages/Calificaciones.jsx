import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Calificaciones.css";

const Star = ({ filled }) => (
  <span style={{ color: filled ? '#ffc107' : '#ccc' }}>★</span>
);

const Calificaciones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [califs, setCalifs] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/users/${id}`)
      .then(res => res.json())
      .then(user => {
        setCalifs(user.calificaciones || []);
        setUserName(`${user.nombre} ${user.apellido}`);
      })
      .catch(err => console.error('Error cargando calificaciones', err));
  }, [id]);

  return (
    <div className="calificaciones-page">
      <div className="calificaciones-container">
        <div className="navigation-bar">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver
          </button>
          
          <div className="breadcrumb">
            <button className="breadcrumb-item" onClick={() => navigate('/')}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Explorar
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Calificaciones</span>
          </div>
        </div>
        
        <h2 className="calificaciones-title">Calificaciones de {userName}</h2>
        
        {califs.length === 0 ? (
          <div className="no-calificaciones">
            <div className="no-calificaciones-icon">⭐</div>
            <div className="no-calificaciones-text">Aún no tiene calificaciones</div>
          </div>
        ) : (
          <table className="calificaciones-table">
            <thead>
              <tr>
                <th>Calificador</th>
                <th>Rating</th>
                <th>Fecha</th>
                <th>Intercambio</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {califs.slice().reverse().map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <Link to={`/perfil/${c.deId}`} className="calificador-link">
                      {c.deNombre || 'Usuario'}
                    </Link>
                  </td>
                  <td>
                    <span className="rating-stars">
                      {[1, 2, 3, 4, 5].map(v => <Star key={v} filled={c.rating >= v} />)}
                    </span>
                  </td>
                  <td>{new Date(c.fecha).toLocaleDateString()}</td>
                  <td>
                    {c.productoOfrecido && c.productoSolicitado ? (
                      <span className="intercambio-badge">
                        {c.productoOfrecido}
                        <span className="intercambio-icon">↔</span>
                        {c.productoSolicitado}
                      </span>
                    ) : (
                      <span className="intercambio-badge intercambio-empty">
                        Sin datos
                      </span>
                    )}
                  </td>
                  <td>
                    {c.comentario ? (
                      <div className="comentario-container">
                        <span className="comentario-text">
                          {c.comentario.length > 50 ? 
                            `${c.comentario.substring(0, 50)}...` : 
                            c.comentario
                          }
                        </span>
                        {c.comentario.length > 50 && (
                          <button 
                            className="comentario-expand"
                            onClick={() => {
                              const element = document.getElementById(`comentario-${idx}`);
                              const button = document.getElementById(`btn-${idx}`);
                              if (element.style.display === 'none') {
                                element.style.display = 'block';
                                button.textContent = 'Ver menos';
                              } else {
                                element.style.display = 'none';
                                button.textContent = 'Ver más';
                              }
                            }}
                            id={`btn-${idx}`}
                          >
                            Ver más
                          </button>
                        )}
                        {c.comentario.length > 50 && (
                          <div 
                            id={`comentario-${idx}`} 
                            className="comentario-full"
                            style={{display: 'none'}}
                          >
                            {c.comentario}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="comentario-empty">Sin comentario</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Calificaciones;
