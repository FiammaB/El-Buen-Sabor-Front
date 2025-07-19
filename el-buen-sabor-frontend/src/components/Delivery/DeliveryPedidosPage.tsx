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
                                            {(() => {
                                                // Agrupar promociones y acumular cantidades
                                                const promosMap = new Map();
                                                pedido.detalles?.forEach(det => {
                                                    if (det.promocion) {
                                                        const key = det.promocion.id;
                                                        if (!promosMap.has(key)) {
                                                            promosMap.set(key, {
                                                                ...det.promocion,
                                                                cantidad: det.cantidad,
                                                                subTotal: det.subTotal
                                                            });
                                                        } else {
                                                            const prev = promosMap.get(key);
                                                            promosMap.set(key, {
                                                                ...prev,
                                                                cantidad: prev.cantidad + det.cantidad,
                                                                subTotal: prev.subTotal + det.subTotal
                                                            });
                                                        }
                                                    }
                                                });

                                                if (promosMap.size > 0) {
                                                    // Agrupar insumos y manufacturados de todas las promos (con cantidad * cantidad de la promo pedida)
                                                    const totalInsumos: Record<number, { denominacion: string, cantidad: number }> = {};
                                                    const totalManufacturados: Record<number, { denominacion: string, cantidad: number }> = {};

                                                    [...promosMap.values()].forEach((promo: any) => {
                                                        // Insumos
                                                        promo.articulosInsumos?.forEach((ins: any) => {
                                                            if (!totalInsumos[ins.id]) {
                                                                totalInsumos[ins.id] = {
                                                                    denominacion: ins.denominacion,
                                                                    cantidad: 0,
                                                                };
                                                            }
                                                            totalInsumos[ins.id].cantidad += promo.cantidad; // Acumulá cantidad total de promo pedida
                                                        });
                                                        // Manufacturados (por modelo nuevo, viene en promo.promocionDetalles)
                                                        if (promo.promocionDetalles?.length) {
                                                            promo.promocionDetalles.forEach((detalle: any) => {
                                                                const am = detalle.articuloManufacturado;
                                                                if (!am) return;
                                                                if (!totalManufacturados[am.id]) {
                                                                    totalManufacturados[am.id] = {
                                                                        denominacion: am.denominacion,
                                                                        cantidad: 0,
                                                                    };
                                                                }
                                                                // Cantidad es la de la promo * cantidad del detalle (por ejemplo 2 promos, cada una trae 1 pizza = 2 pizzas total)
                                                                totalManufacturados[am.id].cantidad += promo.cantidad * detalle.cantidad;
                                                            });
                                                        }
                                                    });

                                                    return (
                                                        <div className="mb-2">
                                                            <span className="font-bold text-purple-700">Promociones:</span>
                                                            <ul className="ml-3 mt-1 list-disc">
                                                                {[...promosMap.values()].map((promo: any, i) => (
                                                                    <li key={i} className="mb-2">
                                                                        <span className="font-bold text-red-500">{promo.denominacion}</span> (x{promo.cantidad})
                                                                        <span className="text-gray-500"> (Total: ${promo.subTotal?.toFixed(2)})</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {/* MANUFACTURADOS agrupados de todas las promos */}
                                                            {Object.values(totalManufacturados).length > 0 && (
                                                                <div className="ml-2 text-green-900">
                                                                    <strong>Manufacturados:</strong>
                                                                    <ul className="ml-5 list-disc">
                                                                        {Object.values(totalManufacturados).map((am: any, j) => (
                                                                            <li key={j}>
                                                                                {am.denominacion} (x{am.cantidad})
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* INSUMOS agrupados de todas las promos */}
                                                            {Object.values(totalInsumos).length > 0 && (
                                                                <div className="ml-2 text-blue-900">
                                                                    <strong>Insumos:</strong>
                                                                    <ul className="ml-5 list-disc">
                                                                        {Object.values(totalInsumos).map((ins: any, j) => (
                                                                            <li key={j}>
                                                                                {ins.denominacion} (x{ins.cantidad})
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

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
