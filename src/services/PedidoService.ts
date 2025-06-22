// src/services/PedidoService.ts
import axios from 'axios';
import type { IPedidoDTO } from '../models/DTO/IPedidoDTO';

const API_BASE_URL = 'http://localhost:8080/api/pedidos';

export class PedidoService {
  // Enviar un nuevo pedido
  async sendPedido(pedido: IPedidoDTO): Promise<IPedidoDTO> {
    try {
      console.log("PEDIDO: ", pedido);
      const response = await axios.post<IPedidoDTO>(API_BASE_URL, pedido);
      console.log('RESPUESTA:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error al enviar el pedido:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obtener pedidos para el cocinero
  async getPedidosParaCocinero(): Promise<IPedidoDTO[]> {
    try {
      const response = await axios.get<IPedidoDTO[]>(`${API_BASE_URL}/cocinero`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener pedidos del cocinero:', error.response?.data || error.message);
      throw error;
    }
  }
}
