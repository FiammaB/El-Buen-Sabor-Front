import axios from "axios";
import type { UsuarioDTO } from "../models/DTO/UsuarioDTO";

const API_URL = "http://localhost:8080/api/usuarios";

export class UsuarioService {
    // Obtener todos los usuarios
    async getAllUsuarios(): Promise<UsuarioDTO[]> {
        const res = await axios.get<UsuarioDTO[]>(API_URL);
        return res.data;
    }

    // Obtener un usuario por ID
    async getUsuarioById(id: number): Promise<UsuarioDTO> {
        const res = await axios.get<UsuarioDTO>(`${API_URL}/${id}`);
        return res.data;
    }

    // Actualizar usuario por ID (PUT)
    async updateUsuario(id: number, data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
        const res = await axios.put<UsuarioDTO>(`${API_URL}/${id}`, data);
        return res.data;
    }

    // Crear usuario (POST general)
    async createUsuario(data: UsuarioDTO): Promise<UsuarioDTO> {
        const res = await axios.post<UsuarioDTO>(API_URL, data);
        return res.data;
    }

    // Registrar cocinero (POST)
    async registrarCocinero(data: UsuarioDTO): Promise<string> {
        const res = await axios.post(`${API_URL}/registrar-cocinero`, data);
        return res.data; // Retorna un string: "Cocinero creado con ID: ..."
    }

    // Registrar cajero (POST)
    async registrarCajero(data: UsuarioDTO): Promise<string> {
        const res = await axios.post(`${API_URL}/registrar-cajero`, data);
        return res.data;
    }

    // Obtener perfil reducido por email
    async getPerfil(email: string): Promise<{ id: number; usuario: UsuarioDTO }> {
        const res = await axios.get<{ id: number; usuario: UsuarioDTO }>(`${API_URL}/perfil/${email}`);
        return res.data;
    }

    // Actualizar perfil reducido por email
    async actualizarPerfil(email: string, datos: { usuario: UsuarioDTO }): Promise<void> {
        await axios.put(`${API_URL}/perfil/${email}`, datos);
    }

    // Actualizar perfil cliente completo por email
    async actualizarPerfilCliente(email: string, data: any): Promise<void> {
        await axios.put(`${API_URL}/perfil/cliente/${email}`, data);
    }

    async toggleBaja(id: number, baja: boolean): Promise<void> {
        return fetch(`${API_URL}/${id}/baja?baja=${baja}`, {
            method: "PATCH",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo actualizar el estado de baja.");
            }
        });
    }

    async actualizarNombre(id: number, nombre: string): Promise<void> {
        // ⚠️ Este endpoint del backend usa "nombre", no "username".
        await axios.patch(`${API_URL}/${id}/nombre`, { nombre });
    }
}
