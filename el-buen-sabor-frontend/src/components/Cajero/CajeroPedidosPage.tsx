import React, { useEffect, useState } from "react";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { Eye } from "lucide-react";
import { useAuth } from "../Auth/Context/AuthContext";

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
        // Revisa manufacturados sueltos
        const tieneManufacturadosSueltos = pedido.detalles?.some(det => !!det.articuloManufacturado);
        // Revisa manufacturados dentro de promociones
        const tieneManufacturadosEnPromo = pedido.detalles?.some(det =>
            det.promocion &&
            det.promocion.promocionDetalles?.some((promoDet: any) => !!promoDet.articuloManufacturado)
        );

        const tieneManufacturados = tieneManufacturadosSueltos || tieneManufacturadosEnPromo;

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
    const [fechaFiltro, setFechaFiltro] = useState<string>("");
    const { id: userId, role } = useAuth();
    const [loadingPedidoId, setLoadingPedidoId] = useState<number | null>(null);

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
            const payload = { estado: "CANCELADO", empleadoId: userId || null };
            await new PedidoService().actualizarEstadoPedido(pedido.id!, payload);
            alert("Pedido cancelado exitosamente.");

            const nuevosPedidos = await new PedidoService().getAllPedidos();
            setAllPedidos(nuevosPedidos);
        } catch (e: any) {
            alert("Error al cancelar el pedido: " + (e?.response?.data?.error || e.message));
        }
    };

    const handleDevolver = async (pedido: IPedidoDTO) => {
        const motivoAnulacion = prompt("Motivo de la devolución/anulación:");
        if (!motivoAnulacion) return;
        try {
            const usuarioAnuladorId = 1;
            await new PedidoService().anularPedidoConNotaCredito(pedido.id!, {
                usuarioAnuladorId,
                motivoAnulacion,
            });

            const payload = { estado: "DEVOLUCION", empleadoId: userId || null };
            await new PedidoService().actualizarEstadoPedido(pedido.id!, payload);

            alert("Pedido anulado y Nota de Crédito enviada al cliente.");

            const nuevosPedidos = await new PedidoService().getAllPedidos();
            setAllPedidos(nuevosPedidos);
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
        setLoadingPedidoId(pedido.id!);
        // Armá el payload con el estado y, si existe, el id del usuario logueado
        try {
            // Armá el payload con el estado y, si existe, el id del usuario logueado
            const payload: { estado: string, empleadoId?: number } = { estado: prox.estado };

            // Solo manda empleadoId si hay usuario logueado y si es un rol correspondiente
            if (userId && ["CAJERO", "COCINERO", "DELIVERY"].includes(role ?? "")) {
                payload.empleadoId = userId;
            }

            await new PedidoService().actualizarEstadoPedido(pedido.id!, payload);

            // Recarga toda la lista para que los cambios se reflejen
            const nuevosPedidos = await new PedidoService().getAllPedidos();
            setAllPedidos(nuevosPedidos);
        } catch (e: any) {
            alert("Error al avanzar el estado del pedido: " + (e?.response?.data?.error || e.message));
        } finally {
            // Siempre quita el ID de carga, ya sea éxito o error
            setLoadingPedidoId(null);
        }
    };


    useEffect(() => {
        (async () => {
            const data = await new PedidoService().getAllPedidos();
            setAllPedidos(data);
        })();
    }, []);

    // Filtrado por estados seleccionados y por ID
    useEffect(() => {
        let pedidosFiltrados = allPedidos;

        if (idBusqueda) {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.id?.toString() === idBusqueda);
        }
        if (selectedEstados.length > 0) {
            pedidosFiltrados = pedidosFiltrados.filter(p => selectedEstados.includes(p.estado));
        }
        if (fechaFiltro) {
            pedidosFiltrados = pedidosFiltrados.filter(p =>
                p.fechaPedido && p.fechaPedido.slice(0, 10) === fechaFiltro
            );
        }
        setFilteredPedidos(pedidosFiltrados);
    }, [allPedidos, selectedEstados, idBusqueda, fechaFiltro]);


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
            {/* FILTROS (BARRA SUPERIOR) */}
            <div className="flex flex-wrap items-center gap-6 justify-center mb-2">
                {/* Filtro por ID */}
                <form
                    onSubmit={handleBuscarPorId}
                    className="flex items-center gap-2"
                    style={{ minWidth: 180 }}
                >
                    <input
                        type="number"
                        className="border rounded px-3 py-2 text-sm shadow-sm"
                        placeholder="Buscar por ID"
                        value={idBusqueda}
                        onChange={(e) => setIdBusqueda(e.target.value)}
                        style={{ minWidth: 120 }}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-3 py-2 text-xs font-medium hover:bg-blue-700 transition"
                    >
                        Buscar
                    </button>
                    {idBusqueda && (
                        <button
                            type="button"
                            className="text-xs text-red-600 ml-1 hover:underline"
                            onClick={() => { setIdBusqueda(""); fetchPedidos(); }}
                        >
                            Limpiar
                        </button>
                    )}
                </form>
                {/* Filtro por Fecha */}
                <div className="flex items-center gap-2" style={{ minWidth: 180 }}>
                    <label className="text-sm font-medium">Fecha:</label>
                    <input
                        type="date"
                        className="border rounded px-3 py-2 text-sm shadow-sm"
                        value={fechaFiltro}
                        onChange={e => setFechaFiltro(e.target.value)}
                        style={{ minWidth: 120 }}
                    />
                    {fechaFiltro && (
                        <button
                            className="text-xs text-red-600 ml-1 hover:underline"
                            type="button"
                            onClick={() => setFechaFiltro("")}
                        >Limpiar</button>
                    )}
                </div>
            </div>

            {/* FILTRO POR ESTADOS (CENTRADO, DEBAJO DE LOS OTROS FILTROS) */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {ESTADOS.map(estado => (
                    <button
                        key={estado}
                        type="button"
                        onClick={() => handleEstadoToggle(estado)}
                        className={
                            "px-4 py-2 rounded-full text-xs font-semibold border shadow-sm transition " +
                            (selectedEstados.includes(estado)
                                ? "bg-blue-600 text-white border-blue-700"
                                : "bg-white text-gray-800 border-gray-300 hover:bg-blue-100")
                        }
                    >
                        {estado.replace(/_/g, " ")}
                    </button>
                ))}
                {selectedEstados.length > 0 && (
                    <button
                        className="ml-2 px-3 py-2 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                        onClick={() => setSelectedEstados([])}
                    >Limpiar</button>
                )}
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
                                        <td className="p-2 text-center font-semibold text-green-700">
                                            ${pedido.total?.toFixed(2) ?? "-"}
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
                                                                {det.promocion.articulosInsumos && det.promocion.articulosInsumos.length > 0 && (
                                                                    <div className="ml-3 text-sm">
                                                                        <span className="font-semibold text-blue-800">Artículos Insumo:</span>
                                                                        <ul className="ml-4 list-disc">
                                                                            {det.promocion.articulosInsumos.map((ins, i) => (
                                                                                <li key={i}>
                                                                                    ({det.cantidad}x) {ins.denominacion}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {/* Artículos Manufacturados (nuevo modelo) */}
                                                                {det.promocion.promocionDetalles && det.promocion.promocionDetalles.length > 0 && (() => {
                                                                    // Agrupar manufacturados por id, sumando cantidad*det.cantidad
                                                                    const agrupados: Record<number, { denominacion: string, cantidad: number }> = {};
                                                                    det.promocion.promocionDetalles.forEach((detalle: any) => {
                                                                        const art = detalle.articuloManufacturado;
                                                                        if (!art) return;
                                                                        const totalCantidad = (detalle.cantidad ?? 1) * (det.cantidad ?? 1);
                                                                        if (!agrupados[art.id]) {
                                                                            agrupados[art.id] = { denominacion: art.denominacion, cantidad: totalCantidad };
                                                                        } else {
                                                                            agrupados[art.id].cantidad += totalCantidad;
                                                                        }
                                                                    });
                                                                    return (
                                                                        <div className="ml-3 text-sm">
                                                                            <span className="font-semibold text-green-800">Artículos Manufacturados:</span>
                                                                            <ul className="ml-4 list-disc">
                                                                                {Object.values(agrupados).map((am, idx) => (
                                                                                    <li key={idx}>
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
                                                                <span className="text-gray-500"> (${det.articuloManufacturado.precioVenta?.toFixed(2)})</span>
                                                                <span className="ml-2 text-green-700 font-bold">
                                                                    (Total: ${(det.articuloManufacturado.precioVenta * det.cantidad).toFixed(2)})
                                                                </span>

                                                            </li>
                                                        ))}

                                                        {/* INSUMOS SUELTOS */}
                                                        {pedido.detalles?.filter(det => !det.promocion && det.articuloInsumo).map((det, idx) => (
                                                            <li key={"insu" + idx} className="mb-3">

                                                                <span className="font-bold text-blue-800">
                                                                    {det.articuloInsumo.denominacion}
                                                                    <span className="text-gray-500"> (x{det.cantidad}) (${det.articuloInsumo.precioVenta?.toFixed(2)})</span>
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