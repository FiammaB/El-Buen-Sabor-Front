export interface UsuarioDTO {
    id?: number;
    email: string;
    password?: string;
    nombre: string;
    rol: "CLIENTE" | "CAJERO" | "DELIVERY" | "COCINERO" | "ADMINISTRADOR";
    baja: boolean;
}