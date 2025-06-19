const BASE_URL = "http://localhost:8080/api/sucursales";

export const getSucursales = async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Error al obtener sucursales");
    return res.json();
};
