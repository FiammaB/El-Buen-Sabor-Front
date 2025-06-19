import type { IArticuloResponseDTO } from './IAArticuloResposeDTO';
import type { IArticuloManufacturadoDetalleResponseDTO } from './IAArticuloManufacturadoDetalleResposeDTO';
import type { IUnidadMedidaResponseDTO } from './IUnidadMedidaResponseDTO';

export interface IArticuloManufacturadoResponseDTO extends IArticuloResponseDTO {
    descripcion: string;
    tiempoEstimadoMinutos: number;
    preparacion: string;
    unidadMedidaId?: number;
    unidadMedida?: IUnidadMedidaResponseDTO;
    detalles: IArticuloManufacturadoDetalleResponseDTO[]; // Array de interfaces anidadas
}