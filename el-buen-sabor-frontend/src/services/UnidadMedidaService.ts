// services/UnidadMedidaService.ts
import axios from "axios";
import { UnidadMedida } from "../models/Categoria/UnidadMedida";

const API_BASE_URL = "http://localhost:8080/api/unidades-medida";

export class UnidadMedidaService {
  async getAll(): Promise<UnidadMedida[]> {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  }
}
