// src/App.tsx
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
import CategoriaInsumoPage from './components/Categoria/CategoriaInsumoPage.tsx';
import CategoriaManufacturadoPage from './components/Categoria/CategoriaManufacturadoPage.tsx';

// Admin
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';

// Dashboards
import ClienteDashboard from './pages/auth/ClienteDashboard';
import AdminDashboard from './pages/auth/AdminDashboard';
import PedidosPage from "./components/Pedidos/PedidosPage.tsx";
import CajeroDashboard from "./pages/auth/CajeroDashboard";

// Contexto y rutas protegidas
import { AuthProvider } from './pages/auth/Context/AuthContext';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import OrderFailed from './components/order-failed/OrderFailed';
import CompraIngredientesPage from "./components/CompraIngrediente/CompraIngredientesPage.tsx";

// Reportes y promociones
import ReporteClientesPage from "./pages/ReporteClientesPage";
import RankingProductosPage from "./components/RankingProductos/RankingProductosPage";
import PromocionPage from "./components/promocion/PromocionPage";
import PromocionForm from './components/promocion/PromocionForm';
import ReporteMonetarioPage from "./pages/ReporteMonetarioPage";

// Recuperación de contraseña
import RecoverPasswordForm from './pages/auth/RecoverPasswordForm';
import VerifyCodeForm from './pages/auth/VerifyCodeForm';
import ChangePasswordForm from './pages/auth/ChangePasswordForm';
import CocineroAdminLayout from "./components/Cocinero/CocineroAdminLayout.tsx";

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
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorarPage />} />
          <Route path="/promociones" element={<PromocionPage />} />
          
          {/* Rutas reportes y promos */}
          <Route path="/promociones/crear" element={<PromocionForm />} />
          <Route path="/ranking" element={<RankingProductosPage />} />
          <Route path="/reporte-clientes" element={<ReporteClientesPage />} />
          <Route path="/reporte-monetario" element={<ReporteMonetarioPage />} />

          {/* Recuperación de contraseña */}
          <Route path="/recuperar" element={<RecoverPasswordForm />} />
          <Route path="/verificar-codigo" element={<VerifyCodeForm />} />
          <Route path="/cambiar-password" element={<ChangePasswordForm />} />

          {/* Rutas ADMINISTRADOR */}
          <Route
            path="/admin/articulos"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                <ArticuloManufacturadoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ingredientes"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
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
            path="/pedidosPage"
            element={
              <ProtectedRoute role="COCINERO">
                <PedidosPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Rutas CAJERO (nuevo) */}
          <Route
            path="/cajero/dashboard"
            element={
              <ProtectedRoute role="CAJERO">
                <CajeroDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas MIXTAS */}
          <Route
              path="/compraIngredientes"
              element={
                  <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                      <CompraIngredientesPage/>
                  </ProtectedRoute>
              }
          />

            <Route
              path="/categoriaInsumo"
              element={
                  <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                      <CategoriaInsumoPage/>
                  </ProtectedRoute>
              }
            />

            <Route
                path="/categoriaManufacturado"
                element={
                    <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                        <CategoriaManufacturadoPage/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/cocinero"
                element={
                    <ProtectedRoute role="COCINERO">
                        <CocineroAdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="pedidos" element={<PedidosPage />} />
                <Route path="Productos" element={<ArticuloManufacturadoList />} />
                <Route path="Ingredientes" element={<Ingredientes/>} />
                <Route path="compra-ingredientes" element={<CompraIngredientesPage />} />
                <Route path="categorias-insumo" element={<CategoriaInsumoPage />} />
                <Route path="categorias-manufacturado" element={<CategoriaManufacturadoPage />} />
            </Route>

            {/* Ruta por defecto */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
