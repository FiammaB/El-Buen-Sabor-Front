// src/models/ArticuloInsumo.ts
import { Articulo } from './Articulo';
import { UnidadMedida } from '../Categoria/UnidadMedida';
import { Categoria } from '../Categoria/Categoria';
import { Imagen } from '../Categoria/Imagen';

export class ArticuloInsumo extends Articulo {
    precioCompra: number;
    stockActual: number;
    stockMinimo: number;
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
<<<<<<< HEAD
        unidadMedida?: UnidadMedida
    ) {
        super(denominacion, precioVenta, categoriaId, id, imagenId, imagen, categoria);
=======
        unidadMedida?: UnidadMedida,
        baja: boolean = false,
    ) {
        super(denominacion, precioVenta, categoriaId, id, imagenId, imagen, categoria, baja);
>>>>>>> login-con-roles
        this.precioCompra = precioCompra;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.esParaElaborar = esParaElaborar;
        this.unidadMedidaId = unidadMedidaId;
        this.unidadMedida = unidadMedida;
    }
}