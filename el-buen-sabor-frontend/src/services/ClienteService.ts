// src/services/ClienteService.ts
import axios from "axios";
import type {IClienteDTO} from "../models/DTO/IClienteDTO";
import type {PersonaEmpleadoCreateDTO} from "../models/DTO/PersonaEmpleadoCreateDTO.ts";

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
    async createCliente(data: any): Promise<any> {
        // POST genérico para crear personas/empleados/clientes
        const res = await axios.post(API_URL, data);
        return res.data;
    }
    async cambiarEstado(id: number, activo: boolean): Promise<void> {
        await axios.patch(`${API_URL}/${id}/estado`, { activo });
    }

    async toggleBaja(id: number, baja: boolean): Promise<void> {
        const response = await fetch(`${API_URL}/${id}/baja?baja=${baja}`, {
            method: "PATCH",
        });
        if (!response.ok) throw new Error("No se pudo actualizar el estado de baja.");
    }

    async createEmpleadoPersona(data: PersonaEmpleadoCreateDTO): Promise<IClienteDTO> {
        const res = await axios.post<IClienteDTO>(`${API_URL}/empleado`, data);
        return res.data;
    }

}