// src/pages/cliente/HistorialPedidos.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PedidoService } from '../../services/PedidoService';
import type { IPedidoDTO } from '../../models/DTO/IPedidoDTO'; // Importa la interfaz IPedidoDTO
import { useAuth } from '../Auth/Context/AuthContext';

export default function HistorialPedidos() {
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { role, id: clienteId } = useAuth();

    const pedidoService = new PedidoService();

    useEffect(() => {
        const fetchHistorialPedidos = async () => {
            if (role !== "CLIENTE" || clienteId === null || clienteId === undefined) {
                setError("Acceso denegado. Debes ser un cliente logueado para ver tu historial de pedidos.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
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
    }, [role, clienteId]);

    const handleVerDetalle = (pedidoId: number) => {
        navigate(`/historial-pedidos/${pedidoId}`);
    };

    // FUNCIÓN MODIFICADA: Ahora visualizará el PDF en una nueva pestaña (usando Blob)
    const handleVisualizarFactura = async (pedidoId: number) => {
        try {
            // Llama al mismo método que descarga el binario
            const blob = await pedidoService.downloadFacturaPdf(pedidoId);
            const url = window.URL.createObjectURL(blob); // Crea una URL temporal para el Blob
            window.open(url, '_blank'); // Abre la URL en una nueva pestaña

            // Importante: Liberar la URL del objeto cuando ya no sea necesaria
            // Podrías usar un setTimeout si sabes que la pestaña ya cargó el PDF,
            // o confiar en que el navegador la liberará.
            // window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Error al visualizar la factura:", err);
            alert("No se pudo visualizar la factura. Verifica que exista y que el servidor esté funcionando.");
        }
    };

    // Función para descargar la factura (forzar descarga)
    const handleDescargarFactura = async (pedidoId: number) => {
        try {
            const blob = await pedidoService.downloadFacturaPdf(pedidoId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factura_pedido_${pedidoId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al descargar la factura:", err);
            alert("No se pudo descargar la factura. Verifica que exista y que el servidor esté funcionando.");
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
                {(role !== "CLIENTE" || clienteId === null) && (
                    <button
                        onClick={() => navigate('/login')}
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
                                            <div className="inline-flex space-x-2">
                                                <button // CAMBIO AQUÍ: Ahora llama a handleVisualizarFactura
                                                    onClick={() => handleVisualizarFactura(pedido.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Visualizar {/* Botón para abrir en nueva pestaña */}
                                                </button>
                                                <button
                                                    onClick={() => handleDescargarFactura(pedido.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Descargar {/* Botón para forzar descarga */}
                                                </button>
                                            </div>
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