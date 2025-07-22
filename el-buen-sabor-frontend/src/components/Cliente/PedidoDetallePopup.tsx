// src/components/Cliente/PedidoDetallePopup.tsx
import React from "react";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import { X } from "lucide-react";
import { PedidoService } from "../../services/PedidoService";

interface PedidoDetallePopupProps {
    pedido: IPedidoDTO;
    onClose: () => void;
}

export default function PedidoDetallePopup({ pedido, onClose }: PedidoDetallePopupProps) {
    const pedidoService = new PedidoService();

    // Descargar PDF usando downloadFacturaPdf (fuerza descarga)
    const handleDescargarFactura = async () => {
        try {
            const blob = await pedidoService.downloadFacturaPdf(pedido.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `factura_pedido_${pedido.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("No se pudo descargar la factura. Verifica que exista y que el servidor esté funcionando.");
        }
    };

    if (!pedido) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-4 text-orange-600">Detalle del Pedido #{pedido.id}</h2>
                <div className="space-y-2">
                    <div>
                        <b>Fecha:</b> {new Date(pedido.fechaPedido).toLocaleString()}
                    </div>
                    <div>
                        <b>Total:</b> ${pedido.total?.toFixed(2)}
                    </div>
                    <div>
                        <b>Estado:</b> {pedido.estado.replace(/_/g, " ")}
                    </div>
                    <div>
                        <b>Dirección:</b>{" "}
                        {pedido.domicilio
                            ? `${pedido.domicilio.calle} ${pedido.domicilio.numero}, CP ${pedido.domicilio.cp}` +
                            (pedido.domicilio.localidad ? `, ${pedido.domicilio.localidad.nombre}` : "")
                            : "-"}
                    </div>
                    <div>
                        <b>Artículos:</b>
                        <ul className="ml-4 list-disc">
                            {pedido.detalles?.map(det => (
                                <li key={det.id} className="mb-2">
                                    {det.promocion ? (
                                        <div>
                                            <div className="font-bold text-purple-700">
                                                {det.promocion.denominacion} (x{det.cantidad})<br />
                                                <span className="font-normal text-sm text-gray-500">
                                                    Precio unitario: ${det.promocion.precioPromocional?.toFixed(2)}
                                                </span>
                                                <span className="ml-2 font-bold text-green-700">
                                                    Subtotal: ${det.subTotal?.toFixed(2)}
                                                </span>
                                            </div>
                                            {/* Manufacturados dentro de la promo */}
                                            {det.promocion.promocionDetalles && det.promocion.promocionDetalles.length > 0 && (
                                                <div className="ml-3 text-sm">
                                                    <span className="font-semibold text-green-800">Manufacturados:</span>
                                                    <ul className="ml-4 list-disc">
                                                        {det.promocion.promocionDetalles.map((detalle, i) => (
                                                            <li key={i}>
                                                                {detalle.articuloManufacturado?.denominacion || "-"} (x{(detalle.cantidad ?? 1) * (det.cantidad ?? 1)})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Insumos dentro de la promo */}
                                            {det.promocion.articulosInsumos && det.promocion.articulosInsumos.length > 0 && (
                                                <div className="ml-3 text-sm">
                                                    <span className="font-semibold text-blue-800">Insumos:</span>
                                                    <ul className="ml-4 list-disc">
                                                        {det.promocion.articulosInsumos.map((ins, i) => (
                                                            <li key={i}>
                                                                {ins.denominacion} (x{det.cantidad})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Artículo manufacturado o insumo suelto */}
                                            <span className={det.articuloManufacturado ? "font-bold text-green-800" : "font-bold text-blue-800"}>
                                                {det.articuloManufacturado?.denominacion || det.articuloInsumo?.denominacion}
                                            </span>
                                            {" x "}
                                            {det.cantidad}
                                            <span className="ml-2 text-gray-500">
                                                (${(det.articuloManufacturado?.precioVenta ?? det.articuloInsumo?.precioVenta)?.toFixed(2)})
                                            </span>
                                            <span className="ml-2 text-green-700 font-bold">
                                                (Subtotal: ${det.subTotal?.toFixed(2)})
                                            </span>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}