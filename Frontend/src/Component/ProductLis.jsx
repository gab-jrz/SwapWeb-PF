import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Asegúrate de tener esto
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../styles/DetalleProducto.css";

const DetalleProducto = () => {
  const { id } = useParams(); // Obtiene el id del producto
  const navigate = useNavigate(); 
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((response) => response.json())
      .then((data) => setProducto(data))
      .catch((error) => console.error("Error al obtener el producto:", error));
  }, [id]);

  
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
          <button className="btn-chat" onClick={manejarChat}>
            💬 Consultar por este artículo
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default DetalleProducto;