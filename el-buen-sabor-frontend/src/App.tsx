import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// 🌐 Páginas públicas
import Landing from './components/Landing/Landing';
import CartPage from './components/Cart/CartPage/CartPage';
import Checkout from './components/checkout/Checkout';
import OrderConfirmationPage from './components/order-confirmation/OrderConfirmation';
import OrderFailed from './components/order-failed/OrderFailed';
import ProductDetailPage from "./components/Producto/Producto.tsx";
import ExplorarPage from './components/explore/explore-page';

// 🔐 Autenticación
import LoginPage from './components/Auth/components/Login-page.tsx';
import RegisterPage from './components/Auth/components/Register-page.tsx';
import RecoverPasswordForm from './components/Auth/components/RecoverPaswordForm.tsx';
import VerifyCodeForm from './components/Auth/components/VerifyCodeForm.tsx';
import ChangePasswordForm from './components/Auth/components/ChangePasswordForm.tsx';

// 👤 Perfil
import PerfilPage from "./components/Auth/components/PerfilPage.tsx";

// 📦 AuthContext y rutas protegidas
import { AuthProvider } from './components/Auth/Context/AuthContext.tsx';
import ProtectedRoute from './components/Auth/ProtectedRouter.tsx';

// 🎁 Promociones y Reportes
import PromocionList from './components/promocion/PromocionList';
import PromocionForm from './components/promocion/PromocionForm';


import ReporteClientesPage from "./components/Reportes/ReporteClientesPage.tsx";
import RankingProductosPage from "./components/RankingProductos/RankingProductosPage";
import AdminClientePedidosPage from './components/Admin/AdminClientePedidosPages'; // <-- NUEVO: Importa este componente

// 👑 Panel Administrador
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import AdminDashboard from "./admin/compontents/AdminDeshboard.tsx";
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';
import CategoriaInsumoPage from './components/Categoria/CategoriaInsumoPage.tsx';
import CategoriaManufacturadoPage from './components/Categoria/CategoriaManufacturadoPage.tsx';
import CompraIngredientesPage from "./components/CompraIngrediente/CompraIngredientesPage.tsx";
import ControlStockPage from "./components/ControlStock/ControlStockPage.tsx";
import ReporteMonetarioPage from "./components/Reportes/ReporteMonetarioPage.tsx";

// 👨‍🍳 Panel Cocinero
import CocineroAdminLayout from "./components/Cocinero/CocineroAdminLayout.tsx";
import PedidosPage from "./components/Pedidos/PedidosPage.tsx";

// 💵 Panel Cajero
import CajeroAdminLayout from "./components/Cajero/CajeroAdminLayout.tsx";
import CajeroPedidosPage from "./components/Cajero/CajeroPedidosPage.tsx";

// 🚚 Panel Delivery
import DeliveryAdminLayout from "./components/Delivery/DeliveryAdminLayout.tsx";
import DeliveryPedidosPage from "./components/Delivery/DeliveryPedidosPage.tsx";
import VerPedidoPage from "./components/Delivery/VerPedidoPage.tsx";
// 📦 Pedidos del Cliente
import HistorialPedidos from './components/Cliente/HistorialPedidos.tsx';
import PedidoDetalle from './components/Pedidos/PedidoDetalle.tsx';
import ClienteListPage from "./components/Admin/ClienteListPage.tsx";
import EmpleadoListPage from "./components/Admin/EmpleadoListPage.tsx";
import ClienteAdminLayout from "./components/Cliente/ClienteAdminLayout.tsx";
import ClientePerfilPage from "./components/Cliente/ClientePerfilPage.tsx";



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* 🌍 RUTAS PÚBLICAS */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/explore" element={<ExplorarPage />} />
          <Route path="/promociones" element={<PromocionList />} />

          {/* 🔐 LOGIN / REGISTER */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 🔑 RECUPERAR CONTRASEÑA */}
          <Route path="/recuperar" element={<RecoverPasswordForm />} />
          <Route path="/verificar-codigo" element={<VerifyCodeForm />} />
          <Route path="/cambiar-password" element={<ChangePasswordForm />} />


          {/* 🧑 PERFIL MULTIROL */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute role={["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO"]}>
                <PerfilPage />
              </ProtectedRoute>
            }
          />
          {/* ✅ RUTAS PARA EL HISTORIAL DE PEDIDOS DEL CLIENTE (Solo Cliente) */}
          <Route
            path="/historial-pedidos"
            element={
              <ProtectedRoute role="CLIENTE">
                <HistorialPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial-pedidos/:id"
            element={
              <ProtectedRoute role="CLIENTE">
                <PedidoDetalle />
              </ProtectedRoute>
            }
          />




          {/* 👑 PANEL ADMINISTRADOR */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMINISTRADOR">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="articulos" element={<ArticuloManufacturadoList />} />
            <Route path="ingredientes" element={<Ingredientes />} />
            <Route path="categorias-insumo" element={<CategoriaInsumoPage />} />
            <Route path="categorias-manufacturado" element={<CategoriaManufacturadoPage />} />
            <Route path="compra-ingredientes" element={<CompraIngredientesPage />} />
            <Route path="control-stock" element={<ControlStockPage />} />
            <Route path="ranking-productos" element={<RankingProductosPage />} />
            <Route path="ranking-clientes" element={<ReporteClientesPage />} />
            <Route path="clientes" element={<ClienteListPage />} />
            <Route path="movimientos-monetarios" element={<ReporteMonetarioPage />} />
            <Route path="empleados" element={<EmpleadoListPage />} />

            {/* <-- CAMBIO CLAVE AQUÍ: RUTA PARA VER TODOS LOS PEDIDOS DE UN CLIENTE (ADMIN) */}
            <Route path="clientes/:clienteId/pedidos" element={<AdminClientePedidosPage />} />

            {/* <-- CAMBIO CLAVE AQUÍ: RUTA PARA VER EL DETALLE DE UN PEDIDO (ADMIN) */}
            <Route path="pedidos/:id" element={<PedidoDetalle />} />
            <Route path="/admin/promociones" element={<PromocionList />} />
            <Route
              path="/admin/promociones/new" element={<PromocionForm />} />
            <Route
              path="/admin/promociones/edit/:id" element={<PromocionForm />} />
          </Route>

          {/* ✅ NUEVA RUTA: REGISTRO DE EMPLEADOS */}
          <Route
            path="/admin/registrar-empleado"
            element={
              <ProtectedRoute role="ADMINISTRADOR">
                <RegisterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente"
            element={
              <ProtectedRoute role="CLIENTE">
                <ClienteAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="perfil" element={<ClientePerfilPage />} />
            <Route path="pedidos" element={<HistorialPedidos />} />
            <Route path="pedidos/:id" element={<PedidoDetalle />} />
            {/* Si sumás más páginas, agregalas acá */}
          </Route>


          {/* 👨‍🍳 PANEL COCINERO */}
          <Route
            path="/cocinero"
            element={
              <ProtectedRoute role="COCINERO">
                <CocineroAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="pedidos" element={<PedidosPage />} />
            <Route path="productos" element={<ArticuloManufacturadoList />} />
            <Route path="ingredientes" element={<Ingredientes />} />
            <Route path="categorias-insumo" element={<CategoriaInsumoPage />} />
            <Route path="categorias-manufacturado" element={<CategoriaManufacturadoPage />} />
            <Route path="compra-ingredientes" element={<CompraIngredientesPage />} />
            <Route path="control-stock" element={<ControlStockPage />} />
          </Route>

          {/* 💵 PANEL CAJERO */}
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

          {/* 🚚 PANEL DELIVERY */}
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

          {/* 🚧 RUTA CUALQUIERA: fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;