// models/DTO/IEmpleadoDTO.ts
export interface IEmpleadoDTO {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    baja?: boolean;

}