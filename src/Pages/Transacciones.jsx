import React, { useEffect, useState } from "react";
import "../styles/Transacciones.css";
import Footer from "../Component/Footer";
import { useNavigate } from "react-router-dom";

const Transacciones = () => {
  const [intercambios, setIntercambios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const intercambiosSimulados = [
      {
        id: 1,
        productoOfrecido: "Zapatillas Nike",
        descripcion: "Zapatillas usadas, talla 42, buen estado.",
        condiciones: "Cambio solo por mochila nueva.",
        estado: "Pendiente",
      },
      {
        id: 2,
        productoOfrecido: "Libro de diseño gráfico",
        descripcion: "Poco uso, ideal para estudiantes.",
        condiciones: "Busco auriculares en buen estado.",
        estado: "Aceptado",
      },
    ];
    setIntercambios(intercambiosSimulados);
  }, []);

  return (
    <div className="transacciones-container">
      <div className="transacciones-header">
        <h2 className="app-name">
          <span style={{ color: "#00c853" }}>Swap</span>
          <span style={{ color: "#00bcd4" }}>Web</span>
        </h2>
        <button onClick={() => navigate("/")} className="btn-volver">
          ← Volver al inicio
        </button>
      </div>

      <div className="transacciones-content">
        <h2>Mis transacciones</h2>
        {intercambios.length === 0 ? (
          <p>No hay transacciones aún.</p>
        ) : (
          <ul className="transacciones-lista">
            {intercambios.map((item) => (
              <li key={item.id} className="transaccion-item">
                <h3>{item.productoOfrecido}</h3>
                <p><strong>Descripción:</strong> {item.descripcion}</p>
                <p><strong>Condiciones:</strong> {item.condiciones}</p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span className={`estado-${item.estado.toLowerCase()}`}>
                    {item.estado}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Transacciones;
