const BASE_URL = "http://localhost:8080/api/articuloManufacturado";

export const getArticulosManufacturados = async () => {
    const res = await fetch(`${BASE_URL}/manufacturados`);
    if (!res.ok) throw new Error("Error al obtener artículos");
    return res.json();
};
