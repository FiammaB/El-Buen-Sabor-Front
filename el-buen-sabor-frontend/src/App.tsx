// src/App.tsx
import React from 'react';
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import './App.css'; // Si tienes estilos globales
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Ingredientes from './admin/pages/ingredientes';
import Landing from './components/Landing/Landing';
import CartPage from './pages/cart/CartPage';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmationPage from './pages/order-confirmation/OrderConfirmation';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ExplorarPage from './pages/explore/explore-page';
import PromocionPage from "./pages/PromocionPage";
import PromocionForm from './components/promocion/PromocionForm';
import RankingProductosPage from "./pages/RankingProductosPage";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/" element={<ArticuloManufacturadoList />} />
        <Route path="/admin/pages/ingredientes" element={<Ingredientes />} />
        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Explore */}
        <Route path="/explore" element={<ExplorarPage />} />
        <Route path="/promociones" element={<PromocionPage />} />
        <Route path="/promociones/crear" element={<PromocionForm />} />
        <Route path="/ranking" element={<RankingProductosPage />} />

      </Routes>
    </Router>
  );
}

export default App;