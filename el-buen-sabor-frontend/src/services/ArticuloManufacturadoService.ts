import { API_ORIGIN } from "../config/api";
const BASE_URL = `${API_ORIGIN}/api/articuloManufacturado`;

export const getArticulosManufacturados = async () => {
    const res = await fetch(`${BASE_URL}/manufacturados`);
    if (!res.ok) throw new Error("Error al obtener artículos");
    return res.json();
};
