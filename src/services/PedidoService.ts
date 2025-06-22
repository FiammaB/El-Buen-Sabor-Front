import axios from 'axios'
import type { IPedidoDTO } from '../models/DTO/IPedidoDTO'

const API_BASE_URL = 'http://localhost:8080/api/pedidos'

export class PedidoService {
  async sendPedido(pedido: IPedidoDTO): Promise<IPedidoDTO> {
    try {
	 console.log("PEDIDO: ", pedido)
      const response = await axios.post<IPedidoDTO>(API_BASE_URL, pedido)
      console.log('RESPUESTA:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error al enviar el pedido:', error.response?.data || error.message)
      throw error
    }
  }
}
