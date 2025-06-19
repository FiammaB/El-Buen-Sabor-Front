// src/models/Articulo.ts
import { Categoria } from '../Categoria/Categoria';
import { Imagen } from '../Categoria/Imagen';

export abstract class Articulo {
    id?: number;
    denominacion: string;
    precioVenta: number;
    imagenId?: number;
    imagen?: Imagen;
    categoriaId: number;
    categoria?: Categoria;
<<<<<<< HEAD
=======
    baja?: boolean;
>>>>>>> login-con-roles

    constructor(
        denominacion: string,
        precioVenta: number,
        categoriaId: number,
        id?: number,
        imagenId?: number,
        imagen?: Imagen,
<<<<<<< HEAD
        categoria?: Categoria
=======
        categoria?: Categoria,
        baja?: boolean
>>>>>>> login-con-roles
    ) {
        this.denominacion = denominacion;
        this.precioVenta = precioVenta;
        this.categoriaId = categoriaId;
        this.id = id;
        this.imagenId = imagenId;
        this.imagen = imagen;
        this.categoria = categoria;
<<<<<<< HEAD
=======
        this.baja = baja;
>>>>>>> login-con-roles
    }
}