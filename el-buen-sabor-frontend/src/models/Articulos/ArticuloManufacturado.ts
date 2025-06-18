// src/models/ArticuloManufacturado.ts
import { Articulo } from './Articulo';
import { ArticuloManufacturadoDetalle } from './ArticuloManufacturadoDetalle';
import { Categoria } from '../Categoria/Categoria';
import { Imagen } from '../Categoria/Imagen';
import { UnidadMedida } from '../Categoria/UnidadMedida'; // Si ArticuloManufacturado puede tener unidad de medida

export class ArticuloManufacturado extends Articulo {
    descripcion: string;
    tiempoEstimadoMinutos: number;
    preparacion: string;
    unidadMedidaId?: number; // Si aplica o se gestiona internamente
    unidadMedida?: UnidadMedida; // Para la respuesta
    detalles: ArticuloManufacturadoDetalle[];

    constructor(
        denominacion: string,
        precioVenta: number,
        categoriaId: number,
        descripcion: string,
        tiempoEstimadoMinutos: number,
        preparacion: string,
        detalles: ArticuloManufacturadoDetalle[],
        id?: number,
        imagenId?: number,
        imagen?: Imagen,
        categoria?: Categoria,
        unidadMedidaId?: number,
        unidadMedida?: UnidadMedida,

    ) {
        super(denominacion, precioVenta, categoriaId, id, imagenId, imagen, categoria);
        this.descripcion = descripcion;
        this.tiempoEstimadoMinutos = tiempoEstimadoMinutos;
        this.preparacion = preparacion;
        this.detalles = detalles;
        this.unidadMedidaId = unidadMedidaId;
        this.unidadMedida = unidadMedida;

    }
}