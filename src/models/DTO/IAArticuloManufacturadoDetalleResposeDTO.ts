import type { IArticuloInsumoResponseDTO } from './IAArticuloInsumoResponseDTO';

export interface IArticuloManufacturadoDetalleResponseDTO {
    id?: number;
    cantidad: number;
    articuloInsumoId: number;
    articuloInsumo?: IArticuloInsumoResponseDTO; // Objeto anidado
}