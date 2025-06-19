import type { IPedidoDTO } from "../models/DTO/IPedidoDTO"

export class MercadoPagoService {
  private baseUrl: string

  constructor() {
    // Use environment variable or hardcoded URL depending on your setup
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api"
  }

  /**
   * Creates a MercadoPago preference for the given order
   * @param pedido Order data
   * @returns The preference ID from MercadoPago
   */
  async createPreference(pedido: IPedidoDTO): Promise<string> {
    console.log("PEDIDO ANTES DEL BACK ", pedido)
    try {
      const response = await fetch(`${this.baseUrl}/mercadoPago/crear-preferencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error creating MercadoPago preference: ${errorData}`)
      }

      // The backend returns the preference ID directly as text
      const preferenceId = await response.text()
      return preferenceId
    } catch (error) {
      console.error("MercadoPago service error:", error)
      throw error
    }
  }
}
