// src/models/DTO/IClienteDTO.ts
import type {IDomicilioDTO} from "./IDomicilioDTO.ts";
import type {UsuarioDTO} from "./UsuarioDTO.ts";

export interface IClienteDTO {
    id: number;
    nombre?: string;
    apellido: string;
    emailUsuario?: string;
    fechaNacimiento: string;
    telefono: string;
    baja?: boolean;
    domicilios?: IDomicilioDTO[];
    usuario?: UsuarioDTO;
}
