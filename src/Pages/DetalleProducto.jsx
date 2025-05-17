import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import { getProduct } from "../services/api";
import "../styles/DetalleProducto.css";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProducto(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el producto. Por favor, intenta de nuevo más tarde.');
        console.error("Error al obtener el producto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChat = () => {
    // Implementar la lógica del chat aquí
    console.log("Iniciar chat para el producto:", id);
  };

  if (loading) return <div className="detalle-container"><Header /><p className="text-center">Cargando producto...</p><Footer /></div>;
  if (error) return <div className="detalle-container"><Header /><p className="text-center text-danger">{error}</p><Footer /></div>;
  if (!producto) return <div className="detalle-container"><Header /><p className="text-center">Producto no encontrado</p><Footer /></div>;

  return (
    <div className="detalle-container">
      <Header />
      <div className="detalle-contenido">
        <h2 className="detalle-titulo">{producto.title}</h2>
        <img
          src={producto.image}
          alt={producto.title}
          className="detalle-imagen"
        />
        <p className="detalle-descripcion">{producto.description}</p>
        <p className="detalle-descripcion">
          <strong>Categoría:</strong> {producto.categoria}
        </p>
        <div className="detalle-botones">
          <button className="btn-volver" onClick={() => navigate("/")}>
            ← Volver al inicio
          </button>
          <button className="btn-chat" onClick={handleChat}>
            💬 Consultar por este artículo
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetalleProducto;
