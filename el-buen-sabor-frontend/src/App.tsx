// src/App.tsx
import React from 'react';
<<<<<<< HEAD
import ArticuloManufacturadoList from './components/ArticuloManufacturado/ArticuloManufacturadoList';
import './App.css'; // Si tienes estilos globales

function App() {
  return (
    <div className="App">
      <ArticuloManufacturadoList />
    </div>
  );
}

export default App;
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// Páginas públicas
import Landing from './components/Landing/Landing';
import CartPage from './pages/cart/CartPage';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmationPage from './pages/order-confirmation/OrderConfirmation';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ExplorarPage from './pages/explore/explore-page';

// Admin
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';

// Dashboards
import ClienteDashboard from './pages/auth/ClienteDashboard';
import AdminDashboard from './pages/auth/AdminDashboard';

// Contexto y rutas protegidas
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorarPage />} />

          {/* Rutas ADMINISTRADOR */}
          <Route
            path="/admin/articulos"
            element={
              <ProtectedRoute role="ADMINISTRADOR">
                <ArticuloManufacturadoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ingredientes"
            element={
              <ProtectedRoute role="ADMINISTRADOR">
                <Ingredientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMINISTRADOR">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas CLIENTE */}
          <Route
            path="/cliente/dashboard"
            element={
              <ProtectedRoute role="CLIENTE">
                <ClienteDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
>>>>>>> login-con-roles
