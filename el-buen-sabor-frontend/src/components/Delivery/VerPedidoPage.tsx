import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { useNavigate } from "react-router-dom";

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

    // Calcular total
    const total = pedido.detalles.reduce((acc, det) => acc + (det.subTotal || 0), 0);

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
                <div><span className="font-semibold">Cliente:</span> {pedido.cliente?.nombre} {pedido.cliente?.apellido}</div>
                <div><span className="font-semibold">Teléfono:</span> {pedido.cliente?.telefono}</div>
                <div>
                    <span className="font-semibold">Dirección de Entrega:</span>{" "}
                    {pedido.domicilio
                        ? `${pedido.domicilio.calle} ${pedido.domicilio.numero}, ${pedido.domicilio.localidad?.nombre ?? ""}`
                        : "-"}
                </div>
                <div><span className="font-semibold">Total:</span> ${total.toFixed(2)}</div>
            </div>

            {/* Lista de artículos */}
            <div>
                <h3 className="font-semibold text-lg mb-2">Artículos:</h3>
                <ul className="space-y-3">
                    {pedido.detalles.map((det, idx) => (
                        <li key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                            {/* Imagen */}
                            <img
                                src={
                                    det.articuloManufacturado?.imagen?.denominacion ||
                                    det.articuloInsumo?.imagen?.denominacion ||
                                    "https://via.placeholder.com/48"
                                }
                                alt="Imagen"
                                className="w-12 h-12 object-cover rounded"
                            />
                            {/* Descripción */}
                            <div className="flex-1">
                                <div className="font-bold">
                                    {det.articuloManufacturado?.denominacion || det.articuloInsumo?.denominacion}
                                </div>
                                <div className="text-xs text-gray-600">
                                    x{det.cantidad} | Subtotal: ${det.subTotal?.toFixed(2)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Precio total abajo */}
            <div className="mt-6 text-right text-xl font-bold text-green-700">
                Total: ${total.toFixed(2)}
            </div>
        </div>
    );
}
