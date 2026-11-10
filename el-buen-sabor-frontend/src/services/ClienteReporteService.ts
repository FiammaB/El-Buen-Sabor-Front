import { API_ORIGIN } from "../config/api";
// src/services/ClienteReporteService.ts

import type { ClienteReporteDTO } from "../models/DTO/ClienteReporteDTO";

const BASE_URL = `${API_ORIGIN}/api/pedidos`;

export const getReporteClientes = async (
    desde: string,
    hasta: string,
    ordenarPor: string
): Promise<ClienteReporteDTO[]> => {
    const response = await fetch(
        `${BASE_URL}/reporte/clientes?desde=${desde}&hasta=${hasta}&orden=${ordenarPor}`
    );

    if (!response.ok) {
        throw new Error("Error al obtener el reporte de clientes");
    }

    return response.json();
};
