// src/models/dtos/CategoriaResponseDTO.ts
export interface ICategoriaResponseDTO {
    id?: number;
    denominacion: string;
    categoriaPadreId?: number;
    categoriaPadre?: ICategoriaResponseDTO | null;  // <-- agrega esta línea
    sucursalIds?: number[];
    baja?: boolean;
}
