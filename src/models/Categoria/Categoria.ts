// src/models/Categoria.ts
export class Categoria {
    id?: number;
    denominacion: string;
    categoriaPadreId?: number;
    sucursalIds?: number[];

    constructor(
        denominacion: string,
        id?: number,
        categoriaPadreId?: number,
        sucursalIds?: number[]
    ) {
        this.denominacion = denominacion;
        this.id = id;
        this.categoriaPadreId = categoriaPadreId;
        this.sucursalIds = sucursalIds;
    }
}