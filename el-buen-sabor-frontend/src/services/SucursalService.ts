import { API_ORIGIN } from "../config/api";
const BASE_URL = `${API_ORIGIN}/api/sucursales`;

export interface ISucursalDTO {
    id: number;
    nombre: string;
    horarioApertura?: string;
    horarioCierre?: string;
}

export const getSucursales = async (): Promise<ISucursalDTO[]> => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Error al obtener sucursales");
    return res.json();
};
