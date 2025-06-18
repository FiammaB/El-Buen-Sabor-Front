import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ArticuloManufacturadoList from './components/ArticuloManufacturado/ArticuloManufacturadoList';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ClienteDashboard from './components/ClienteDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ArticuloManufacturadoList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/cliente" element={
        <ProtectedRoute role="CLIENTE">
          <ClienteDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute role="ADMINISTRADOR">
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
