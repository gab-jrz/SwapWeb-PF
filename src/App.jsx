import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import DetalleProducto from './Pages/DetalleProducto';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Intercambiar from './Pages/Intercambiar';
import PerfilUsuario from './Pages/PerfilUsuario';
import Editar from './Pages/Editar';
import Configuracion from './Pages/Configuracion';
import PublicarProducto from './Pages/PublicarProducto';
import EditarProducto from './Pages/EditarProducto';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/intercambiar" element={<Intercambiar />} />
        <Route path="/editar" element={<Editar />} />

        <Route path="/perfil/:id" element={<PerfilUsuario />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/publicarproducto" element={<PublicarProducto />} />
        <Route path="/editar-producto/:id" element={<EditarProducto />} />
      </Routes>
    </Router>
  );
}

export default App;
