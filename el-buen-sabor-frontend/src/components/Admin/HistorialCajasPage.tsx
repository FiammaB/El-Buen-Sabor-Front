import { useEffect, useState } from "react";
import { getHistorialCajas, type ICajaDTO } from "../../services/CajaService";

export default function HistorialCajasPage() {
    const [cajas, setCajas] = useState<ICajaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getHistorialCajas()
            .then(setCajas)
            .catch(() => setError("No se pudo cargar el historial de cajas."))
            .finally(() => setLoading(false));
    }, []);

    const formatFecha = (fecha: string | null) =>
        fecha ? new Date(fecha).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

    const formatMonto = (monto: number | null) => (monto != null ? `$${monto.toFixed(2)}` : "-");

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Historial de Cajas</h2>

            {loading && <p className="text-gray-500">Cargando...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded shadow bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">ID</th>
                                <th className="p-2">Empleado</th>
                                <th className="p-2">Apertura</th>
                                <th className="p-2">Cierre</th>
                                <th className="p-2">Monto inicial</th>
                                <th className="p-2">Ventas efectivo</th>
                                <th className="p-2">Ventas Mercado Pago</th>
                                <th className="p-2">Total turno</th>
                                <th className="p-2">Declarado</th>
                                <th className="p-2">Diferencia</th>
                                <th className="p-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cajas.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center p-4 text-gray-500">
                                        No hay cajas registradas todavía.
                                    </td>
                                </tr>
                            ) : (
                                cajas.map((caja) => (
                                    <tr key={caja.id} className="border-t">
                                        <td className="p-2 text-center font-bold">{caja.id}</td>
                                        <td className="p-2 text-center">{caja.empleadoNombre ?? "-"}</td>
                                        <td className="p-2 text-center">{formatFecha(caja.fechaApertura)}</td>
                                        <td className="p-2 text-center">{formatFecha(caja.fechaCierre)}</td>
                                        <td className="p-2 text-center">{formatMonto(caja.montoInicial)}</td>
                                        <td className="p-2 text-center">{formatMonto(caja.totalVentasEfectivo)}</td>
                                        <td className="p-2 text-center text-gray-500">{formatMonto(caja.totalVentasMercadoPago)}</td>
                                        <td className="p-2 text-center font-semibold">{formatMonto(caja.totalVentasGeneral)}</td>
                                        <td className="p-2 text-center">{formatMonto(caja.montoFinalDeclarado)}</td>
                                        <td className={`p-2 text-center font-medium ${
                                            caja.diferencia == null ? "" : caja.diferencia === 0 ? "text-green-600" : "text-red-600"
                                        }`}>
                                            {caja.diferencia != null ? formatMonto(caja.diferencia) : "-"}
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                caja.estado === "ABIERTA" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                                            }`}>
                                                {caja.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
