import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import { FaUserCircle } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

const Header = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  search = true
}) => {
  const [imgError, setImgError] = useState(false);
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));

  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  // Hook de notificaciones reales
  const { unreadCount: notificationCount, updateUnreadCount } = useNotifications(usuarioActual?.id);

  useEffect(() => {
    if (usuarioActual) {
      console.log('🔍 Header - Usuario actual completo:', usuarioActual);
      console.log('📸 Header - Foto de perfil:', usuarioActual.fotoPerfil);
      console.log('📸 Header - imagenPerfil:', usuarioActual.imagenPerfil);
      
      setIsLoggedIn(true);
      const primerNombre = usuarioActual.nombre?.split(" ")[0] || "";
      setNombreUsuario(primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1));
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/messages/unread/${usuarioActual.id}`)
        .then(r=>r.json()).then(d=>setUnread(d.total || 0)).catch(()=>{});
    } else {
      console.log('❌ Header - No hay usuario actual en localStorage');
    }
    setImgError(false); // reset imgError al cargar usuario
  }, [usuarioActual && usuarioActual.imagen]);

  // refrescar cada 30s
  useEffect(()=>{
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if(!usuario) return;
    const interval = setInterval(()=>{
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/messages/unread/${usuario.id}`)
        .then(r=>r.json()).then(d=>setUnread(d.total || 0)).catch(()=>{});
    }, 30000);
    window.refreshUnread = () => {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/messages/unread/${usuario.id}`)
        .then(r=>r.json()).then(d=>setUnread(d.total || 0)).catch(()=>{});
    };
    return ()=> { clearInterval(interval); delete window.refreshUnread; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("usuarioActual");
    setIsLoggedIn(false);
    window.location.href = "/"; // Fuerza recarga total para limpiar estado en memoria
  };

  return (
    <header className="bg-light border-bottom w-100" style={{ position: "relative", zIndex: 10 }}>
      <div className="container-fluid py-2 px-4">
        <div className="row align-items-center justify-content-between">
          <div className="col-md-3 d-flex align-items-center">
            <h2 className="mb-0 fw-bold brand-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <span className="logo-swap" style={{position:'relative',display:'inline-block'}}>
  Swap
  <span className="swap-icon-svg" style={{position:'absolute',top:'-18px',right:'-26px',width:'32px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M4 8h18.5l-3.5-3.5" stroke="#8f5be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 12H5.5l3.5 3.5" stroke="#1e3c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="8" r="2" fill="#8f5be8"/>
        <circle cx="24" cy="12" r="2" fill="#1e3c72"/>
      </g>
    </svg>
  </span>
</span>
              <span className="logo-web">Web</span>
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
              <>
                {/* Icono de notificaciones (campana) a la izquierda */}
                <div style={{marginRight:'1.2rem',position:'relative',cursor:'pointer',display:'flex',alignItems:'center'}}
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  title={notificationCount > 0 ? `Tienes ${notificationCount} notificaciones nuevas` : 'Notificaciones'}
                >
                  <IoMdNotificationsOutline size={25} color="#444" />
                  {notificationCount>0 && <span style={{position:'absolute',top:'-8px',right:'-8px',background:'#dc3545',color:'#fff',borderRadius:'50%',padding:'2.5px 7px',fontSize:'0.76rem',fontWeight:600}}>{notificationCount}</span>}
                  
                  {/* Dropdown de Notificaciones */}
                  <NotificationDropdown 
                    userId={usuarioActual?.id}
                    isOpen={notificationDropdownOpen}
                    onClose={() => setNotificationDropdownOpen(false)}
                  />
                </div>
                <span className="fw-semibold" style={{marginRight:'0.9rem'}}>
                  {location.pathname === "/" ? `Hola, ${nombreUsuario}` : nombreUsuario}
                </span>
              </>
            )}
            <button className="user-icon-button" onClick={() => setMenuOpen(!menuOpen)} style={{marginLeft:isLoggedIn ? 0 : '1.2rem',padding:0,background:'none',border:'none',display:'flex',alignItems:'center'}}>
              {usuarioActual && usuarioActual.imagen && usuarioActual.imagen !== '' && usuarioActual.imagen !== null && !imgError ? (
                <img
                  src={usuarioActual.imagen}
                  alt={`Foto de perfil de ${nombreUsuario || 'usuario'}`}
                  style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',border:'2px solid #eee'}}
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <FaUserCircle size={26} color="#555" />
              )}
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
                      className="dropdown-item user-menu-item"
                      onClick={() => {
                        navigate(`/perfil`);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">👤</span>
                      Mi Perfil
                    </button>
                    <button
                      className="dropdown-item user-menu-item"
                      onClick={() => {
                        navigate("/configuracion");
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">⚙️</span>
                      Configuración
                    </button>
                    <hr className="menu-divider" />
                    <button
                      className="dropdown-item user-menu-item logout-item"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">🚺</span>
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
