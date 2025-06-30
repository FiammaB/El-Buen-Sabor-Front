// src/services/PromocionService.ts

import type { IPromocionDTO } from "../models/DTO/IPromocionDTO";
// Asumimos que esta es la interfaz que usas para crear/actualizar una promoción desde el frontend.
// Si tu backend espera un DTO específico para crear (ej. PromocionCreateDTO), ajústalo aquí.
// Basado en tu backend PedidoServiceImpl, la interfaz del frontend debería ser más bien como PromocionCreateDTO:
import type { PromocionCreateDTO } from "../models/DTO/PromocionCreateDTO"; // <-- Asegúrate que tienes esta interfaz en tu frontend

const API_URL = "http://localhost:8080/api/promociones"; // Ruta base de tu API de promociones

/**
 * Crea una nueva promoción.
 * @param data Los datos de la promoción a crear, incluyendo los IDs de artículos y la imagen si aplica.
 * @returns La promoción creada.
 */
export const crearPromocion = async (data: PromocionCreateDTO): Promise<IPromocionDTO> => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // Intentar leer el mensaje de error del backend si está disponible
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error al crear la promoción: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Obtiene todas las promociones.
 * @returns Un array de promociones.
 */
export const getPromociones = async (): Promise<IPromocionDTO[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener promociones: ${response.statusText}`);
    }
    return await response.json();
};

/**
 * Obtiene una promoción por su ID.
 * @param id El ID de la promoción.
 * @returns La promoción encontrada.
 */
export const getPromocionById = async (id: number): Promise<IPromocionDTO> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Error al obtener la promoción con ID ${id}: ${response.statusText}`);
    }
    return await response.json();
};

/**
 * Actualiza una promoción existente.
 * @param id El ID de la promoción a actualizar.
 * @param data Los datos actualizados de la promoción.
 * @returns La promoción actualizada.
 */
export const updatePromocion = async (id: number, data: PromocionCreateDTO): Promise<IPromocionDTO> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error al actualizar la promoción con ID ${id}: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Elimina (da de baja) una promoción.
 * @param id El ID de la promoción a eliminar.
 */
export const deletePromocion = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE", // Asumiendo que DELETE da de baja lógicamente
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error al eliminar la promoción con ID ${id}: ${response.statusText}`);
    }
    // No retorna nada si la operación fue exitosa (204 No Content)
};

/**
 * Activa una promoción.
 * @param id El ID de la promoción a activar.
 */
export const activatePromocion = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/activate`, {
        method: "PATCH", // O PUT si tu endpoint espera PUT
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error al activar la promoción con ID ${id}: ${response.statusText}`);
    }
};

/**
 * Desactiva (da de baja) una promoción.
 * @param id El ID de la promoción a desactivar.
 */
export const deactivatePromocion = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/deactivate`, {
        method: "PATCH", // O PUT si tu endpoint espera PUT
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || `Error al desactivar la promoción con ID ${id}: ${response.statusText}`);
    }
};