import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";

const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((response) => response.json())
      .then((data) => setProducto(data))
      .catch((error) => console.error("Error al obtener el producto:", error));
  }, [id]);

  if (!producto) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <Header />
      <div>
        <h2>{producto.title}</h2>
        <img src={producto.image} alt={producto.title} />
        <p>{producto.description}</p>
      </div>
      <Footer />
    </div>
  );
};

export default DetalleProducto;
