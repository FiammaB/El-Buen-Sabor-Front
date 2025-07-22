import type { ReporteMonetarioDTO, ReporteMonetarioDiarioDTO } from "../models/DTO/ReporteMonetarioDTO";

const BASE_URL = "http://localhost:8080/api";
const API_URL = "http://localhost:8080/api/reportes/monetario";


export const getReporteMonetario = async (desde: string, hasta: string) => {
    const res = await fetch(`${API_URL}?desde=${desde}&hasta=${hasta}`);
    if (!res.ok) throw new Error("Error al obtener el reporte monetario");
    return res.json();
};
export const getReporteMonetarioDiario = async (desde: string, hasta: string): Promise<ReporteMonetarioDiarioDTO[]> => {
    // Apunta al nuevo endpoint que creamos en el PedidoController
    const response = await fetch(`${BASE_URL}/pedidos/reporte/monetario-diario?desde=${desde}&hasta=${hasta}`);
    if (!response.ok) throw new Error("Error al obtener el reporte monetario diario.");
    return response.json();
};