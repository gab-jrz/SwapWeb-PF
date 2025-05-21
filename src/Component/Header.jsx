import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { FaUserCircle } from "react-icons/fa";

const Header = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  search = true
}) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuario) {
      setIsLoggedIn(true);
      const primerNombre = usuario.nombre?.split(" ")[0] || "";
      setNombreUsuario(primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("usuarioActual");
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

          {search && (
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
                </div>
                <select
                  className="form-select w-100"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">---Seleccione una Categoria---</option>
                  <option value="tecnologia">Tecnología</option>
                  <option value="electrodomesticos">Electrodomésticos</option>
                  <option value="ropa">Ropa</option>
                  <option value="">Otros</option>
                </select>
              </div>
            </div>
          )}

          <div className="col-md-3 d-flex justify-content-end align-items-center position-relative">
            {isLoggedIn && (
              <span className="me-2 fw-semibold">Hola, {nombreUsuario}</span>
            )}
            <button className="user-icon-button" onClick={() => setMenuOpen(!menuOpen)}>
              <FaUserCircle size={24} />
            </button>

            {menuOpen && (
              <div className="dropdown-menu d-block position-absolute top-100 user-dropdown" style={{ zIndex: 999 }}>
                {!isLoggedIn ? (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/register");
                        setMenuOpen(false);
                      }}
                    >
                      Crear cuenta
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/login");
                        setMenuOpen(false);
                      }}
                    >
                      Ingresar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        const usuario = JSON.parse(localStorage.getItem("usuarioActual"));
                        if (usuario && usuario.id) {
                          navigate(`/perfil/${usuario.id}`);
                        }
                        setMenuOpen(false);
                      }}
                    >
                      Mi Perfil
                    </button>

                    {/* <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/intercambiar");
                        setMenuOpen(false);
                      }}
                    >
                      Intercambiar producto
                    </button> */}
                    <hr />
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
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
