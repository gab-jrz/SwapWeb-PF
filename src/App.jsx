import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import DetalleProducto from './Pages/DetalleProducto';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Intercambiar from './Pages/Intercambiar';
import Transacciones from './Pages/Transacciones';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/intercambiar" element={<Intercambiar />} />
        <Route path="/transacciones" element={<Transacciones />} />
      </Routes>
    </Router>
  );
}

export default App;
