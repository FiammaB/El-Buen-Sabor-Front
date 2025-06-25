import type { ProductoRankingDTO } from "../models/DTO/ProductoRankingDTO";

const BASE_URL = "http://localhost:8080/api/detallepedido";

export const getRanking = async (desde: string, hasta: string): Promise<ProductoRankingDTO[]> => {
    
    const response = await fetch(`${BASE_URL}/ranking?desde=${desde}&hasta=${hasta}`);
    if (!response.ok) throw new Error("Error al obtener ranking de productos");
    return response.json();
};

