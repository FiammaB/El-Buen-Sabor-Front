import type { IArticuloManufacturadoResponseDTO } from './IAArticuloManufacturadoResponseDTO';
import type { IImagenResponseDTO } from './IImagenResponseDTO';
import type { IArticuloInsumoResponseDTO } from './IAArticuloInsumoResponseDTO';
export interface IPromocionDTO {
    id: number; // El ID de la promoción, crucial para el ABM
    denominacion: string;
    descripcionDescuento: string; // Coincide con tu backend
    fechaDesde: string; // Formato "YYYY-MM-DD"
    fechaHasta: string; // Formato "YYYY-MM-DD"
    horaDesde: string; // Formato "HH:MM:SS"
    horaHasta: string; // Formato "HH:MM:SS"
    precioPromocional: number;

    // <-- CAMBIO CLAVE: Asegura que tipoPromocion esté aquí
    tipoPromocion: "HAPPY_HOUR" | "PROMOCION_GENERAL" | string; // Puede ser un enum o string genérico
    articulosInsumo?: IArticuloInsumoResponseDTO[];
    imagen?: IImagenResponseDTO; // La imagen de la promoción
    articulosManufacturados: IArticuloManufacturadoResponseDTO[]; // Los artículos que componen la promoción
    sucursales?: { id: number; denominacion: string }[]; // Las sucursales asociadas a la promoción
    baja?: boolean; // Para la baja lógica
}