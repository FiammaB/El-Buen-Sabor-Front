// src/models/ArticuloInsumo.ts
import { Articulo } from './Articulo';
import { UnidadMedida } from '../Categoria/UnidadMedida';
import { Categoria } from '../Categoria/Categoria';
import { Imagen } from '../Categoria/Imagen';
import type { IStockSucursalDTO } from '../DTO/IAArticuloInsumoResponseDTO';

export class ArticuloInsumo extends Articulo {
    precioCompra: number;
    // Stock consolidado (suma de todas las sucursales) — para vistas que todavía no distinguen
    // por sucursal. El detalle real, sucursal por sucursal, está en stockPorSucursal.
    stockActual: number;
    stockMinimo: number;
    stockPorSucursal: IStockSucursalDTO[];
    esParaElaborar: boolean;
    unidadMedidaId: number;
    unidadMedida?: UnidadMedida;

    constructor(
        denominacion: string,
        precioVenta: number,
        categoriaId: number,
        precioCompra: number,
        stockActual: number,
        stockMinimo: number,
        esParaElaborar: boolean,
        unidadMedidaId: number,
        id?: number,
        imagenId?: number,
        imagen?: Imagen,
        categoria?: Categoria,
        unidadMedida?: UnidadMedida,
        baja?: boolean,
        stockPorSucursal?: IStockSucursalDTO[],
    ) {
        super(denominacion, precioVenta, categoriaId, id, imagenId, imagen, categoria, baja);
        this.precioCompra = precioCompra;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.stockPorSucursal = stockPorSucursal ?? [];
        this.esParaElaborar = esParaElaborar;
        this.unidadMedidaId = unidadMedidaId;
        this.unidadMedida = unidadMedida;
    }
}