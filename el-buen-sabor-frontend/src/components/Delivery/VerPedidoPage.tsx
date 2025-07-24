import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";

export default function VerPedidoPage() {
    const { pedidoId } = useParams();
    const [pedido, setPedido] = useState<IPedidoDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!pedidoId) return;
        setLoading(true);
        new PedidoService().getPedidoById(Number(pedidoId))
            .then(setPedido)
            .finally(() => setLoading(false));
    }, [pedidoId]);

    if (loading) return <div className="p-6 text-gray-500">Cargando pedido...</div>;
    if (!pedido) return <div className="p-6 text-red-500">Pedido no encontrado.</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 my-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
            >
                ← Volver
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Detalle del Pedido #{pedido.id}</h2>

            {/* Datos del cliente */}
            <div className="mb-6">
                <div>
                    <span className="font-semibold">Cliente:</span>{" "}
                    {pedido.persona
                        ? (
                            pedido.persona.nombre
                                ? `${pedido.persona.nombre} ${pedido.persona.apellido ?? ""}`
                                : `${pedido.persona.usuario.nombre ?? ""} ${pedido.persona.apellido ?? ""}`
                        ).trim()
                        : pedido.personaId ?? "-"
                    }
                </div>
                <div><span className="font-semibold">Teléfono:</span> {pedido.persona?.telefono}</div>
                <div>
                    <span className="font-semibold">Dirección de Entrega:</span>{" "}
                    {pedido.domicilio
                        ? `${pedido.domicilio.calle} ${pedido.domicilio.numero}, ${pedido.domicilio.localidad?.nombre ?? ""}`
                        : "-"}
                </div>
                <div><span className="font-semibold">Total:</span> ${pedido.total?.toFixed(2)}</div>
            </div>

            {/* Lista de artículos */}
            <div>
                <h3 className="font-semibold text-lg mb-2">Artículos:</h3>
                <ul className="space-y-3">
                    {pedido.detalles.map((det, idx) => (
                        <li key={idx} className="flex items-start gap-4 bg-gray-50 rounded-lg p-3">
                            {/* Si es promoción */}
                            {det.promocion ? (
                                <>
                                    <img
                                        src={det.promocion.imagen?.denominacion || "https://via.placeholder.com/48"}
                                        alt="Imagen promoción"
                                        className="w-16 h-16 object-cover rounded shadow"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-purple-700">
                                            {det.promocion.denominacion}
                                            <span className="ml-2 text-xs text-gray-600">(x{det.cantidad})</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-1">
                                            Subtotal: ${det.subTotal?.toFixed(2)}
                                        </div>
                                        <div className="ml-2">
                                            {/* Manufacturados agrupados */}
                                            {det.promocion.promocionDetalles && det.promocion.promocionDetalles.length > 0 && (
                                                <div className="mb-1">
                                                    <span className="font-semibold text-green-700">Manufacturados:</span>
                                                    <ul className="ml-3 list-disc text-sm">
                                                        {det.promocion.promocionDetalles.map((detalle, i) => (
                                                            <li key={i}>
                                                                {detalle.articuloManufacturado?.denominacion || "-"} (x{detalle.cantidad * det.cantidad})
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
                                    </div>
                                </>
                            ) : (
                                // No es promo: manufacturado o insumo suelto
                                <>
                                    <img
                                        src={
                                            det.articuloManufacturado?.imagen?.denominacion ||
                                            det.articuloInsumo?.imagen?.denominacion ||
                                            "https://via.placeholder.com/48"
                                        }
                                        alt="Imagen"
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-red-800">
                                            {det.articuloManufacturado?.denominacion || det.articuloInsumo?.denominacion}
                                            <span className="ml-2 text-xs text-gray-600">(x{det.cantidad})</span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Subtotal: ${det.subTotal?.toFixed(2)}
                                        </div>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Precio total abajo */}
            <div className="mt-6 text-right text-xl font-bold text-green-700">
                Total: ${pedido.total?.toFixed(2)}
            </div>
        </div>
    );
}
