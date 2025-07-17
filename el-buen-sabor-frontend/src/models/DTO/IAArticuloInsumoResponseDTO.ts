// src/models/dtos/ArticuloInsumoResponseDTO.ts
import type { IArticuloResponseDTO } from '../DTO/IAArticuloResposeDTO';
import type { IUnidadMedidaResponseDTO } from '../DTO/IUnidadMedidaResponseDTO';

export interface IArticuloInsumoResponseDTO extends IArticuloResponseDTO {
    precioCompra: number;
    stockActual: number;
    stockMinimo: number;
    esParaElaborar: boolean;
    unidadMedidaId: number;
    unidadMedida?: IUnidadMedidaResponseDTO;


    // Objeto anidado
}
