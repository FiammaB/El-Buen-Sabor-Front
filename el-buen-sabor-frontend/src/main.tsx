import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CartProvider } from "./components/Cart/context/cart-context";
import { AuthProvider } from "./context/AuthContext"; // 👈 importamos el nuevo context

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* 👈 envolvemos la app con el AuthProvider */}
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
