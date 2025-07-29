export interface UsuarioDTO {
    id?: number;
    email: string;
    password?: string;
    username: string;
    rol: "CLIENTE" | "CAJERO" | "DELIVERY" | "COCINERO" | "ADMINISTRADOR";
    baja: boolean;
}
