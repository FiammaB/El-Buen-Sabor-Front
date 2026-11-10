// src/pages/cajero/CajeroAdminLayout.tsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import CajeroSidebar from "./CajeroSidebar";
import CajeroPanelHeader from "./CajeroPanelHeader";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useAutoLogout} from "../Hooks/useAutoLogout.ts";
import { abrirCaja, cerrarCaja, getCajaAbierta, type ICajaDTO } from "../../services/CajaService";
import SucursalSelect from "../Sucursal/SucursalSelect";

export default function CajeroAdminLayout() {
    const { logout, id: userId, sucursalId, setSucursalId } = useAuth();
    const horarioApertura = "08:00";
    const horarioCierre = "20:00";
    useAutoLogout(logout, "empleado", horarioApertura, horarioCierre);

    const [caja, setCaja] = useState<ICajaDTO | null>(null);
    const [cargandoCaja, setCargandoCaja] = useState(true);
    const [montoInicial, setMontoInicial] = useState("");
    const [showCerrarCaja, setShowCerrarCaja] = useState(false);
    const [montoFinal, setMontoFinal] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        getCajaAbierta(userId)
            .then((c) => {
                setCaja(c);
                // Si ya había una caja abierta (ej: recargó la página), la sucursal de la
                // sesión se restaura desde ahí en vez de pedirle que elija de nuevo.
                if (c?.sucursalId) setSucursalId(c.sucursalId);
            })
            .catch(() => setError("No se pudo consultar el estado de la caja."))
            .finally(() => setCargandoCaja(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Mientras la caja está abierta, refrescamos los totales del turno cada tanto
    // (así el cajero ve en vivo cuánto se lleva vendido, sin tener que esperar al cierre).
    useEffect(() => {
        if (!userId || !caja) return;
        const intervalId = setInterval(() => {
            getCajaAbierta(userId).then((c) => c && setCaja(c)).catch(() => {});
        }, 15000);
        return () => clearInterval(intervalId);
    }, [userId, caja?.id]);

    const handleAbrirCaja = async () => {
        if (!userId) return;
        if (!sucursalId) {
            setError("Elegí en qué sucursal vas a trabajar.");
            return;
        }
        const monto = Number(montoInicial);
        if (!Number.isFinite(monto) || monto < 0) {
            setError("Ingresá un monto inicial válido.");
            return;
        }
        try {
            const nuevaCaja = await abrirCaja(userId, sucursalId, monto);
            setCaja(nuevaCaja);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al abrir la caja.");
        }
    };

    const handleCerrarCaja = async () => {
        if (!caja) return;
        const monto = Number(montoFinal);
        if (!Number.isFinite(monto) || monto < 0) {
            setError("Ingresá el monto contado en caja.");
            return;
        }
        try {
            await cerrarCaja(caja.id, monto, observaciones || undefined);
            setCaja(null);
            setShowCerrarCaja(false);
            setMontoFinal("");
            setObservaciones("");
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al cerrar la caja.");
        }
    };

    if (cargandoCaja) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
    }

    if (!caja) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm text-center">
                    <h2 className="text-xl font-bold mb-2">Abrir caja</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Elegí la sucursal donde trabajás este turno e ingresá el monto con el que arrancás,
                        para poder registrar tus ventas en efectivo.
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Sucursal</label>
                    <SucursalSelect value={sucursalId} onChange={setSucursalId} className="w-full border rounded-md px-3 py-2 mb-3" />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={montoInicial}
                        onChange={(e) => setMontoInicial(e.target.value)}
                        placeholder="Monto inicial"
                        className="w-full border rounded-md px-3 py-2 mb-3"
                    />
                    {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                    <button
                        onClick={handleAbrirCaja}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium"
                    >
                        Abrir caja
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <CajeroPanelHeader />
            <div className="bg-purple-50 border-b border-purple-200 px-8 py-2 flex items-center justify-between text-sm flex-wrap gap-2">
                <span className="text-purple-800">
                    Caja abierta desde {new Date(caja.fechaApertura).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    {" "}— Inicial: ${caja.montoInicial.toFixed(2)}
                    {" "}— Efectivo vendido: <strong>${(caja.totalVentasEfectivo ?? 0).toFixed(2)}</strong>
                    {" "}— Mercado Pago: ${(caja.totalVentasMercadoPago ?? 0).toFixed(2)}
                    {" "}— Total turno: <strong>${(caja.totalVentasGeneral ?? 0).toFixed(2)}</strong>
                </span>
                <button
                    onClick={async () => {
                        // Releemos la caja para traer los totales de venta más recientes.
                        if (userId) {
                            const actualizada = await getCajaAbierta(userId).catch(() => null);
                            if (actualizada) setCaja(actualizada);
                        }
                        setShowCerrarCaja(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-1 text-xs font-medium"
                >
                    Cerrar caja
                </button>
            </div>
            <div className="flex">
                <CajeroSidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>

            {showCerrarCaja && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-3">Cerrar caja</h3>

                        <div className="bg-gray-50 rounded-md p-3 mb-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Monto inicial</span>
                                <span className="font-medium">${caja.montoInicial.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ventas en efectivo</span>
                                <span className="font-medium">${(caja.totalVentasEfectivo ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Ventas por Mercado Pago (no se cuenta en caja)</span>
                                <span>${(caja.totalVentasMercadoPago ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 mt-1">
                                <span className="font-semibold">Total del turno</span>
                                <span className="font-semibold">${(caja.totalVentasGeneral ?? 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">
                            Contá el efectivo que tenés físicamente e ingresalo acá. El sistema lo va a comparar
                            con lo que debería haber (monto inicial + ventas en efectivo).
                        </p>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={montoFinal}
                            onChange={(e) => setMontoFinal(e.target.value)}
                            placeholder="Monto contado en caja"
                            className="w-full border rounded-md px-3 py-2 mb-3"
                        />
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Observaciones (opcional)"
                            className="w-full border rounded-md px-3 py-2 mb-3"
                            rows={2}
                        />
                        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCerrarCaja}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium"
                            >
                                Confirmar cierre
                            </button>
                            <button
                                onClick={() => { setShowCerrarCaja(false); setError(null); }}
                                className="flex-1 border border-gray-300 rounded-md py-2 font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
