import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Intercambiar.css";
import Footer from "../Component/Footer";
import Header from "../Component/Header";

const API_URL = 'http://localhost:3001/api';

const Intercambiar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    productoId, 
    productoTitle, 
    productoImage,
    productoDescription,
    ownerId, 
    ownerNombre, 
    ownerApellido 
  } = location.state || {};

  const [formData, setFormData] = useState({
    productoOfrecido: "",
    descripcion: "",
    condiciones: "",
  });

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProducts = async () => {
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
      if (!usuarioActual) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/user/${usuarioActual.id}`);
        if (!response.ok) {
          throw new Error("Error al obtener los productos del usuario");
        }
        const products = await response.json();
        // Filtrar el producto actual y productos ya intercambiados
        const availableProducts = products.filter(product => 
          product.id !== productoId && !product.intercambiado
        );
        setUserProducts(availableProducts);
        setError(null);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setError("No se pudieron cargar tus productos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [navigate, productoId]);

  const handleProductSelect = (product) => {
    setSelectedProductId(product.id);
    setFormData(prevData => ({
      ...prevData,
      productoOfrecido: product.title,
      descripcion: product.description
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Por favor, selecciona un producto para intercambiar");
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

      if (!usuarioActual) {
        alert("Debes iniciar sesión para enviar una propuesta");
        navigate("/login");
        return;
      }

      const selectedProduct = userProducts.find(p => p.id === selectedProductId);

      const mensaje = {
        de: `${usuarioActual.nombre} ${usuarioActual.apellido}`,
        deId: usuarioActual.id.toString(),
        paraId: ownerId.toString(),
        paraNombre: `${ownerNombre} ${ownerApellido}`,
        productoId: productoId.toString(),
        productoTitle,
        productoOfrecido: selectedProduct.title,
        descripcion: selectedProduct.description,
        condiciones: formData.condiciones,
        imagenNombre: selectedProduct.image
      };

      console.log('Enviando mensaje:', mensaje);
      console.log('URL:', `${API_URL}/messages`);

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mensaje),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Error al enviar la propuesta: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      alert("¡Propuesta enviada con éxito!");
      navigate(`/perfil/${usuarioActual.id}`);

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert(`Error al enviar la propuesta: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location.state) {
    return (
      <div className="intercambiar-container">
        <Header search={false} />
        <div className="intercambiar-error">
          <h2>Error: No se encontró la información del producto</h2>
          <button className="btn-menu" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header search={false} />
      <div className="intercambiar-container">
      <div className="intercambiar-detalles">
        <h2>
          Estás enviando una propuesta a{" "}
          <span className="resaltado">{ownerNombre} {ownerApellido}</span>
        </h2>
          <div className="producto-interes">
            <div className="producto-interes-imagen">
              <img src={productoImage} alt={productoTitle} />
            </div>
            <div className="producto-interes-info">
              <h3>{productoTitle}</h3>
              <p className="producto-descripcion">{productoDescription}</p>
            </div>
          </div>
      </div>

      <form className="intercambiar-formulario" onSubmit={handleSubmit}>
        <h3>Selecciona un producto para intercambiar</h3>

        {loading ? (
          <p>Cargando tus productos...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : userProducts.length === 0 ? (
          <div className="no-products">
            <p>No tienes productos disponibles para intercambiar.</p>
            <button type="button" className="btn-menu" onClick={() => navigate("/publicar")}>
              Publicar un producto
            </button>
          </div>
        ) : (
          <div className="productos-grid">
            {userProducts.map((product) => (
              <div 
                key={product.id} 
                className={`producto-card ${selectedProductId === product.id ? 'selected' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="producto-imagen">
                  <img src={product.image} alt={product.title} />
                  </div>
                  <div className="producto-info">
                    <h4>{product.title}</h4>
                    <p>{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProductId && (
          <label>
            Lugar y condiciones de intercambio:
            <textarea
              name="condiciones"
              value={formData.condiciones}
              onChange={(e) => setFormData(prev => ({ ...prev, condiciones: e.target.value }))}
              required
              placeholder="Especifica el lugar y las condiciones para realizar el intercambio"
            />
          </label>
        )}

        <div className="botones-intercambio">
          <button
            type="button"
            className="btn-menu"
            onClick={() => navigate(`/producto/${productoId}`)}
          >
            ← Regresar al producto
          </button>

          <button 
            type="submit" 
            className="btn-enviar"
            disabled={isSubmitting || !selectedProductId}
          >
            {isSubmitting ? "Enviando..." : "Enviar propuesta"}
          </button>
        </div>
      </form>
      </div>
      <Footer />
    </>
  );
};

export default Intercambiar;
