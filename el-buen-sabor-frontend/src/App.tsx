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

// Contexto y rutas protegidas
import { AuthProvider } from './components/Auth/Context/AuthContext.tsx';
import ProtectedRoute from './components/Auth/ProtectedRouter.tsx';
import OrderFailed from './components/order-failed/OrderFailed';

// Paneles y dashboards
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import AdminDashboard from "./admin/compontents/AdminDeshboard.tsx";
import ArticuloManufacturadoList from './admin/ArticuloManufacturado/ArticuloManufacturadoList';
import Ingredientes from './admin/pages/ingredientes';
import ReporteClientesPage from "./components/Reportes/ReporteClientesPage.tsx";
import RankingProductosPage from "./components/RankingProductos/RankingProductosPage";

import CocineroAdminLayout from "./components/Cocinero/CocineroAdminLayout.tsx";
import PedidosPage from "./components/Pedidos/PedidosPage.tsx";
import ControlStockPage from "./components/ControlStock/ControlStockPage.tsx";
import CategoriaInsumoPage from './components/Categoria/CategoriaInsumoPage.tsx';
import CategoriaManufacturadoPage from './components/Categoria/CategoriaManufacturadoPage.tsx';
import CompraIngredientesPage from "./components/CompraIngrediente/CompraIngredientesPage.tsx";

import CajeroAdminLayout from "./components/Cajero/CajeroAdminLayout.tsx";
import CajeroPedidosPage from "./components/Cajero/CajeroPedidosPage.tsx";

import DeliveryAdminLayout from "./components/Delivery/DeliveryAdminLayout.tsx";
import DeliveryPedidosPage from "./components/Delivery/DeliveryPedidosPage.tsx";
import VerPedidoPage from "./components/Delivery/VerPedidoPage.tsx";

// Perfil, promociones y recuperación
import PerfilPage from "./components/Auth/components/PerfilPage.tsx";
import PromocionPage from "./components/promocion/PromocionPage";
import PromocionCreatePage from "./components/promocion/PromocionCreatePage.tsx";
import RecoverPasswordForm from './components/Auth/components/RecoverPaswordForm.tsx';
import VerifyCodeForm from './components/Auth/components/VerifyCodeForm.tsx';
import ChangePasswordForm from './components/Auth/components/ChangePasswordForm.tsx';
import ProductDetailPage from "./components/Producto/Producto.tsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* PÚBLICAS */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/order-failed" element={<OrderFailed />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/explore" element={<ExplorarPage />} />
                    <Route path="/producto/:id" element={<ProductDetailPage />} />

                    {/* Promos, reportes, etc (solo públicas o protegidas si lo querés así) */}
                    <Route path="/promociones" element={<PromocionPage />} />
                    <Route path="/promociones/crear" element={
                        <ProtectedRoute role="ADMINISTRADOR">
                            <PromocionCreatePage />
                        </ProtectedRoute>
                    } />

                    {/* Recuperación de contraseña */}
                    <Route path="/recuperar" element={<RecoverPasswordForm />} />
                    <Route path="/verificar-codigo" element={<VerifyCodeForm />} />
                    <Route path="/cambiar-password" element={<ChangePasswordForm />} />

                    {/* PERFIL */}
                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute role={["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO"]}>
                                <PerfilPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ADMINISTRADOR */}
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
                        <Route path="ranking" element={<RankingProductosPage />} />
                        <Route path="reporte-clientes" element={<ReporteClientesPage />} />

                    </Route>

                    {/* COCINERO */}
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
                        <Route path="compra-ingredientes" element={<CompraIngredientesPage />} />
                        <Route path="categorias-insumo" element={<CategoriaInsumoPage />} />
                        <Route path="categorias-manufacturado" element={<CategoriaManufacturadoPage />} />
                        <Route path="control-stock" element={<ControlStockPage />} />
                    </Route>

                    {/* CAJERO */}
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

                    {/* DELIVERY */}
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

                    <Route path="*" element={<Landing />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
