import type { IImagenResponseDTO } from './IImagenResponseDTO';
import type { IArticuloInsumoResponseDTO } from './IAArticuloInsumoResponseDTO';

// Esta interfaz es para el artículo manufacturado dentro del detalle
export interface IArticuloManufacturadoDTO {
    id: number;
    denominacion: string;
}

// Esta interfaz representa una línea de detalle en la promoción (con cantidad)
export interface IPromocionDetalleDTO {
    id: number;
    cantidad: number;
    articuloManufacturado: IArticuloManufacturadoDTO;
}

// Esta es la interfaz principal y corregida de la Promoción
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
    baja: boolean; // Propiedad 'baja' correctamente definida

    imagen?: IImagenResponseDTO;
    
    // SE ELIMINA LA PROPIEDAD ANTIGUA
    // articulosManufacturados: IArticuloManufacturadoResponseDTO[]; 
    
    // SE AÑADE LA NUEVA PROPIEDAD EN SU LUGAR
    promocionDetalles: IPromocionDetalleDTO[];

    articulosInsumos?: IArticuloInsumoResponseDTO[];
    sucursales?: { id: number; denominacion: string }[];
}