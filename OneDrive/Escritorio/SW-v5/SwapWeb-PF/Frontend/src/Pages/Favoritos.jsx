import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import '../styles/Home.css';

// Página de Favoritos con las mismas cards que Home
const Favoritos = () => {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);

  // Cargar favoritos desde localStorage al montar y al cambiar por eventos externos
  useEffect(() => {
    const load = () => {
      try {
        const data = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavoritos(Array.isArray(data) ? data : []);
      } catch {
        setFavoritos([]);
      }
    };
    load();
    const handler = () => load();
    window.addEventListener('favoritesChanged', handler);
    return () => window.removeEventListener('favoritesChanged', handler);
  }, []);

  // Eliminar un producto de favoritos
  const handleRemoveFavorite = (productId) => {
    const current = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavoritos(updated);
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  return (
    <div className="favoritos-main-container">
      <h2 className="favoritos-title">Favoritos</h2>
      <div className="product-list">
        {favoritos.length === 0 ? (
          <p>No tienes productos favoritos aún.</p>
        ) : (
          favoritos.map((producto) => (
            <ProductCard
              key={producto.id}
              id={producto.id}
              title={producto.title}
              description={producto.description}
              categoria={producto.categoria}
              image={producto.image}
              images={producto.images}
              fechaPublicacion={producto.fechaPublicacion || producto.createdAt}
              provincia={producto.provincia || producto.ubicacion}
              ownerName={producto.ownerName}
              ownerId={producto.ownerId}
              condicion={producto.condicion}
              valorEstimado={producto.valorEstimado}
              disponible={producto.disponible}
              onConsultar={() => navigate(`/producto/${producto.id}`)}
              hideFavoriteButton
              showRemoveFavorite
              onRemoveFavorite={handleRemoveFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Favoritos;
