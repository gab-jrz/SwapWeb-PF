import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import { FaUserCircle } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useNotifications } from "../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";
import { categorias } from "../categorias";



const Header = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  advancedFiltersOpen,
  setAdvancedFiltersOpen,
  search = true,
  isHome
}) => {
  const [imgError, setImgError] = useState(false);
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = typeof isHome === 'boolean' ? isHome : (location.pathname === '/' || location.pathname === '/home');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  // Hook de notificaciones reales
  const { unreadCount: notificationCount, updateUnreadCount } = useNotifications(usuarioActual?.id);

// Si se quieren íconos, se pueden mapear por nombre o index, pero la lista oficial es la de categorias.

  useEffect(() => {
    if (usuarioActual) {
      console.log('🔍 Header - Usuario actual completo:', usuarioActual);

      
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

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.position-relative')) {
        setCategoryMenuOpen(false);
        setMenuOpen(false);
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <>
      <header className="bg-light border-bottom w-100" style={{ position: "relative", zIndex: 10 }}>
        <div className="container-fluid py-2 px-4">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-3 d-flex align-items-center">
              <h2 
                className="brand-logo-custom" 
                onClick={() => navigate("/")} 
                style={{ 
                  cursor: "pointer",
                  fontFamily: "'Poppins', 'Roboto', sans-serif !important",
                  fontWeight: "700 !important",
                  fontSize: "2.6rem !important",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex !important",
                  alignItems: "baseline",
                  gap: "0",
                  margin: "0 !important",
                  padding: "0 !important",
                  border: "none !important",
                  background: "none !important",
                  lineHeight: "1 !important"
                }}
              >
                <span 
                  className="logo-swap"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: "800",
                    fontSize: "2.3rem",
                    letterSpacing: "-0.8px",
                    display: "inline-block",
                    fontFamily: "'Poppins', sans-serif",
                    filter: "drop-shadow(0 2px 4px rgba(139, 92, 246, 0.15))"
                  }}
                >
                  Swap
                </span>
                <span 
                  className="logo-web"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0ea5e9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: "800",
                    fontSize: "2.8rem",
                    letterSpacing: "-0.5px",
                    fontFamily: "'Poppins', sans-serif",
                    marginLeft: "0",
                    filter: "drop-shadow(0 2px 4px rgba(79, 70, 229, 0.15))",
                    lineHeight: "1",
                    verticalAlign: "baseline"
                  }}
                >Web</span>
              </h2>
            </div>
            {search && isHomePage && (
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center">
                  {/* Buscador Premium Mejorado */}
                  <div className="search-container-premium-v2">
                    <div className="search-input-wrapper-v2">
                      <div className="search-icon-container">
                        <svg className="search-icon-v2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="search-input-premium-v2"
                        placeholder="Buscar productos, marcas y más..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="search-divider"></div>
                      <button
                        className="btn-filters-premium-v2"
                        onClick={() => setAdvancedFiltersOpen && setAdvancedFiltersOpen(!advancedFiltersOpen)}
                        title="Filtros avanzados"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0",
                          background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "0 25px 25px 0",
                          cursor: "pointer",
                          width: "52px",
                          height: "48px",
                          flexShrink: "0"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div className="col-md-3 d-flex justify-content-end align-items-center position-relative">
            {isLoggedIn && (
              <div className="header-user-section">
                {/* Icono de notificaciones moderno */}
                <div 
                  className="notification-icon-container"
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  title={notificationCount > 0 ? `Tienes ${notificationCount} notificaciones nuevas` : 'Notificaciones'}
                  style={{
                    display: "flex !important",
                    alignItems: "center !important",
                    justifyContent: "center !important",
                    width: "52px !important",
                    height: "52px !important",
                    borderRadius: "26px !important",
                    backgroundColor: "white !important",
                    border: "2px solid #7b2ff2 !important",
                    boxShadow: "0 4px 12px rgba(123, 47, 242, 0.15) !important",
                    cursor: "pointer !important",
                    transition: "all 0.3s ease !important",
                    position: "relative !important",
                    minWidth: "52px !important",
                    minHeight: "52px !important",
                    maxWidth: "52px !important",
                    maxHeight: "52px !important"
                  }}
                >
                  <svg 
                    className="notification-icon" 
                    width="26" 
                    height="26" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    style={{
                      display: "block !important",
                      margin: "0 auto !important",
                      position: "relative !important",
                      color: "#7b2ff2 !important"
                    }}
                  >
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                  
                  {/* Dropdown de Notificaciones */}
                  <NotificationDropdown 
                    userId={usuarioActual?.id}
                    isOpen={notificationDropdownOpen}
                    onClose={() => setNotificationDropdownOpen(false)}
                  />
                </div>
                
                {/* Sección de usuario con avatar y texto */}
                <div className="user-profile-section" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="user-avatar-container">
                    {(() => {
                      const imgSrc = usuarioActual?.imagen || '/images/fotoperfil.jpg';
                      return (usuarioActual && imgSrc && !imgError) ? (
                        <img
                          src={imgSrc.startsWith('data:') || imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `/images/${imgSrc}`}
                          alt={`Foto de perfil de ${nombreUsuario || 'usuario'}`}
                          className="user-avatar-premium"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="user-avatar-fallback">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="user-info-text">
                    <span className="user-greeting">
                      {location.pathname === "/" ? "Hola," : ""}
                    </span>
                    <span className="user-name">{nombreUsuario}</span>
                  </div>
                  <svg className="user-dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}
            
            {!isLoggedIn && (
              <button className="user-icon-button" onClick={() => setMenuOpen(!menuOpen)}>
                <FaUserCircle size={28} color="#bcbcbc" />
              </button>
            )}

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
                        navigate(`/perfil`, { state: { activeTab: 'mensajes' } });
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">💬</span>
                      Mis Mensajes
                    </button>
                    <button
                      className="dropdown-item user-menu-item"
                      onClick={() => {
                        navigate(`/perfil`, { state: { activeTab: 'favoritos' } });
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">❤️</span>
                      Favoritos
                    </button>
                    <button
                      className="dropdown-item user-menu-item"
                      onClick={() => {
                        navigate(`/perfil`, { state: { activeTab: 'articulos' } });
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">📦</span>
                      Publicar un Producto
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
      
      {/* Barra horizontal de categorías debajo del header - solo en página principal */}
      {search && isHomePage && (
        <div className="categories-bar-horizontal">
          <div className="container-fluid px-4">
            <button
              className="btn-categories-horizontal d-flex align-items-center gap-2 w-100"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
            >
              <div className="menu-icon-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="categories-text">Todas las categorías</span>
              <svg 
                className="dropdown-arrow" 
                width="12" 
                height="8" 
                viewBox="0 0 12 8" 
                fill="none" 
                style={{ transform: categoryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {categoryMenuOpen && (
              <>
                {/* Overlay oscuro */}
                <div 
                  className="categories-overlay"
                  onClick={() => setCategoryMenuOpen(false)}
                ></div>
                
                {/* Panel lateral de categorías */}
                <div className="categories-sidebar">
                  <div className="categories-header">
                    <h3 className="categories-title">Categorías</h3>
                    <button 
                      className="categories-close-btn"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="categories-list">
                    {categories.map((category) => (
                      <div key={category.id} className="category-item">
                        <button
                          className="category-button"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setCategoryMenuOpen(false);
                          }}
                        >
                          <span className="category-icon">{category.icon}</span>
                          <span className="category-name">{category.name}</span>
                          <svg className="category-expand" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <div className="category-divider"></div>
                    
                    <div className="category-item">
                      <button
                        className="category-button category-all"
                        onClick={() => {
                          setSelectedCategory('');
                          setCategoryMenuOpen(false);
                        }}
                      >
                        <span className="category-icon">🔄</span>
                        <span className="category-name">Ver todas las categorías</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
