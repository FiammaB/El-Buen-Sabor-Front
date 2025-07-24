export interface IImagenDTO {
    id: number;
    denominacion: string;
}

export interface IArticuloSimpleDTO {
    id: number;
    denominacion: string;
}

export interface IPromocionDetalleDTO {
    id: number;
    cantidad: number;
    articuloManufacturado: IArticuloSimpleDTO;
}

export interface IPromocionInsumoDetalleDTO {
    id: number;
    cantidad: number;
    articuloInsumo: IArticuloSimpleDTO;
}

export interface IPromocionDTO {
    id: number;
    denominacion: string;
    descripcionDescuento: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    precioPromocional: number;
    tipoPromocion: string;
    baja: boolean;
    imagen?: IImagenDTO;
    promocionDetalles: IPromocionDetalleDTO[];
    promocionInsumoDetalles: IPromocionInsumoDetalleDTO[];
}