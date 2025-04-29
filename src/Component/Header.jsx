import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(storedLogin === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="bg-light border-bottom w-100" style={{ position: "relative", zIndex: 10 }}>
      <div className="container-fluid py-2 px-4">
        <div className="row align-items-center justify-content-between">
          <div className="col-md-3 d-flex align-items-center">
            <h2 className="mb-0 fw-bold">
              <span style={{ color: "#00c853" }}>Swap</span>
              <span style={{ color: "#00bcd4" }}>Web</span>
            </h2>
          </div>

          <div className="col-md-6">
            <div className="d-flex flex-column align-items-center">
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar productos, marcas y más..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button">
                  🔍
                </button>
              </div>
              <select className="form-select w-100" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Categorías</option>
                <option value="tecnologia">Tecnología</option>
                <option value="electrodomesticos">Electrodomésticos</option>
                <option value="ropa">Ropa</option>
              </select>
            </div>
          </div>

          <div className="col-md-3 d-flex justify-content-end position-relative">
            <button className="btn btn-outline-secondary" onClick={() => setMenuOpen(!menuOpen)}>
              ☰ Menú
            </button>

            {menuOpen && (
              <div className="dropdown-menu d-block position-absolute top-100 end-0 mt-2 p-2 shadow bg-white rounded" style={{ zIndex: 999 }}>
                {!isLoggedIn ? (
                  <>
                    <button className="dropdown-item" onClick={() => { navigate("/register"); setMenuOpen(false); }}>
                      Crear cuenta
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                      Ingresar
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => { navigate("/transacciones"); setMenuOpen(false); }}>
                      Mis transacciones
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate("/intercambiar"); setMenuOpen(false); }}>
                      Intercambiar producto
                    </button>
                    <hr />
                    <button className="dropdown-item text-danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
