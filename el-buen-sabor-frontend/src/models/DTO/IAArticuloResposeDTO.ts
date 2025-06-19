// src/models/dtos/ArticuloResponseDTO.ts
// Estas interfaces no importan clases, solo otras interfaces ResponseDTO.
import type { ICategoriaResponseDTO } from './ICategoriaResponseDTO';//'ICategoriaResponseDTO' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled
import type { IImagenResponseDTO } from './IImagenResponseDTO';

export interface IArticuloResponseDTO {
    id?: number;
    denominacion: string;
    precioVenta: number;
<<<<<<< HEAD
=======
    estaDadoDeBaja: boolean;
>>>>>>> login-con-roles
    imagenId?: number;
    imagen?: IImagenResponseDTO; // Objeto anidado
    categoriaId: number;
    categoria?: ICategoriaResponseDTO; // Objeto anidado
}