// src/models/DTO/IClienteDTO.ts
export interface IClienteDTO {
    id: number;
    nombreUsuario?: string;
    apellido: string;
    emailUsuario?: string;
    fechaNacimiento: string;
    telefono: string;
    baja?: boolean;
    domicilios?: DomicilioDTO[];
}
