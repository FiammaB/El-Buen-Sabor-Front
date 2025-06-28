import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// Páginas públicas
import Landing from './components/Landing/Landing';
import CartPage from './components/Cart/CartPage/CartPage';
import Checkout from './components/checkout/Checkout';
import OrderConfirmationPage from './components/order-confirmation/OrderConfirmation';
import LoginPage from './components/Auth/components/Login-page.tsx';
import RegisterPage from './components/Auth/components/Register-page.tsx';
import ExplorarPage from './components/explore/explore-page';
import CategoriaInsumoPage from './components/Categoria/CategoriaInsumoPage.tsx';
import CategoriaManufacturadoPage from './components/Categoria/CategoriaManufacturadoPage.tsx';

// Admin
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';

// Dashboards
import ClienteDashboard from './components/Cliente/ClienteDashboard';
import AdminDashboard from './admin/compontents/AdminDeshboard.tsx';
import PedidosPage from "./components/Pedidos/PedidosPage.tsx";

// Contexto y rutas protegidas
import { AuthProvider } from './components/Auth/Context/AuthContext.tsx';
import ProtectedRoute from './components/Auth/ProtectedRouter.tsx';
import OrderFailed from './components/order-failed/OrderFailed';
import CompraIngredientesPage from "./components/CompraIngrediente/CompraIngredientesPage.tsx";

// Reportes y promociones
import PromocionCreatePage from "./components/promocion/PromocionCreatePage.tsx";
import ReporteClientesPage from "./components/Reportes/ReporteClientesPage.tsx";
import RankingProductosPage from "./components/RankingProductos/RankingProductosPage";
import PromocionPage from "./components/promocion/PromocionPage";
import PromocionForm from './components/promocion/PromocionForm';
import ReporteMonetarioPage from "./components/Reportes/ReporteMonetarioPage.tsx";

// Recuperación de contraseña
import RecoverPasswordForm from './components/Auth/components/RecoverPaswordForm.tsx';
import VerifyCodeForm from './components/Auth/components/VerifyCodeForm.tsx';
import ChangePasswordForm from './components/Auth/components/ChangePasswordForm.tsx';
import CocineroAdminLayout from "./components/Cocinero/CocineroAdminLayout.tsx";
import ProductDetailPage from "./components/Producto/Producto.tsx";
import ControlStockPage from "./components/ControlStock/ControlStockPage.tsx";
import CajeroAdminLayout from "./components/Cajero/CajeroAdminLayout.tsx";
import CajeroPedidosPage from "./components/Cajero/CajeroPedidosPage.tsx";

// ✅ Página de perfil
import PerfilPage from "./components/Auth/components/PerfilPage.tsx";
import DeliveryAdminLayout from "./components/Delivery/DeliveryAdminLayout.tsx";
import DeliveryPedidosPage from "./components/Delivery/DeliveryPedidosPage.tsx";
import VerPedidoPage from "./components/Delivery/VerPedidoPage.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/producto/:id" element={<ProductDetailPage />} />

          {/* Rutas públicas */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorarPage />} />

          {/* Reportes y promociones */}
          <Route path="/ranking" element={<RankingProductosPage />} />
          <Route path="/promociones" element={<PromocionPage />} />
          <Route path="/reporte-clientes" element={<ReporteClientesPage />} />
          <Route path="/reporte-monetario" element={<ReporteMonetarioPage />} />
          <Route path="/promociones/crear" element={
            <ProtectedRoute role="ADMINISTRADOR">
              <PromocionCreatePage />
            </ProtectedRoute>
          } />

          {/* Recuperación de contraseña */}
          <Route path="/recuperar" element={<RecoverPasswordForm />} />
          <Route path="/verificar-codigo" element={<VerifyCodeForm />} />
          <Route path="/cambiar-password" element={<ChangePasswordForm />} />

          {/* ✅ Ruta protegida para perfil */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO"]}>
                <PerfilPage />
              </ProtectedRoute>
            }
          />

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

          {/* Rutas MIXTAS */}
          <Route
            path="/compraIngredientes"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                <CompraIngredientesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categoriaInsumo"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                <CategoriaInsumoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categoriaManufacturado"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "COCINERO"]}>
                <CategoriaManufacturadoPage />
              </ProtectedRoute>
            }
          />

          {/* Layout COCINERO */}
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
            <Route path="Ingredientes" element={<Ingredientes />} />
            <Route path="compra-ingredientes" element={<CompraIngredientesPage />} />
            <Route path="categorias-insumo" element={<CategoriaInsumoPage />} />
            <Route path="categorias-manufacturado" element={<CategoriaManufacturadoPage />} />
            <Route path="control-stock" element={<ControlStockPage />} />
          </Route>

          {/* Layout CAJERO */}
          <Route
            path="/cajero"
            element={
              <ProtectedRoute role="CAJERO">
                <CajeroAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="caja" element={<CajeroPedidosPage />} />
          </Route>

            {/* Layout DELIVERY */}
            <Route
                path="/delivery"
                element={
                    <ProtectedRoute role="DELIVERY">
                        <DeliveryAdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="pedidos" element={<DeliveryPedidosPage />} />
                <Route path="pedido/:pedidoId" element={<VerPedidoPage />} />
            </Route>

          {/* Ruta por defecto */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
