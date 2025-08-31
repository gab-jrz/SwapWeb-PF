import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import DetalleProducto from './Pages/DetalleProducto';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Intercambiar from './Pages/Intercambiar';
import PerfilUsuario from './Pages/PerfilUsuario';
import Calificaciones from './Pages/Calificaciones';
import PerfilPublico from './Pages/PerfilPublico';
import Editar from './Pages/Editar';
import Configuracion from './Pages/Configuracion';
import PublicarProducto from './Pages/PublicarProducto';
import EditarProducto from './Pages/EditarProducto';
import Favoritos from './Pages/Favoritos';
import ProtectedRoute from './Component/ProtectedRoute';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import ComoFunciona from './Pages/ComoFunciona';
import SobreNosotros from './Pages/SobreNosotros';
import Privacidad from './Pages/Privacidad';
import DonationsList from './Pages/DonationsList';
import DonationCreate from './Pages/DonationCreateNew';
import DonationDetail from './Pages/DonationDetail';
import ContactarDonador from './Pages/ContactarDonador';
import EditarDonacion from './Pages/EditarDonacion';
import RequestsList from './Pages/RequestsList';
import RequestCreate from './Pages/RequestCreateNew';
import RequestDetail from './Pages/RequestDetail';
import EditarSolicitud from './Pages/EditarSolicitud';
import Contactanos from './Pages/Contactanos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Páginas informativas */}
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />

        <Route path="/privacidad" element={<Privacidad />} />
        {/* Alias antiguo para publicar */}
        <Route path="/publicar" element={<Navigate to="/publicarproducto" replace />} />
        <Route path="/categorias" element={<Navigate to="/" replace />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/intercambiar" element={<ProtectedRoute><Intercambiar /></ProtectedRoute>} />
        <Route path="/editar" element={<Editar />} />

        <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
        <Route path="/perfil/:id" element={<PerfilPublico />} />
        <Route path="/perfil-publico/:id" element={<PerfilPublico />} />
        <Route path="/calificaciones/:id" element={<Calificaciones />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/publicarproducto" element={
          <ProtectedRoute>
            <PublicarProducto />
          </ProtectedRoute>
        } />

        {/* Favoritos */}
        <Route path="/favoritos" element={<Favoritos />} />

        {/* Rutas Donaciones y Solicitudes */}
        <Route path="/donaciones" element={<DonationsList />} />
        <Route path="/donaciones/publicar" element={<DonationCreate />} />
        <Route path="/donaciones/:id" element={<DonationDetail />} />
        <Route path="/donaciones/:id/contactar" element={<ProtectedRoute><ContactarDonador /></ProtectedRoute>} />
        <Route path="/donation-edit/:id" element={<ProtectedRoute><EditarDonacion /></ProtectedRoute>} />
        <Route path="/donaciones/solicitudes" element={<RequestsList />} />
        <Route path="/donaciones/solicitar" element={<RequestCreate />} />
        <Route path="/donaciones/solicitudes/:id" element={<RequestDetail />} />
        <Route path="/request-edit/:id" element={<ProtectedRoute><EditarSolicitud /></ProtectedRoute>} />
        
        <Route path="/editar-producto/:id" element={
         <ProtectedRoute>
            <EditarProducto />
         </ProtectedRoute>
        } />
        <Route path="/contactanos" element={<Contactanos />} />
      </Routes>
    </Router>
  );
}

export default App;
