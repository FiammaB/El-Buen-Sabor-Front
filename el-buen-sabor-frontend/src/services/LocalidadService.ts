import axios from "axios";
import type { ILocalidadDTO } from "../models/DTO/ILocalidadDTO";
import type {ILocalidadCreateUpdateDTO} from "../models/DTO/ILocalidadCreateUpdateDTO.ts";

const API_URL = "http://localhost:8080/api/localidades";

export class LocalidadService {
    async getAll(): Promise<ILocalidadDTO[]> {
        const res = await axios.get<ILocalidadDTO[]>(API_URL);
        return res.data;
    }

    async getById(id: number): Promise<ILocalidadDTO> {
        const res = await axios.get<ILocalidadDTO>(`${API_URL}/${id}`);
        return res.data;
    }

    // Nuevo método para crear una localidad
    async create(localidad: ILocalidadCreateUpdateDTO): Promise<ILocalidadDTO> {
        const res = await axios.post<ILocalidadDTO>(API_URL, localidad);
        return res.data;
    }

    // Método para actualizar una localidad (similar a como lo tienes en el backend)
    async update(id: number, localidad: ILocalidadCreateUpdateDTO): Promise<ILocalidadDTO> {
        const res = await axios.put<ILocalidadDTO>(`${API_URL}/${id}`, localidad);
        return res.data;
    }

    // Método para eliminar una localidad
    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`);
    }
}