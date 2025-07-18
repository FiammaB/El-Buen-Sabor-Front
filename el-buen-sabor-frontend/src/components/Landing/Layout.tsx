
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; //'Link' is declared but its value is never read
import { useAuth } from '../../components/Auth/Context/AuthContext'; // Ajusta la ruta si es necesario
import { useCart } from '../../components/Cart/context/cart-context'; // Ajusta la ruta si es necesario
import { Truck, CreditCard, Menu, X, ShoppingCart } from 'lucide-react';//'ShoppingBag' is declared but its value is never read
import { ArticuloService } from '../../services/ArticuloService';
import type { Articulo } from '../../models/Articulos/Articulo';

// El componente Layout
export default function Layout() {

    const { role, logout, username } = useAuth();//id' is declared but its value is never read
    const navigate = useNavigate();
    const { totalItems } = useCart();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [headerSearch, setHeaderSearch] = useState<string>("");
    const [showHeaderSuggestions, setShowHeaderSuggestions] = useState<boolean>(false);

    // Lógica para el buscador del header que movimos de Landing
    const [articulos, setArticulos] = useState<Articulo[]>([]);
    const articuloService = new ArticuloService();

    useEffect(() => {
        const fetchArticulos = async () => {
            try {
                const manufacturedData = await articuloService.findAllArticulosManufacturadosActivos();
                const insumoData = await articuloService.findAllArticulosInsumoActivos();
                setArticulos([...manufacturedData, ...insumoData]);
            } catch (err) {
                console.error('Error al cargar artículos para el header:', err);
            }
        };
        fetchArticulos();
    }, []);

    const articulosFiltradosHeader = articulos.filter(a => {
        return headerSearch
            ? a.denominacion?.toLowerCase().includes(headerSearch.toLowerCase())
            : false;
    });

    return (
        <div className="min-h-screen bg-white ebs-landing">

            {/* Take to cart si tiene algo (esto es global) */}
            {totalItems > 0 && (
                <a href="/cart" className="text-white fixed bottom-[20px] right-[20px] rounded-full font-bold bg-green-400 p-6 z-50 text-white">
                    <ShoppingCart className="w-10 h-10" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {totalItems}
                    </span>
                </a>
            )}


            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-orange-500">
                                El Buen Sabor
                            </Link>
                        </div>
                        {/* Desktop Search Bar (Header) */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    value={headerSearch}
                                    onFocus={() => setShowHeaderSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowHeaderSuggestions(false), 150)}
                                    onChange={e => setHeaderSearch(e.target.value)}
                                    placeholder="Buscar productos..."
                                    className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition w-full"
                                />
                                {/* Dropdown de sugerencias */}
                                {showHeaderSuggestions && headerSearch && articulosFiltradosHeader.length > 0 && (
                                    <div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                                        {articulosFiltradosHeader.slice(0, 6).map(a => (
                                            <div
                                                key={a.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-orange-100 flex items-center"
                                                onMouseDown={() => {
                                                    navigate(`/producto/${a.id}`);
                                                    setShowHeaderSuggestions(false);
                                                    setHeaderSearch('');
                                                }}
                                            >
                                                <img
                                                    src={a.imagen?.denominacion || "/placeholder.svg"}
                                                    alt={a.denominacion}
                                                    className="w-8 h-8 rounded mr-3 object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium">{a.denominacion}</div>
                                                    <div className="text-xs text-gray-500">${a.precioVenta?.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {articulosFiltradosHeader.length > 6 && (
                                            <div className="px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-orange-50"
                                                onMouseDown={() => {
                                                    navigate(`/explore?search=${encodeURIComponent(headerSearch)}`);
                                                    setShowHeaderSuggestions(false);
                                                    setHeaderSearch('');
                                                }}>
                                                Ver todos los resultados...
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Si no hay resultados */}
                                {showHeaderSuggestions && headerSearch && articulosFiltradosHeader.length === 0 && (
                                    <div className="absolute left-0 top-12 w-full bg-white border rounded-xl shadow-lg z-50 p-4 text-gray-500">
                                        No se encontraron productos.
                                    </div>
                                )}
                            </div>
                        </nav>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-orange-500 transition duration-200">
                                Inicio
                            </Link>

                        </nav>
                        {/* Botones para usuarios no logueados */}
                        {!role && (
                            <div className="hidden md:flex items-center space-x-4">
                                <a
                                    href="/login"
                                    className="text-gray-700 hover:text-orange-500 transition duration-200 font-medium"
                                >
                                    Iniciar Sesión
                                </a>
                                <a
                                    href="/register"
                                    className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition duration-200 font-medium"
                                >
                                    Registrarse
                                </a>
                            </div>
                        )}
                        {/*LOGIN Y REGISTRO*/}

                        {role === "ADMINISTRADOR" && (
                            <div className="flex items-center space-x-4">
                                <span className="text-indigo-700 font-bold">Admin: {username}</span>
                                <a
                                    href="/admin/dashboard"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                                >
                                    Panel Admin
                                </a>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}


                        {role === "CAJERO" && (
                            <div className="flex items-center space-x-4">
                                <span className="text-purple-700 font-bold">Cajero: {username}</span>
                                <a
                                    href="/cajero/caja"
                                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                                >
                                    Caja
                                </a>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}

                        {role === "COCINERO" && (
                            <div className="flex items-center space-x-4">
                                <span className="text-green-700 font-bold">Cocinero: {username}</span>
                                <a
                                    href="/cocinero/pedidos"
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                >
                                    Cocina
                                </a>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}

                        {role === "CLIENTE" && (
                            <div className="flex items-center space-x-4">
                                <span className="text-orange-700 font-bold">{username}</span>
                                <button
                                    onClick={() => navigate("/cliente")}
                                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                                >
                                    Mi Cuenta
                                </button>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}

                        {role === "DELIVERY" && (
                            <div className="flex items-center space-x-4">
                                <span className="text-blue-700 font-bold">Delivery: {username}</span>
                                <a
                                    href="/delivery/pedidos"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Pedidos
                                </a>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col space-y-4">
                                <a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Inicio</a>

                                <a href="#" className="text-gray-700 hover:text-orange-500 transition duration-200">Promociones</a>

                                <div className="flex flex-col space-y-2 pt-4 border-t">
                                    <button className="text-gray-700 hover:text-orange-500 transition duration-200 font-medium text-left">
                                        Iniciar Sesión
                                    </button>
                                    <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition duration-200 font-medium w-fit">
                                        Registrarse
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            {/* El Contenido Principal de la Página */}
            <main>
                {/* Aquí es donde React Router renderizará el componente de la página actual (Landing, Detalle, etc.) */}
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold text-orange-500 mb-6">
                                El Buen Sabor
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                La mejor comida de tu ciudad, entregada directo a tu puerta. Rápido, seguro y delicioso.
                            </p>
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
                                    <span className="text-sm font-bold">f</span>
                                </div>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
                                    <span className="text-sm font-bold">t</span>
                                </div>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition duration-200 cursor-pointer">
                                    <span className="text-sm font-bold">ig</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6">Empresa</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Acerca de nosotros</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Carreras</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Prensa</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6">Para restaurantes</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Únete como socio</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Centro de ayuda</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Promociones</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Recursos</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6">Soporte</h3>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Centro de ayuda</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Contáctanos</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Política de privacidad</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Términos de servicio</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 El Buen Sabor. Todos los derechos reservados.
                        </p>
                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-sm">Pagos seguros</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Truck className="w-4 h-4" />
                                <span className="text-sm">Entrega garantizada</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}