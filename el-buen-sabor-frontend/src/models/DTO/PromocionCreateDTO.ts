export interface PromocionDetalleCreateDTO {
    // Corregido para que el backend lo entienda
    articuloManufacturado: { id: number };
    cantidad: number;
}

export interface PromocionInsumoDetalleCreateDTO {
    // Este ya estaba bien
    articuloInsumoId: number;
    cantidad: number;
}

export interface PromocionCreateDTO {
    denominacion: string;
    descripcionDescuento: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    precioPromocional: number;
    tipoPromocion: string;
    imagenId: number | null;
    promocionDetalles: PromocionDetalleCreateDTO[];
    promocionInsumoDetalles: PromocionInsumoDetalleCreateDTO[];
    sucursalIds: number[];
}