// src/models/ArticuloManufacturadoDetalle.ts
import { ArticuloInsumo } from './ArticuloInsumo';

export class ArticuloManufacturadoDetalle {
    id?: number;
    cantidad: number;
    articuloInsumoId: number;
    articuloInsumo?: ArticuloInsumo; // Opcional para la respuesta si se anida

    constructor(
        cantidad: number,
        articuloInsumoId: number,
        id?: number,
        articuloInsumo?: ArticuloInsumo
    ) {
        this.cantidad = cantidad;
        this.articuloInsumoId = articuloInsumoId;
        this.id = id;
        this.articuloInsumo = articuloInsumo;
    }
}