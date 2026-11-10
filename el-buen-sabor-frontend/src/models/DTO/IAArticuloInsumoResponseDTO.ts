// src/models/dtos/ArticuloInsumoResponseDTO.ts
import type { IArticuloResponseDTO } from '../DTO/IAArticuloResposeDTO';
import type { IUnidadMedidaResponseDTO } from '../DTO/IUnidadMedidaResponseDTO';

// El stock ya no es un número global (ver StockSucursal en el backend) — viene desglosado
// por sucursal acá. stockActual/stockMinimo NO los manda más el backend en la raíz del DTO.
export interface IStockSucursalDTO {
    sucursalId: number;
    sucursalNombre: string;
    stockActual: number;
    stockMinimo: number;
    baja: boolean;
}

export interface IArticuloInsumoResponseDTO extends IArticuloResponseDTO {
    precioCompra: number;
    esParaElaborar: boolean;
    unidadMedidaId: number;
    unidadMedida?: IUnidadMedidaResponseDTO;
    stockPorSucursal?: IStockSucursalDTO[];


    // Objeto anidado
}
