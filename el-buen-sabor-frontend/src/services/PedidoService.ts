// src/services/PedidoService.ts
import axios from "axios";
import type { IPedidoDTO } from '../models/DTO/IPedidoDTO';

const API_BASE_URL = 'http://localhost:8080/api/pedidos';

export class PedidoService {
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

  // Cocinero: Obtener pedidos en preparación o cocina
  async getPedidosEnCocina(): Promise<IPedidoDTO[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cocinero`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener pedidos en preparación:', error.response?.data || error.message);
      throw error;
    }
  }

  // Cocinero/Cajero: Cambiar estado del pedido
  async actualizarEstadoPedido(id: number, nuevoEstado: string): Promise<void> {
    await axios.patch(`${API_BASE_URL}/${id}/estado`, {
      estado: nuevoEstado
    });
  }

  // Cajero: Obtener pedidos listos para cobrar
  async getPedidosParaCobrar(): Promise<IPedidoDTO[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cajero`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener pedidos para cajero:', error.response?.data || error.message);
      throw error;
    }
  }

  // Cajero: Marcar un pedido como cobrado
  async cobrarPedido(id: number): Promise<void> {
    await this.actualizarEstadoPedido(id, "COBRADO");
  }

  // Cocinero: Actualizar hora estimada
  async actualizarHoraEstimada(id: number, nuevaHora: string): Promise<void> {
    await axios.patch(`${API_BASE_URL}/${id}/hora-estimada`, {
      horaEstimadaFinalizacion: nuevaHora,
    });
  }
}

export default PedidoService;
