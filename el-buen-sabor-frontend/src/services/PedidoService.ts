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

  async getAllPedidos(): Promise<IPedidoDTO[]> {
    try {
      const response = await axios.get<IPedidoDTO[]>(API_BASE_URL);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener todos los pedidos:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPedidosByEstado(estado: string): Promise<IPedidoDTO[]> {
    const response = await axios.get(`${API_BASE_URL}/estado/${encodeURIComponent(estado)}`);
    return response.data;
  }

  async getPedidoById(id: number): Promise<IPedidoDTO | null> {
    try {
      const response = await axios.get<IPedidoDTO>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      // Si no existe, devolver null (manejo de error 404)
      if (error.response && error.response.status === 404) return null;
      console.error('Error al buscar pedido por ID:', error.response?.data || error.message);
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
  async actualizarEstadoPedido(id: number, payload: { estado: string, empleadoId?: number }): Promise<void> {
    await axios.patch(`${API_BASE_URL}/${id}/estado`, payload);
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

  async getPedidosByClienteId(personaId: number): Promise<IPedidoDTO[]> {
    try {
      const response = await axios.get<IPedidoDTO[]>(`${API_BASE_URL}/persona/${personaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener pedidos para el cliente ${personaId}:`, error);
      throw error;
    }
  }

  async getFacturaPdfUrl(pedidoId: number): Promise<string> {
    try {
      const response = await axios.get<string>(`${API_BASE_URL}/${pedidoId}/factura-pdf`, { responseType: 'text' });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la URL del PDF de la factura para el pedido ${pedidoId}:`, error);
      throw error;
    }
  }

  async downloadFacturaPdf(pedidoId: number): Promise<Blob> { // <-- Cambiado el tipo de retorno a Blob
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${pedidoId}/descargar-factura`, // <-- ¡Nuevo endpoint de descarga!
        { responseType: 'blob' } // <-- ¡Importante: espera una respuesta binaria (blob)!
      );
      return response.data as Blob; // Type 'unknown' is not assignable to type 'Blob'
    } catch (error) {
      console.error(`Error al descargar el PDF de la factura para el pedido ${pedidoId}:`, error);
      throw error;
    }
  }


  async anularPedidoConNotaCredito(
    pedidoId: number,
    anulacion: { usuarioAnuladorId: number, motivoAnulacion: string }
  ): Promise<any> {
    const response = await axios.patch(`${API_BASE_URL}/${pedidoId}/anular`, anulacion);
    return response.data;

  }


}

export default PedidoService;
