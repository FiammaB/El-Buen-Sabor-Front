import { useAuth } from "./Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CocineroDashboard() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    if (role !== "COCINERO") {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-500">Acceso denegado 🚫</h2>
                <p className="text-gray-600 mt-4">No tenés permisos para ver esta sección.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Panel del Cocinero 👨‍🍳</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-green-300">
                    <h3 className="text-lg font-bold mb-2">🍳 Ver Pedidos para Preparar</h3>
                    <p className="text-sm text-gray-600 mb-4">Visualizá y gestioná los pedidos asignados.</p>
                    <button
                        onClick={() => navigate("/cocinero/pedidos")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Ver Pedidos
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🚪 Cerrar Sesión</h3>
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
            </div>
        </div>
    );
}
