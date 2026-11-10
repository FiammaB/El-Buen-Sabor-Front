import { useEffect, useMemo, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import { getPromociones } from "../../services/PromocionService";
import { PedidoService } from "../../services/PedidoService";
import { useAuth } from "../Auth/Context/AuthContext";
import type { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";

type ItemVendible = {
    key: string; // "articulo-12" o "promocion-3"
    articuloId?: number;
    promocionId?: number;
    denominacion: string;
    precio: number;
};

type ItemCarrito = ItemVendible & { cantidad: number; observaciones?: string };

export default function RegistrarVentaPage() {
    const { id: empleadoId } = useAuth();
    const [items, setItems] = useState<ItemVendible[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [formaPago, setFormaPago] = useState<"EFECTIVO" | "MERCADO_PAGO">("EFECTIVO");
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const articuloService = new ArticuloService();
                const [manufacturados, promociones] = await Promise.all([
                    articuloService.findAllArticulosManufacturadosActivos(),
                    getPromociones(),
                ]);

                const itemsArticulos: ItemVendible[] = manufacturados.map((a: ArticuloManufacturado) => ({
                    key: `articulo-${a.id}`,
                    articuloId: a.id,
                    denominacion: a.denominacion,
                    precio: a.precioVenta,
                }));

                const itemsPromos: ItemVendible[] = promociones
                    .filter((p: IPromocionDTO) => !p.baja)
                    .map((p: IPromocionDTO) => ({
                        key: `promocion-${p.id}`,
                        promocionId: p.id,
                        denominacion: `${p.denominacion} (promo)`,
                        precio: p.precioPromocional,
                    }));

                setItems([...itemsArticulos, ...itemsPromos]);
            } catch {
                setMensaje({ tipo: "error", texto: "No se pudieron cargar los productos." });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const itemsFiltrados = useMemo(() => {
        if (!busqueda) return items;
        return items.filter((i) => i.denominacion.toLowerCase().includes(busqueda.toLowerCase()));
    }, [items, busqueda]);

    const agregarAlCarrito = (item: ItemVendible) => {
        setCarrito((prev) => {
            const existente = prev.find((i) => i.key === item.key);
            if (existente) {
                return prev.map((i) => (i.key === item.key ? { ...i, cantidad: i.cantidad + 1 } : i));
            }
            return [...prev, { ...item, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (key: string, cantidad: number) => {
        if (cantidad <= 0) {
            setCarrito((prev) => prev.filter((i) => i.key !== key));
            return;
        }
        setCarrito((prev) => prev.map((i) => (i.key === key ? { ...i, cantidad } : i)));
    };

    const cambiarObservaciones = (key: string, observaciones: string) => {
        setCarrito((prev) => prev.map((i) => (i.key === key ? { ...i, observaciones } : i)));
    };

    const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

    const confirmarVenta = async () => {
        if (!empleadoId) return;
        if (carrito.length === 0) {
            setMensaje({ tipo: "error", texto: "Agregá al menos un producto." });
            return;
        }
        setEnviando(true);
        setMensaje(null);
        try {
            const pedidoService = new PedidoService();
            await pedidoService.registrarVentaMostrador(
                empleadoId,
                carrito.map((i) => ({
                    articuloId: i.articuloId,
                    promocionId: i.promocionId,
                    cantidad: i.cantidad,
                    observaciones: i.observaciones || undefined,
                })),
                formaPago
            );
            setMensaje({
                tipo: "ok",
                texto: `¡Venta registrada! Se descontó el stock y quedó cobrada por ${formaPago === "EFECTIVO" ? "efectivo" : "Mercado Pago"}.`,
            });
            setCarrito([]);
        } catch (e: any) {
            setMensaje({ tipo: "error", texto: e.response?.data?.message || "No se pudo registrar la venta." });
        } finally {
            setEnviando(false);
        }
    };

    if (loading) return <p className="text-gray-500">Cargando productos...</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catálogo */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Registrar venta de mostrador</h2>
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar producto o promo..."
                    className="w-full border rounded-md px-3 py-2 mb-4"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {itemsFiltrados.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => agregarAlCarrito(item)}
                            className="bg-white border rounded-lg p-3 text-left hover:border-purple-500 hover:shadow transition"
                        >
                            <div className="font-medium text-sm">{item.denominacion}</div>
                            <div className="text-purple-700 font-semibold">${item.precio.toFixed(2)}</div>
                        </button>
                    ))}
                    {itemsFiltrados.length === 0 && (
                        <p className="text-gray-500 col-span-full">No se encontraron productos.</p>
                    )}
                </div>
            </div>

            {/* Carrito */}
            <div className="bg-white rounded-lg shadow p-4 h-fit sticky top-4">
                <h3 className="font-bold text-lg mb-3">Venta actual</h3>
                {carrito.length === 0 ? (
                    <p className="text-gray-500 text-sm">Todavía no agregaste productos.</p>
                ) : (
                    <div className="space-y-2 mb-4">
                        {carrito.map((item) => (
                            <div key={item.key} className="border-b pb-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex-1">
                                        <div>{item.denominacion}</div>
                                        <div className="text-gray-500">${item.precio.toFixed(2)} c/u</div>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.cantidad}
                                        onChange={(e) => cambiarCantidad(item.key, Number(e.target.value))}
                                        className="w-14 border rounded px-1 py-1 text-center mx-2"
                                    />
                                    <span className="font-medium w-16 text-right">
                                        ${(item.precio * item.cantidad).toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={item.observaciones ?? ""}
                                    onChange={(e) => cambiarObservaciones(item.key, e.target.value)}
                                    placeholder="Aclaración, ej: sin lechuga"
                                    className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between font-bold border-t pt-2 mb-4">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                <label className="text-sm font-medium block mb-1">Forma de pago</label>
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setFormaPago("EFECTIVO")}
                        className={`flex-1 rounded-md py-2 text-sm font-medium border ${
                            formaPago === "EFECTIVO"
                                ? "bg-purple-600 text-white border-purple-600"
                                : "text-gray-700 border-gray-300"
                        }`}
                    >
                        Efectivo
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormaPago("MERCADO_PAGO")}
                        className={`flex-1 rounded-md py-2 text-sm font-medium border ${
                            formaPago === "MERCADO_PAGO"
                                ? "bg-purple-600 text-white border-purple-600"
                                : "text-gray-700 border-gray-300"
                        }`}
                    >
                        Mercado Pago
                    </button>
                </div>
                {formaPago === "MERCADO_PAGO" && (
                    <p className="text-xs text-gray-500 mb-3">
                        Cobrá con el posnet, QR o alias de Mercado Pago fuera de la app, y después registrá
                        la venta acá para descontar el stock. No se suma al efectivo de la caja.
                    </p>
                )}

                {mensaje && (
                    <p className={`text-sm mb-3 ${mensaje.tipo === "ok" ? "text-green-600" : "text-red-600"}`}>
                        {mensaje.texto}
                    </p>
                )}

                <button
                    onClick={confirmarVenta}
                    disabled={enviando || carrito.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-md py-2 font-medium"
                >
                    {enviando ? "Registrando..." : `Confirmar venta (${formaPago === "EFECTIVO" ? "efectivo" : "Mercado Pago"})`}
                </button>
            </div>
        </div>
    );
}
