import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './Component/ProtectedRoute';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';

import DonationsList from './Pages/DonationsList';
import DonationCreate from './Pages/DonationCreateNew';
import DonationDetail from './Pages/DonationDetail';
import ContactarDonador from './Pages/ContactarDonador';
import EditarDonacion from './Pages/EditarDonacion';
import RequestsList from './Pages/RequestsList';
import RequestCreate from './Pages/RequestCreateNew';
import RequestDetail from './Pages/RequestDetail';
import EditarSolicitud from './Pages/EditarSolicitud';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/intercambiar" element={<ProtectedRoute><Intercambiar /></ProtectedRoute>} />
        <Route path="/editar" element={<Editar />} />

        <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
        <Route path="/perfil/:id" element={<PerfilPublico />} />
        <Route path="/calificaciones/:id" element={<Calificaciones />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/publicarproducto" element={
          <ProtectedRoute>
            <PublicarProducto />
          </ProtectedRoute>
        } />

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
      </Routes>
    </Router>
  );
}

export default App;

