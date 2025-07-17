export interface UsuarioDTO {
    id?: number;
    email: string;
    password?: string;
    username: string;  // ✅ Ahora coincide con la entidad Usuario del backend
    rol: "CLIENTE" | "CAJERO" | "DELIVERY" | "COCINERO" | "ADMINISTRADOR";
    baja: boolean;
}
