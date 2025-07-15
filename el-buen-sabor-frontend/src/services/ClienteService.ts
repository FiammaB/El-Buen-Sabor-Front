// src/services/ClienteService.ts
import axios from "axios";
import type {IClienteDTO} from "../models/DTO/IClienteDTO";

const API_URL = "http://localhost:8080/api/persona";

export class ClienteService {
    async getAllClientes(): Promise<IClienteDTO[]> {
        const res = await axios.get<IClienteDTO[]>(API_URL);
        return res.data;
    }
    async getClienteById(id: number): Promise<IClienteDTO> {
        const res = await axios.get<IClienteDTO>(`${API_URL}/${id}`);
        return res.data;
    }
    async updateCliente(id: number, data: Partial<IClienteDTO>): Promise<IClienteDTO> {
        const res = await axios.put<IClienteDTO>(`${API_URL}/${id}`, data);
        return res.data;
    }
    async cambiarEstado(id: number, activo: boolean): Promise<void> {
        await axios.patch(`${API_URL}/${id}/estado`, { activo });
    }

    async toggleBaja(id: number, baja: boolean): Promise<void> {
        await axios.patch(`${API_URL}/${id}/baja?baja=${baja}`);
    }
}
