import { API_ORIGIN } from "../config/api";

const BASE_URL = `${API_ORIGIN}/api/caja`;

export interface ICajaDTO {
    id: number;
    fechaApertura: string;
    fechaCierre: string | null;
    montoInicial: number;
    montoFinalDeclarado: number | null;
    montoFinalCalculado: number | null;
    diferencia: number | null;
    estado: "ABIERTA" | "CERRADA";
    observaciones: string | null;
    empleadoId: number | null;
    empleadoNombre: string | null;
    sucursalId: number | null;
    sucursalNombre: string | null;
    totalVentasEfectivo: number | null;
    totalVentasMercadoPago: number | null;
    totalVentasGeneral: number | null;
}

export const getCajaAbierta = async (empleadoId: number): Promise<ICajaDTO | null> => {
    const res = await fetch(`${BASE_URL}/abierta/${empleadoId}`);
    if (res.status === 204) return null;
    if (!res.ok) throw new Error("Error al consultar la caja abierta");
    return res.json();
};

export const abrirCaja = async (empleadoId: number, sucursalId: number | null, montoInicial: number): Promise<ICajaDTO> => {
    const res = await fetch(`${BASE_URL}/abrir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleadoId, sucursalId, montoInicial }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al abrir la caja");
    }
    return res.json();
};

export const cerrarCaja = async (cajaId: number, montoFinalDeclarado: number, observaciones?: string): Promise<ICajaDTO> => {
    const res = await fetch(`${BASE_URL}/${cajaId}/cerrar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoFinalDeclarado, observaciones }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al cerrar la caja");
    }
    return res.json();
};

export const getHistorialCajas = async (): Promise<ICajaDTO[]> => {
    const res = await fetch(`${BASE_URL}/historial`);
    if (!res.ok) throw new Error("Error al obtener el historial de cajas");
    return res.json();
};
