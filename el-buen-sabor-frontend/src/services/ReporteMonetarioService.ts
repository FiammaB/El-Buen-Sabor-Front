const API_URL = "http://localhost:8080/api/reportes/monetario";

export const getReporteMonetario = async (desde: string, hasta: string) => {
    const res = await fetch(`${API_URL}?desde=${desde}&hasta=${hasta}`);
    if (!res.ok) throw new Error("Error al obtener el reporte monetario");
    return res.json();
};
