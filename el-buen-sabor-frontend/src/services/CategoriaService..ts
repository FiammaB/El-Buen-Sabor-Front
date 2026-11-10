import axios from "axios"
import type { Categoria } from "../models/Categoria/Categoria"
import { API_ORIGIN } from "../config/api";

const API_BASE_URL = `${API_ORIGIN}/api/categorias`

export class CategoriaService {
  async getAll(): Promise<Categoria[]> {
    const response = await axios.get<Categoria[]>(API_BASE_URL)
    return response.data
  }

  toggleBaja(id: number, baja: boolean): Promise<void> {
    return fetch(`${API_BASE_URL}/${id}/baja?baja=${baja}`, {
      method: 'PATCH',
    }).then(response => {
      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado de baja.');
      }
    });
  }

}