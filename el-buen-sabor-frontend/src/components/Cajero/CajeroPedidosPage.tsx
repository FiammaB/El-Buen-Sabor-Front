import React, { useEffect, useState } from "react";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { Eye } from "lucide-react";

// Helpers UI
function getProximoEstado(pedido: IPedidoDTO): {estado: string, label: string} | null {
    if (pedido.estado === "A_CONFIRMAR" && pedido.formaPago === "EFECTIVO") {
        return { estado: "PAGADO", label: "Marcar como Pagado" };
    }
    if (pedido.estado === "PAGADO") {
        return { estado: "EN_COCINA", label: "Pasar a En Cocina" };
    }
    if (pedido.estado === "LISTO") {
        if (pedido.formaPago === "EFECTIVO") {
            return { estado: "ENTREGADO", label: "Pasar a Entregado" };
        } else if (pedido.formaPago === "MERCADO_PAGO") {
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
    const [idBusqueda, setIdBusqueda] = useState<string>("");
    const [openSlide, setOpenSlide] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setPedidos(data);
        } catch {
            setError("Error cargando pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, [estadoFiltro, idBusqueda]);

    const handleBuscarPorId = (e: React.FormEvent) => {
        e.preventDefault();
    };

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

    // Función para cancelar
    const handleCancelar = async (pedido: IPedidoDTO) => {
        if (!window.confirm("¿Seguro que deseas cancelar este pedido?")) return;
        await new PedidoService().actualizarEstadoPedido(pedido.id!, "CANCELADO");
        fetchPedidos();
    };

    // Función para devolver (pasa a DEVOLUCION)
    const handleDevolver = async (pedido: IPedidoDTO) => {
        if (!window.confirm("¿Seguro que deseas pasar este pedido a DEVOLUCIÓN?")) return;
        await new PedidoService().actualizarEstadoPedido(pedido.id!, "DEVOLUCION");
        fetchPedidos();
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

                    {/* Filtro por Estado */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm">Filtrar por Estado:</label>
                        <select
                            value={estadoFiltro}
                            onChange={e => setEstadoFiltro(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="A_CONFIRMAR">A Confirmar</option>
                            <option value="PAGADO">Pagado</option>
                            <option value="EN_COCINA">En Cocina</option>
                            <option value="EN_PREPARACION">En Preparación</option>
                            <option value="LISTO">Listo</option>
                            <option value="EN_DELIVERY">En Delivery</option>
                            <option value="ENTREGADO">Entregado</option>
                            <option value="CANCELADO">Cancelado</option>
                            <option value="DEVOLUCION">Devolución</option>
                        </select>
                        {estadoFiltro && (
                            <button
                                type="button"
                                className="text-xs text-red-600 ml-1"
                                onClick={() => { setEstadoFiltro(""); fetchPedidos(); }}
                            >
                                Limpiar
                            </button>
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
                    {pedidos.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center p-4 text-gray-500">
                                No hay pedidos para mostrar.
                            </td>
                        </tr>
                    ) : (
                        pedidos.map((pedido) => (
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
                                        {pedido.cliente?.nombre || pedido.clienteId || "-"}
                                    </td>
                                    <td className="p-2 text-center">
                                        {pedido.fechaPedido?.slice(0, 10)}
                                    </td>
                                    <td className="p-2 text-center">
                                        ${pedido.detalles ? pedido.detalles.reduce((acc, det) => acc + (det.subTotal || 0), 0).toFixed(2) : "-"}
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
                                            // Si no puede avanzar más, solo badge de estado
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
                                                    {pedido.detalles?.map((det, idx) => (
                                                        <li key={idx} className="mb-1">
                                                            {det.articuloManufacturado
                                                                ? (
                                                                    <>
                                                                        <span className="font-bold text-green-800">{det.articuloManufacturado.denominacion}</span>
                                                                        {" "} (x{det.cantidad})
                                                                        <div className="ml-4 text-xs text-gray-700">
                                                                            <strong>Preparación:</strong> {det.articuloManufacturado.preparacion}
                                                                            <br/>
                                                                            <strong>Insumos:</strong>{" "}
                                                                            {det.articuloManufacturado.detalles?.map((d, i) => (
                                                                                <span key={i}>
                                                                                    {d.articuloInsumo.denominacion} (x{d.cantidad})
                                                                                    {i < det.articuloManufacturado.detalles.length - 1 ? ", " : ""}
                                                                                </span>
                                                                            )) || " - "}
                                                                        </div>
                                                                    </>
                                                                )
                                                                : det.articuloInsumo
                                                                    ? (
                                                                        <span className="font-bold text-blue-800">
                                                                            {det.articuloInsumo.denominacion} (x{det.cantidad})
                                                                        </span>
                                                                    )
                                                                    : <span>-</span>
                                                            }
                                                            {" "} <span className="text-gray-500">(${det.subTotal?.toFixed(2)})</span>
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
