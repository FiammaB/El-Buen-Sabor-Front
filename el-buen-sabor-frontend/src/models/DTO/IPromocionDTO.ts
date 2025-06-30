import type { IArticuloManufacturadoResponseDTO } from './IAArticuloManufacturadoResponseDTO';
import type { IImagenResponseDTO } from './IImagenResponseDTO';
export interface IPromocionDTO {
    id?: number;
    denominacion: string;
    descripcionDescuento: string; // Usaremos esta como 'descripcion' en el frontend
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    // diasSemana: number[]; // Si necesitas usar esto, inclúyelo
    precioPromocional: number;
    // tipoPromocion: string; // Si es un enum, puedes usar string o crear un type para él
    imagen?: IImagenResponseDTO; // ¡Aquí está la imagen de la promoción!
    articulosManufacturados?: IArticuloManufacturadoResponseDTO[]; // ¡Aquí están los artículos completos!
    // sucursales?: ISucursalDTO[]; // Si necesitas usar esto, inclúyelo
}