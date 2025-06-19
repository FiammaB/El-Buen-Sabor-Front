// src/models/DTO/PromocionCreateDTO.ts
export interface PromocionCreateDTO {
    denominacion: string;
    descripcionDescuento: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    precioPromocional: number;
    tipoPromocion: string;
    articulosManufacturados: number[];
    sucursales: number[];
    cantidadMinima?: number;
    porcentajeDescuento?: number;
    montoMinimo?: number;
    articuloRegaloId?: number;
    imagenId?: number;
    articuloManufacturadoIds: number[];
    articulos: {
        articuloId: number;
        cantidad: number;
    }[];
}


