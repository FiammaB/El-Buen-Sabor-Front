import { useAuth } from "./Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    if (role !== "ADMINISTRADOR") {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-500">Acceso denegado 🚫</h2>
                <p className="text-gray-600 mt-4">No tenés permisos para ver esta sección.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-orange-600 mb-6">Panel del Administrador 🛠</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">📝 Gestionar Productos</h3>
                    <p className="text-sm text-gray-600 mb-4">Agregar, editar o eliminar artículos.</p>
                    <button
                        onClick={() => navigate("/admin/articulos")}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        Ir a Artículos
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">📊 Ver Estadísticas</h3>
                    <p className="text-sm text-gray-600 mb-4">Revisar pedidos, ventas y más.</p>
                    <button
                        onClick={() => navigate("/admin/estadisticas")}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        Ver Estadísticas
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🚪 Cerrar Sesión</h3>
                    <p className="text-sm text-gray-600 mb-4">Cerrar sesión de administrador.</p>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🏷️ Categorías de Insumos</h3>
                    <p className="text-sm text-gray-600 mb-4">Crear o modificar categorías para insumos.</p>
                    <button
                        onClick={() => navigate("/categoriaInsumo")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Ir a Categorías de Insumos
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🏷️ Categorías de Manufacturados</h3>
                    <p className="text-sm text-gray-600 mb-4">Crear o modificar categorías para productos manufacturados.</p>
                    <button
                        onClick={() => navigate("/categoriaManufacturado")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Ir a Categorías de Manufacturados
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🛒 Compra de Ingredientes</h3>
                    <p className="text-sm text-gray-600 mb-4">Gestionar compras de insumos e ingredientes.</p>
                    <button
                        onClick={() => navigate("/compraIngredientes")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Ir a Compras de Ingredientes
                    </button>
                </div>

            </div>
        </div>
    );
}