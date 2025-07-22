// src/pages/Admin/AdminClientePedidosPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Importa useParams
import { PedidoService } from '../../services/PedidoService';
import type { IPedidoDTO } from '../../models/DTO/IPedidoDTO'; // Importa interfaces necesarias
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'; // Iconos

export default function AdminClientePedidosPage() { // Renombrado para claridad
    const { clienteId } = useParams<{ clienteId: string }>(); // Obtener el ID del cliente de la URL
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const pedidoService = new PedidoService();

    useEffect(() => {
        const fetchPedidosCliente = async () => {
            if (!clienteId) {
                setError("ID de cliente no proporcionado en la URL.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Llama al servicio para obtener pedidos por clienteId
                const data = await pedidoService.getPedidosByClienteId(Number(clienteId));
                setPedidos(data);
            } catch (err: unknown) {
                console.error(`Error al cargar pedidos para cliente ${clienteId}:`, err);
                setError("No se pudo cargar los pedidos de este cliente. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidosCliente();
    }, [clienteId]); // Dependencia del clienteId para recargar si cambia

    const handleVerDetalle = (pedidoId: number) => {
        // Para el admin, la ruta de detalle de pedido es /admin/pedidos/:id
        navigate(`/admin/pedidos/${pedidoId}`);
    };

    const handleVisualizarFactura = async (pedidoId: number) => {
        try {
            const blob = await pedidoService.downloadFacturaPdf(pedidoId);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error("Error al visualizar la factura:", err);
            alert("No se pudo visualizar la factura. Verifica que exista y que el servidor esté funcionando.");
        }
    };

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
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="ml-4 text-xl text-gray-700">Cargando pedidos del cliente {clienteId}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-8">
                <p className="text-xl text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/admin/reportes/clientes')} // Volver al reporte de clientes
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                >
                    Volver al Reporte de Clientes
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate('/admin/ranking-clientes')} className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 ml-4 flex-1 text-center">Pedidos del Cliente: {clienteId}</h2>
                    <div className="w-10"></div> {/* Espaciador */}
                </div>

                {pedidos.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg shadow-inner text-center">
                        <p className="text-gray-600 text-xl">Este cliente no ha realizado pedidos en el rango de fechas actual.</p>
                        {/* Opcional: Ir a la lista de productos si no hay pedidos */}
                        {/* <button
                            onClick={() => navigate('/admin/articulos')}
                            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
                        >
                            Ver Artículos
                        </button> */}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
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
                                    <tr key={pedido.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{pedido.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(pedido.fechaPedido).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                            ${pedido.total?.toFixed(2)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleVerDetalle(pedido.id)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                            >
                                                Ver Detalle
                                            </button>
                                            {pedido.factura?.urlPdf && (
                                                <div className="inline-flex space-x-2">
                                                    <button
                                                        onClick={() => handleVisualizarFactura(pedido.id)}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" /> Visualizar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDescargarFactura(pedido.id)}
                                                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" /> Descargar
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
        </div>
    );
}