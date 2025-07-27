// src/pages/cliente/PedidoDetalle.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PedidoService } from '../../services/PedidoService';
import type { IPedidoDTO } from '../../models/DTO/IPedidoDTO';

export default function PedidoDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState<IPedidoDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const pedidoService = new PedidoService();

    useEffect(() => {
        const fetchPedidoDetalle = async () => {
            if (!id) {
                setError("ID de pedido no proporcionado en la URL.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const pedidoId = parseInt(id);
                const data = await pedidoService.getPedidoById(pedidoId);
                if (data) {
                    setPedido(data);
                } else {
                    setError(`Pedido con ID ${id} no encontrado.`);
                }
            } catch (err: unknown) {
                console.error("Error al cargar el detalle del pedido:", err);
                setError("No se pudo cargar el detalle del pedido. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidoDetalle();
    }, [id]);

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
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Cargando detalle del pedido...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">{error}</p>
                <button
                    onClick={() => navigate('/historial-pedidos')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Volver al Historial
                </button>
            </div>
        );
    }

    if (!pedido) {
        return null;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Detalle del Pedido #{pedido.id}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-gray-700"><strong>Fecha:</strong> {new Date(pedido.fechaPedido).toLocaleDateString()}</p>
                    <p className="text-gray-700"><strong>Estado:</strong> {pedido.estado.replace(/_/g, ' ')}</p>
                    <p className="text-gray-700"><strong>Hora Estimada Fin:</strong> {pedido.horaEstimadaFinalizacion.slice(0, 5)}</p>
                    <p className="text-gray-700"><strong>Forma de Pago:</strong> {pedido.formaPago.replace(/_/g, ' ')}</p>
                    <p className="text-gray-700"><strong>Tipo de Envío:</strong> {pedido.tipoEnvio.replace(/_/g, ' ')}</p>
                </div>
                <div>
                    {pedido.cliente && (
                        <>
                            <p className="text-gray-700"><strong>Cliente:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}</p>
                            <p className="text-gray-700"><strong>Email:</strong> {pedido.cliente.usuario?.email || 'N/A'}</p>
                            <p className="text-gray-700"><strong>Teléfono:</strong> {pedido.cliente.telefono || 'N/A'}</p>
                        </>
                    )}
                    {pedido.domicilio && (
                        <p className="text-gray-700">
                            <strong>Domicilio:</strong> {pedido.domicilio.calle} {pedido.domicilio.numero}, CP {pedido.domicilio.cp} ({pedido.domicilio.localidad?.nombre || 'N/A'})
                        </p>
                    )}
                </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ítems del Pedido:</h3>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pedido.detalles.map((detalle, index) => (
                            <tr key={detalle.id || index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {detalle.articuloManufacturado?.denominacion ||
                                        detalle.articuloInsumo?.denominacion ||
                                        'Artículo Desconocido'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detalle.cantidad}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${detalle.subTotal?.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-right text-lg font-semibold text-gray-800 mb-6">
                <p>Total: ${pedido.total?.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center mt-6">
                {/* ✅ BOTÓN VOLVER ACTUALIZADO */}
                <button
                    onClick={() => {
                        if (window.location.pathname.startsWith("/admin/pedidos")) {
                            navigate("/admin/pedidos-entregados", { replace: true });
                        } else if (pedido.persona?.id) {
                            navigate(`/admin/clientes/${pedido.persona.id}/pedidos`);
                        } else {
                            navigate(-1);
                        }
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    Volver al Historial
                </button>

                {pedido.factura?.urlPdf && (
                    <div className="inline-flex space-x-2">
                        <button
                            onClick={() => handleVisualizarFactura(pedido.id)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Visualizar
                        </button>
                        <button
                            onClick={() => handleDescargarFactura(pedido.id)}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Descargar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
