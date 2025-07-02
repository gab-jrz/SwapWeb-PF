import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

const Star = ({ filled }) => (
  <span style={{ color: filled ? '#ffc107' : '#ccc' }}>★</span>
);

const Calificaciones = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [califs, setCalifs] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/users/${userId}`)
      .then(res => res.json())
      .then(user => {
        setCalifs(user.calificaciones || []);
        setUserName(`${user.nombre} ${user.apellido}`);
      })
      .catch(err => console.error('Error cargando calificaciones', err));
  }, [userId]);

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <button className="btn-menu" onClick={() => navigate(-1)}>← Volver</button>
      <h2>Calificaciones de {userName}</h2>
      {califs.length === 0 ? (
        <p>Aún no tiene calificaciones.</p>
      ) : (
        <table className="table table-striped" style={{ maxWidth: 600 }}>
          <thead>
            <tr>
              <th>Calificador</th>
              <th>Rating</th>
              <th>Fecha</th>
              <th>Intercambio</th>
            </tr>
          </thead>
          <tbody>
            {califs.slice().reverse().map((c, idx) => (
              <tr key={idx}>
                <td>
                  <a href={`/perfil/${c.deId}`}>{c.deNombre || 'Usuario'}</a>
                </td>
                <td>
                  {[1, 2, 3, 4, 5].map(v => <Star key={v} filled={c.rating >= v} />)}
                </td>
                <td>{new Date(c.fecha).toLocaleDateString()}</td>
                <td>{c.productoOfrecido} ↔ {c.productoSolicitado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Calificaciones;
