import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../styles/DetalleProducto.css";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [usuarioPropietario, setUsuarioPropietario] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }
        return response.json();
      })
      .then((data) => {
        setProducto(data);
        // Buscar al usuario propietario con el ownerId
        return fetch(`http://localhost:3000/usuarios/${data.ownerId}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error("Usuario no encontrado");
        return res.json();
      })
      .then((usuario) => setUsuarioPropietario(usuario))
      .catch((error) =>
        console.error("Error al obtener el producto o usuario:", error)
      );
  }, [id]);

  const manejarChat = () => {
    const usuarioAutenticado = localStorage.getItem("isLoggedIn");

    if (usuarioAutenticado === "true") {
      navigate("/intercambiar", {
    state: {
    productoId: producto.id,
    productoTitle: producto.title,
    ownerId: producto.ownerId,
    ownerNombre: usuarioPropietario?.nombre,
    ownerApellido: usuarioPropietario?.apellido,
            },
    });
    } else {
      localStorage.setItem("ultimaRuta", window.location.pathname);
      navigate("/login");
    }
  };

  if (!producto) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalle-container">
      <Header search={false} />
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
        <p className="detalle-descripcion">
          <strong>Propietario/a:</strong>{" "}
          {usuarioPropietario
            ? `${usuarioPropietario.nombre} ${usuarioPropietario.apellido}`
            : "Cargando usuario..."}
        </p>

        <div className="detalle-botones">
          <button className="btn-volver" onClick={() => navigate("/")}>
            ← Inicio
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
