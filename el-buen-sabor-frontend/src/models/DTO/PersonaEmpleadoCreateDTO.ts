// src/models/DTO/PersonaEmpleadoCreateDTO.ts
export interface PersonaEmpleadoCreateDTO {
    nombre: string;
    apellido: string;
    telefono: string;
    fechaNacimiento: string; // ISO: "YYYY-MM-DD"
    usuarioId: number;
    imagenId?: number;
    domicilioIds?: number[];
}
