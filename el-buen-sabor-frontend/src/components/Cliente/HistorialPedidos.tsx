// src/pages/cliente/HistorialPedidos.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PedidoService } from '../../services/PedidoService';
// Ya no necesitamos ClienteService aquí porque el id viene del AuthContext:
// import { ClienteService } from '../../services/ClienteService';
import type { IPedidoDTO } from '../../models/DTO/IPedidoDTO';
import { useAuth } from '../Auth/Context/AuthContext'; // Asegúrate de que la ruta sea correcta

export default function HistorialPedidos() {
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // ¡Ahora obtenemos el 'id' directamente del AuthContext!
    const { role, id: clienteId } = useAuth(); // Renombramos 'id' a 'clienteId' para mayor claridad

    const pedidoService = new PedidoService();
    // Ya no necesitamos instanciar ClienteService aquí:
    // const clienteService = new ClienteService();

    useEffect(() => {
        const fetchHistorialPedidos = async () => {
            // Asegúrate de que el usuario sea un CLIENTE y tenga un clienteId válido
            if (role !== "CLIENTE" || clienteId === null || clienteId === undefined) {
                setError("Acceso denegado. Debes ser un cliente logueado para ver tu historial de pedidos.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Directamente usamos el clienteId obtenido del AuthContext
                const data = await pedidoService.getPedidosByClienteId(clienteId);
                setPedidos(data);
            } catch (err: unknown) {
                console.error("Error al cargar el historial de pedidos:", err);
                setError("No se pudo cargar el historial de pedidos. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorialPedidos();
    }, [role, clienteId]); // Re-ejecuta si el rol o clienteId cambia

    const handleVerDetalle = (pedidoId: number) => {
        navigate(`/historial-pedidos/${pedidoId}`);
    };

    const handleVerFactura = async (pedidoId: number) => {
        try {
            const urlPdf = await pedidoService.getFacturaPdfUrl(pedidoId);
            if (urlPdf) {
                window.open(urlPdf, '_blank');
            } else {
                alert("La URL de la factura no está disponible.");
            }
        } catch (err) {
            console.error("Error al obtener la factura:", err);
            alert("No se pudo cargar la factura. Verifica que exista y que el servidor esté funcionando.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Cargando historial de pedidos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">{error}</p>
                {/* Opcional: botón para ir al login si el problema es de autenticación */}
                {(role !== "CLIENTE" || clienteId === null) && ( // Muestra el botón si no es CLIENTE o no tiene ID
                    <button
                        onClick={() => navigate('/login')} // Asume que tienes una ruta /login
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Ir a Iniciar Sesión
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Historial de Pedidos 📜</h2>

            {pedidos.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600 text-lg">No has realizado ningún pedido aún.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    N° Pedido
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{pedido.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(pedido.fechaPedido).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${pedido.total?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pedido.estado.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleVerDetalle(pedido.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Ver Detalle
                                        </button>
                                        {pedido.factura?.urlPdf && (
                                            <button
                                                onClick={() => handleVerFactura(pedido.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Ver Factura
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}