import type { IPromocionDTO } from "../models/DTO/IPromocionDTO";

const API_URL = "http://localhost:8080/api/promociones";

export const crearPromocion = async (data: IPromocionDTO) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al crear la promoción");
    }

    return await response.json();
};

export const getPromociones = async (): Promise<IPromocionDTO[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Error al obtener promociones");
    }
    return await response.json();
};
