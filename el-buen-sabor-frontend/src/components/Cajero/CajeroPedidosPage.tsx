import React, { useEffect, useState } from "react";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { Eye } from "lucide-react";
import {useAuth} from "../Auth/Context/AuthContext";

// Helpers UI

const ESTADOS = [
    "A_CONFIRMAR",
    "PAGADO",
    "EN_COCINA",
    "EN_PREPARACION",
    "LISTO",
    "EN_DELIVERY",
    "ENTREGADO",
    "CANCELADO",
    "RECHAZADO",
    "DEVOLUCION",
];

function getProximoEstado(pedido: IPedidoDTO): { estado: string, label: string } | null {
    if (pedido.estado === "A_CONFIRMAR") {
        return { estado: "PAGADO", label: "Marcar como Pagado" };
    }
    if (pedido.estado === "PAGADO") {
        const tieneManufacturados = pedido.detalles?.some(det => !!det.articuloManufacturado);
        if (tieneManufacturados) {
            return { estado: "EN_COCINA", label: "Pasar a En Cocina" };
        } else {
            return { estado: "LISTO", label: "Pasar a Listo" };
        }
    }
    if (pedido.estado === "LISTO") {
        if (pedido.tipoEnvio === "RETIRO_EN_LOCAL") {
            return { estado: "ENTREGADO", label: "Pasar a Entregado" };
        }
        if (pedido.tipoEnvio === "DELIVERY") {
            return { estado: "EN_DELIVERY", label: "Pasar a En Delivery" };
        }
    }
    return null;
}

function puedeCancelar(pedido: IPedidoDTO) {
    return !["CANCELADO", "DEVOLUCION", "ENTREGADO"].includes(pedido.estado || "");
}
function puedeDevolver(pedido: IPedidoDTO) {
    return pedido.estado === "CANCELADO";
}

export default function CajeroPedidosPage() {
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>("");
    const [openSlide, setOpenSlide] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allPedidos, setAllPedidos] = useState<IPedidoDTO[]>([]);
    const [filteredPedidos, setFilteredPedidos] = useState<IPedidoDTO[]>([]);
    const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
    const [idBusqueda, setIdBusqueda] = useState<string>("");

    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            let data: IPedidoDTO[];
            if (idBusqueda) {
                const pedido = await new PedidoService().getPedidoById(Number(idBusqueda));
                data = pedido ? [pedido] : [];
            } else if (estadoFiltro) {
                data = await new PedidoService().getPedidosByEstado(estadoFiltro);
            } else {
                data = await new PedidoService().getAllPedidos();
            }
            console.log("Respuesta del backend de pedidos:", data);
            setPedidos(data);
        } catch {
            setError("Error cargando pedidos.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (pedido: IPedidoDTO) => {
        if (!window.confirm("¿Seguro que deseas cancelar este pedido?")) return;
        try {
            await new PedidoService().actualizarEstadoPedido(pedido.id!, "CANCELADO");
            alert("Pedido cancelado exitosamente.");
            fetchPedidos();
        } catch (e: any) {
            alert("Error al cancelar el pedido: " + (e?.response?.data?.error || e.message));
        }
    };

    const handleDevolver = async (pedido: IPedidoDTO) => {
        const motivoAnulacion = prompt("Motivo de la devolución/anulación:");
        if (!motivoAnulacion) return;
        try {
            // Usá el userId real cuando lo tengas en el contexto
            const usuarioAnuladorId = 1; // HARDCODE para test
            await new PedidoService().anularPedidoConNotaCredito(pedido.id!, {
                usuarioAnuladorId,
                motivoAnulacion,
            });
            await new PedidoService().actualizarEstadoPedido(pedido.id!, "DEVOLUCION");
            alert("Pedido anulado y Nota de Crédito enviada al cliente.");
            fetchPedidos();
        } catch (e: any) {
            alert("Error al generar la Nota de Crédito: " + (e?.response?.data?.error || e.message));
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, [estadoFiltro, idBusqueda]);

    const handleLimpiarBusqueda = () => {
        setIdBusqueda("");
    };

    // Función para avanzar el estado
    const handleAvanzarEstado = async (pedido: IPedidoDTO) => {
        const prox = getProximoEstado(pedido);
        if (!prox) return;
        await new PedidoService().actualizarEstadoPedido(pedido.id!, prox.estado);
        fetchPedidos();
    };

    useEffect(() => {
        (async () => {
            const data = await new PedidoService().getAllPedidos();
            setAllPedidos(data);
        })();
    }, []);

    // Filtrado por estados seleccionados y por ID
    useEffect(() => {
        let pedidos = allPedidos;
        if (idBusqueda) {
            pedidos = pedidos.filter(p => p.id?.toString() === idBusqueda);
        }
        if (selectedEstados.length > 0) {
            pedidos = pedidos.filter(p => selectedEstados.includes(p.estado));
        }
        setFilteredPedidos(pedidos);
    }, [allPedidos, selectedEstados, idBusqueda]);

    // Toggle de selección de estados
    const handleEstadoToggle = (estado: string) => {
        setSelectedEstados(estados =>
            estados.includes(estado)
                ? estados.filter(e => e !== estado)
                : [...estados, estado]
        );
    };

    // Buscar por ID
    const handleBuscarPorId = (e: React.FormEvent) => {
        e.preventDefault();
        // El filtrado se maneja en useEffect
    };

    return (
        <div>
            {/* FILTROS ARRIBA DE LA TABLA */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
                {/* Filtro por ID */}
                <form onSubmit={handleBuscarPorId} className="flex items-center gap-2">
                    <input
                        type="number"
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Buscar por ID"
                        value={idBusqueda}
                        onChange={(e) => setIdBusqueda(e.target.value)}
                        style={{ width: 120 }}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-medium transition hover:bg-blue-700"
                    >
                        Buscar
                    </button>
                    {idBusqueda && (
                        <button
                            type="button"
                            className="text-xs text-red-600 ml-1"
                            onClick={() => { setIdBusqueda(""); fetchPedidos(); }}
                        >
                            Limpiar
                        </button>
                    )}
                </form>
                <div className="flex flex-wrap gap-2 mb-4">
                    {ESTADOS.map(estado => (
                        <button
                            key={estado}
                            type="button"
                            onClick={() => handleEstadoToggle(estado)}
                            className={
                                "px-3 py-1 rounded-full text-xs font-semibold border transition " +
                                (selectedEstados.includes(estado)
                                    ? "bg-blue-600 text-white border-blue-700 shadow"
                                    : "bg-white text-gray-800 border-gray-400 hover:bg-blue-50")
                            }
                        >
                            {estado.replace(/_/g, " ")}
                        </button>
                    ))}
                    {selectedEstados.length > 0 && (
                        <button
                            className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            onClick={() => setSelectedEstados([])}
                        >Limpiar filtros</button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm rounded shadow">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">ID</th>
                        <th className="p-2">Detalle</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredPedidos.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center p-4 text-gray-500">
                                No hay pedidos para mostrar.
                            </td>
                        </tr>
                    ) : (
                        filteredPedidos.map((pedido) => (
                            <React.Fragment key={pedido.id}>
                                <tr className="border-t">
                                    <td className="p-2 text-center font-bold">{pedido.id}</td>
                                    <td className="p-2">
                                        <div className="flex justify-center">
                                            <button
                                                className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-1 shadow hover:bg-blue-700 hover:scale-105 transition font-medium"
                                                onClick={() => setOpenSlide(openSlide === pedido.id ? null : pedido.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver Detalle
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-2 text-center">
                                        {pedido.persona
                                            ? (
                                                <>
                                                    <div>{pedido.persona.nombre}, {pedido.persona.apellido}</div>
                                                </>
                                            )
                                            : pedido.personaId ?? "-"
                                        }
                                    </td>
                                    <td className="p-2 text-center">
                                        {pedido.fechaPedido?.slice(0, 10)}
                                    </td>
                                    <td className="p-2 text-center">
                                        $
                                        {pedido.detalles
                                            ? pedido.detalles
                                                .reduce((acc, det) => {
                                                    if (det.articuloManufacturado) {
                                                        return acc + (det.cantidad || 0) * (det.articuloManufacturado.precioVenta || 0);
                                                    } else if (det.articuloInsumo) {
                                                        return acc + (det.cantidad || 0) * (det.articuloInsumo.precioVenta || 0);
                                                    } else if (det.promocion) {
                                                        return acc + (det.cantidad || 0) * (det.promocion.precioPromocional || 0);
                                                    } else {
                                                        return acc;
                                                    }
                                                }, 0)
                                                .toFixed(2)
                                            : "-"}
                                    </td>
                                    <td className="p-2 text-center">
                                        {getProximoEstado(pedido) ? (
                                            <button
                                                className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 text-xs font-medium transition"
                                                onClick={() => handleAvanzarEstado(pedido)}
                                            >
                                                {pedido.estado}: {getProximoEstado(pedido)?.label}
                                            </button>
                                        ) : (
                                            <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                                                {pedido.estado}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex flex-col gap-1 items-center">
                                            {puedeCancelar(pedido) && (
                                                <button
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-xs font-medium transition"
                                                    onClick={() => handleCancelar(pedido)}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            {puedeDevolver(pedido) && (
                                                <button
                                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded px-2 py-1 text-xs font-medium transition"
                                                    onClick={() => handleDevolver(pedido)}
                                                >
                                                    Devolución
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {openSlide === pedido.id && (
                                    <tr>
                                        <td colSpan={7} className="bg-gray-50 pl-8 py-2">
                                            <div>
                                                <h4 className="font-semibold mb-2">Detalles:</h4>
                                                <ul>
                                                    {/* PROMOCIONES */}
                                                    {pedido.detalles?.filter(det => det.promocion).map((det, idx) => (
                                                        <li key={"promo" + idx} className="mb-3">
                                                            <div className="font-bold text-purple-700">
                                                                {det.promocion.denominacion} (x{det.cantidad}) <span className="text-gray-500">(Total: ${det.subTotal?.toFixed(2)})</span>
                                                            </div>
                                                            {/* Artículo Insumo */}
                                                            {det.promocion.articulosInsumo && det.promocion.articulosInsumo.length > 0 && (
                                                                <div className="ml-3 text-sm">
                                                                    <span className="font-semibold text-blue-800">Artículos Insumo:</span>
                                                                    <ul className="ml-4 list-disc">
                                                                        {det.promocion.articulosInsumo.map((ins, i) => (
                                                                            <li key={i}>
                                                                                ({det.cantidad}x) {ins.denominacion}
                                                                                {ins.precioVenta && (
                                                                                    <> <span className="text-gray-500">($
                                                                                        {ins.precioVenta?.toFixed(2)})
                                                                                    </span></>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {/* Artículo Manufacturado */}
                                                            {det.promocion.articulosManufacturados && det.promocion.articulosManufacturados.length > 0 && (() => {
                                                                // Agrupar manufacturados por ID
                                                                const agrupados = det.promocion.articulosManufacturados.reduce((acc, am) => {
                                                                    if (!am.id) return acc;
                                                                    if (!acc[am.id]) {
                                                                        acc[am.id] = {
                                                                            ...am,
                                                                            cantidad: det.cantidad,
                                                                        };
                                                                    } else {
                                                                        acc[am.id].cantidad += det.cantidad;
                                                                    }
                                                                    return acc;
                                                                }, {} as Record<number, any>);

                                                                return (
                                                                    <div className="ml-3 text-sm">
                                                                        <span className="font-semibold text-green-800">Artículos Manufacturados (Total):</span>
                                                                        <ul className="ml-4 list-disc">
                                                                            {Object.values(agrupados).map((am: any) => (
                                                                                <li key={am.id}>
                                                                                    ({am.cantidad}x) {am.denominacion}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            })()}

                                                        </li>
                                                    ))}

                                                    {/* MANUFACTURADOS SUELTOS */}
                                                    {pedido.detalles?.filter(det => !det.promocion && det.articuloManufacturado).map((det, idx) => (
                                                        <li key={"manu" + idx} className="mb-3">
                                                            <span className="font-bold text-green-800">{det.articuloManufacturado.denominacion}</span> (x{det.cantidad})
                                                            <span className="text-gray-500"> (${det.subTotal?.toFixed(2)})</span>
                                                            <span className="ml-2 text-green-700 font-bold">
                                                                (Total: ${(det.subTotal * det.cantidad).toFixed(2)})
                                                            </span>
                                                        </li>
                                                    ))}

                                                    {/* INSUMOS SUELTOS */}
                                                    {pedido.detalles?.filter(det => !det.promocion && det.articuloInsumo).map((det, idx) => (
                                                        <li key={"insu" + idx} className="mb-3">
                                                              <span className="font-bold text-blue-800">
                                                                {det.articuloInsumo.denominacion} (x{det.cantidad})
                                                                <span className="ml-2 text-green-700 font-bold"> (Total: ${det.subTotal?.toFixed(2)})</span>
                                                              </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
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