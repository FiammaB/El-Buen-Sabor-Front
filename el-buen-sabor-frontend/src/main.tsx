import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from "./components/Cart/context/cart-context";
import { AuthProvider } from "./components/Auth/Context/AuthContext";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google"; // 👉 Importamos el proveedor de Google

// Configuración global para permitir envío de cookies o headers con credenciales
axios.defaults.withCredentials = true;

// Tu Client ID de Google (podés guardarlo en .env más adelante si querés)
const GOOGLE_CLIENT_ID = "69075773198-5joq80nrsujctfiqjeap2lc9bhe7ot2q.apps.googleusercontent.com";

// Envolvemos todo dentro de GoogleOAuthProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
