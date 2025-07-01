// src/models/DTO/IDomicilioDTO.ts
export interface IDomicilioDTO {
    id: number;
    calle: string;
    numero: number;
    cp: number;
    localidad: {
        id: number;
        nombre: string;
        provincia: {
            id: number;
            nombre: string;
            pais: {
                id: number;
                nombre: string;
            }
        }
    }
}