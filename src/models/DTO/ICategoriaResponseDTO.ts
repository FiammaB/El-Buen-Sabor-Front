// src/models/dtos/CategoriaResponseDTO.ts
export interface ICategoriaResponseDTO {
    id?: number;
    denominacion: string;
    categoriaPadreId?: number;
    sucursalIds?: number[];
}