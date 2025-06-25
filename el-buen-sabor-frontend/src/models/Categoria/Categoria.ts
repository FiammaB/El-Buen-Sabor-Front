// src/models/Categoria.ts
export class Categoria {
    id?: number;
    denominacion: string;
    categoriaPadre?: Categoria | null;
    categoriaPadreId?: number;
    sucursalIds?: number[];
    baja?: boolean;

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