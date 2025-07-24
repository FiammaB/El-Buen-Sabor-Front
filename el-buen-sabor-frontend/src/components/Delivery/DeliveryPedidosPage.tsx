import React, { useEffect, useState } from "react";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../Auth/Context/AuthContext.tsx";

export default function DeliveryPedidosPage() {
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [openDetalle, setOpenDetalle] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id: userId } = useAuth();
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
        try {
            await new PedidoService().actualizarEstadoPedido(pedido.id!, {
                estado: "ENTREGADO",
                empleadoId: userId // <- IMPORTANTE: este es el ID del delivery logueado
            });
            fetchPedidos();
        } catch (e) {
            alert("No se pudo actualizar el pedido.");
        }
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
                                        {pedido.persona
                                            ? (
                                            pedido.persona.nombre
                                                ? `${pedido.persona.nombre} ${pedido.persona.apellido ?? ""}`
                                                : `${pedido.persona.nombre ?? ""} ${pedido.persona.apellido ?? ""}`
                                        ).trim() || pedido.personaId
                                            : pedido.personaId ?? "-"
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
                                        {pedido.persona?.telefono || "-"}
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
                                        ${pedido.total?.toFixed(2)}
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
                                            {/* 1. Promociones con agrupado de insumos y manufacturados */}
                                            {pedido.detalles?.filter(det => det.promocion).map((det, idx) => (
                                                <div key={idx} className="mb-2 border-b pb-2">
                                                    <div className="font-bold text-purple-700">
                                                        {det.promocion.denominacion} <span className="text-xs text-gray-600">(x{det.cantidad})</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-1">
                                                        Subtotal: ${det.subTotal?.toFixed(2)}
                                                    </div>
                                                    {/* Manufacturados agrupados */}
                                                    {det.promocion.promocionDetalles && det.promocion.promocionDetalles.length > 0 && (
                                                        <div className="mb-1">
                                                            <span className="font-semibold text-green-700">Manufacturados:</span>
                                                            <ul className="ml-3 list-disc text-sm">
                                                                {det.promocion.promocionDetalles.map((detalle, i) => (
                                                                    <li key={i}>
                                                                        {detalle.articuloManufacturado?.denominacion || "-"} (x{(detalle.cantidad ?? 1) * (det.cantidad ?? 1)})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {/* Insumos agrupados */}
                                                    {det.promocion.articulosInsumos && det.promocion.articulosInsumos.length > 0 && (
                                                        <div>
                                                            <span className="font-semibold text-blue-700">Insumos:</span>
                                                            <ul className="ml-3 list-disc text-sm">
                                                                {det.promocion.articulosInsumos.map((ins, i) => (
                                                                    <li key={i}>
                                                                        {ins.denominacion} (x{det.cantidad})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}


                                            {/* 2. Manufacturados */}
                                            {(() => {
                                                const manMap = new Map();
                                                pedido.detalles?.forEach(det => {
                                                    if (det.articuloManufacturado && !det.promocion) {
                                                        const key = det.articuloManufacturado.id;
                                                        if (!manMap.has(key)) {
                                                            manMap.set(key, {
                                                                ...det.articuloManufacturado,
                                                                cantidad: det.cantidad,
                                                                subTotal: det.subTotal
                                                            });
                                                        } else {
                                                            const prev = manMap.get(key);
                                                            manMap.set(key, {
                                                                ...prev,
                                                                cantidad: prev.cantidad + det.cantidad,
                                                                subTotal: prev.subTotal + det.subTotal
                                                            });
                                                        }
                                                    }
                                                });
                                                if (manMap.size > 0) {
                                                    return (
                                                        <div className="mb-2">
                                                            <span className="font-bold text-green-700">Artículos Manufacturados:</span>
                                                            <ul className="ml-3 mt-1 list-disc">
                                                                {[...manMap.values()].map((am: any, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-bold">{am.denominacion}</span> (x{am.cantidad})
                                                                        <span className="text-gray-500"> (Total: ${am.subTotal?.toFixed(2)})</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* 3. Insumos */}
                                            {(() => {
                                                const insMap = new Map();
                                                pedido.detalles?.forEach(det => {
                                                    if (det.articuloInsumo && !det.promocion) {
                                                        const key = det.articuloInsumo.id;
                                                        if (!insMap.has(key)) {
                                                            insMap.set(key, {
                                                                ...det.articuloInsumo,
                                                                cantidad: det.cantidad,
                                                                subTotal: det.subTotal
                                                            });
                                                        } else {
                                                            const prev = insMap.get(key);
                                                            insMap.set(key, {
                                                                ...prev,
                                                                cantidad: prev.cantidad + det.cantidad,
                                                                subTotal: prev.subTotal + det.subTotal
                                                            });
                                                        }
                                                    }
                                                });
                                                if (insMap.size > 0) {
                                                    return (
                                                        <div>
                                                            <span className="font-bold text-blue-700">Artículos Insumo:</span>
                                                            <ul className="ml-3 mt-1 list-disc">
                                                                {[...insMap.values()].map((ins: any, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-bold">{ins.denominacion}</span> (x{ins.cantidad})
                                                                        <span className="text-gray-500"> (Total: ${ins.subTotal?.toFixed(2)})</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
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
