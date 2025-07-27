// src/services/DomicilioService.ts
import axios from "axios";
import type { IDomicilioDTO } from "../models/DTO/IDomicilioDTO";

const API_URL = "http://localhost:8080/api/domicilios";

export class DomicilioService {
    async getAll(): Promise<IDomicilioDTO[]> {
        const res = await axios.get<IDomicilioDTO[]>(API_URL);
        return res.data;
    }

    async getById(id: number): Promise<IDomicilioDTO> {
        const res = await axios.get<IDomicilioDTO>(`${API_URL}/${id}`);
        return res.data;
    }

    async create(domicilio: IDomicilioDTO): Promise<IDomicilioDTO> { // Modificado para el endpoint general de creación
        const res = await axios.post<IDomicilioDTO>(API_URL, domicilio);
        return res.data;
    }

    async createForPersona(personaId: number, domicilio: IDomicilioDTO): Promise<IDomicilioDTO> { // Mantengo este método específico para personas
        const res = await axios.post<IDomicilioDTO>(`${API_URL}/persona/${personaId}`, domicilio);
        return res.data;
    }

    async update(id: number, domicilio: IDomicilioDTO): Promise<IDomicilioDTO> { // Modificado para que el ID sea un parámetro
        const res = await axios.put<IDomicilioDTO>(`${API_URL}/${id}`, domicilio);
        return res.data;
    }

    async getByPersonaId(personaId: number): Promise<IDomicilioDTO[]> {
        const res = await axios.get<IDomicilioDTO[]>(`${API_URL}/persona/${personaId}`);
        return res.data;
    }

    // Nuevo método para eliminar un domicilio
    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`);
    }
}