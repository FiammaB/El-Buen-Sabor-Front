// src/models/DTO/PromocionCreateDTO.ts
// Asegúrate de que TipoPromocion también esté definido en algún lugar (ej. en IPromocionDTO.ts)
// export type TipoPromocion = "HAPPY_HOUR" | "PROMOCION_GENERAL"; // Si es un string literal

export interface PromocionDetalleArticuloDTO {
    id: number;
}
export interface PromocionDetalleDTO {
    cantidad: number;
    // La propiedad es un objeto, no un ID
    articuloManufacturado: PromocionDetalleArticuloDTO; 
}
export interface PromocionCreateDTO {
    denominacion: string;
    descripcionDescuento?: string; // Corresponde a descripcionDescuento en tu backend
    fechaDesde: string; // ISO date string (YYYY-MM-DD)
    fechaHasta: string; // ISO date string (YYYY-MM-DD)
    horaDesde: string; // HH:MM:SS
    horaHasta: string; // HH:MM:SS
    precioPromocional: number;
    tipoPromocion: string; // String que representa el enum de Java (ej. "HAPPY_HOUR")
    imagenId?: number | null; // ID de la imagen en Cloudinary, opcional
    //articuloManufacturadoIds: number[]; // IDs de los ArticulosManufacturados
    promocionDetalles: PromocionDetalleDTO[];
    articuloInsumoIds: number[];
    sucursalIds?: number[]; // Opcional, si las promociones son por sucursal

}