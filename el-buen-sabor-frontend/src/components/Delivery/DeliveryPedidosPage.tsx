import React, { useEffect, useState } from "react";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DeliveryPedidosPage() {
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [openDetalle, setOpenDetalle] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // Solo trae pedidos en estado "EN_DELIVERY"
    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await new PedidoService().getPedidosByEstado("EN_DELIVERY");
            setPedidos(data);
        } catch {
            setError("Error cargando pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    // Cambia el estado a ENTREGADO y recarga la grilla
    const handleEntregado = async (pedido: IPedidoDTO) => {
        if (!window.confirm("¿Marcar este pedido como ENTREGADO?")) return;
        await new PedidoService().actualizarEstadoPedido(pedido.id!, "ENTREGADO");
        fetchPedidos();
    };

    const calcularTotal = (pedido: IPedidoDTO) => {
        if (!pedido.detalles) return 0;
        return pedido.detalles.reduce((acc, det) => {
            if (det.articuloManufacturado) {
                return acc + (det.cantidad || 0) * (det.articuloManufacturado.precioVenta || 0);
            } else if (det.articuloInsumo) {
                return acc + (det.cantidad || 0) * (det.articuloInsumo.precioVenta || 0);
            }
            return acc;
        }, 0);
    };


    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Pedidos para Entregar</h2>
            {loading && <div className="text-gray-600 py-4">Cargando pedidos...</div>}
            {error && <div className="text-red-600 py-4">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full border rounded shadow text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-center">ID</th>
                        <th className="p-2 text-center">Cliente</th>
                        <th className="p-2 text-center">Dirección de Entrega</th>
                        <th className="p-2 text-center">Teléfono</th>
                        <th className="p-2 text-center">Detalle</th>
                        <th className="p-2 text-center">Total</th>
                        <th className="p-2 text-center">Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pedidos.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                No hay pedidos para entregar.
                            </td>
                        </tr>
                    ) : (
                        pedidos.map((pedido) => (
                            <React.Fragment key={pedido.id}>
                                <tr className="border-t">
                                    <td className="p-2 text-center font-bold">{pedido.id}</td>
                                    {/* CLIENTE */}
                                    <td className="p-2 text-center">
                                        {pedido.cliente
                                            ? (
                                            pedido.cliente.usuario?.nombre
                                                ? `${pedido.cliente.usuario.nombre} ${pedido.cliente.apellido ?? ""}`
                                                : `${pedido.cliente.nombre ?? ""} ${pedido.cliente.apellido ?? ""}`
                                        ).trim() || pedido.clienteId
                                            : pedido.clienteId ?? "-"
                                        }
                                    </td>
                                    {/* DOMICILIO */}
                                    <td className="p-2 text-center">
                                        {pedido.domicilio
                                            ? `${pedido.domicilio.calle} ${pedido.domicilio.numero}, ${pedido.domicilio.localidad?.nombre || ""}`
                                            : "-"}
                                    </td>
                                    {/* TELEFONO */}
                                    <td className="p-2 text-center">
                                        {pedido.cliente?.telefono || "-"}
                                    </td>
                                    {/* DETALLE */}
                                    <td className="p-2 text-center flex gap-2 justify-center">
                                        <button
                                            className="flex items-center gap-2 bg-blue-600 text-white rounded px-3 py-1 shadow hover:bg-blue-700 hover:scale-105 transition"
                                            onClick={() => setOpenDetalle(openDetalle === pedido.id ? null : pedido.id)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Detalle
                                        </button>
                                        <button
                                            className="flex items-center gap-2 bg-orange-600 text-white rounded px-3 py-1 shadow hover:bg-orange-700 hover:scale-105 transition"
                                            onClick={() => navigate(`/delivery/pedido/${pedido.id}`)}
                                        >
                                            Ver Pedido
                                        </button>
                                    </td>
                                    {/* TOTAL */}
                                    <td className="p-2 text-center font-bold">
                                        ${calcularTotal(pedido).toFixed(2)}
                                    </td>
                                    {/* ACCION */}
                                    <td className="p-2 text-center">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 font-medium transition"
                                            onClick={() => handleEntregado(pedido)}
                                        >
                                            Marcar como Entregado
                                        </button>
                                    </td>
                                </tr>
                                {/* DETALLE DESPLEGABLE */}
                                {openDetalle === pedido.id && (
                                    <tr>
                                        <td colSpan={7} className="bg-gray-50 pl-8 py-2">
                                            <h4 className="font-semibold mb-2">Detalle del Pedido</h4>
                                            <ul>
                                                {pedido.detalles?.map((det, idx) => (
                                                    <li key={idx} className="mb-1">
                                                        {det.articuloManufacturado
                                                            ? (
                                                                <span className="font-bold text-green-800">
                          {det.articuloManufacturado.denominacion}
                        </span>
                                                            )
                                                            : det.articuloInsumo
                                                                ? (
                                                                    <span className="font-bold text-blue-800">
                            {det.articuloInsumo.denominacion}
                          </span>
                                                                )
                                                                : <span>-</span>
                                                        }
                                                        {" "} x{det.cantidad}
                                                        {" "}
                                                        <span className="text-gray-500">(${det.subTotal?.toFixed(2)})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
