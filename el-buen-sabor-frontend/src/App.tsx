// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// Páginas públicas
import Landing from './components/Landing/Landing';
import CartPage from './components/Cart/CartPage/CartPage';
import Checkout from './components/checkout/Checkout';
import OrderConfirmationPage from './components/order-confirmation/OrderConfirmation';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ExplorarPage from './components/explore/explore-page';

// Admin
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';

// Dashboards
import ClienteDashboard from './pages/auth/ClienteDashboard';
import AdminDashboard from './pages/auth/AdminDashboard';
import CocineroDashboard from "./pages/auth/CocineroDashboard";

// Contexto y rutas protegidas
import { AuthProvider } from './pages/auth/Context/AuthContext';
import ProtectedRoute from './pages/auth/ProtectedRoute';


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
          {/* Rutas COCINERO */}
          <Route
            path="/cocinero/dashboard"
            element={
              <ProtectedRoute role="COCINERO">
                <CocineroDashboard />
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