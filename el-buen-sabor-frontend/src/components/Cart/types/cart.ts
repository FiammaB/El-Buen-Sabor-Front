import type { Articulo } from "../../../models/Articulos/Articulo"
import type { ArticuloManufacturado } from "../../../models/Articulos/ArticuloManufacturado"

export interface CartItem {
  id: number
  articulo: ArticuloManufacturado
  quantity: number
  subtotal: number
}

export interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  addToCart: (articulo: Articulo, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
  getItemQuantity: (id: number) => number
}
