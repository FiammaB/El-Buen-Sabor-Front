import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from "./components/Cart/context/cart-context";
import { AuthProvider } from "./Context/AuthContext";
import axios from "axios"; // 👈 agregalo

axios.defaults.withCredentials = true; // 👈 habilitá envío de cookies/credenciales

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);