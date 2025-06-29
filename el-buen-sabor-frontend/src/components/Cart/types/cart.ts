import type { ArticuloManufacturado } from "../../../models/Articulos/ArticuloManufacturado"

export interface CartItem {
  id: string|number;
  articulo: ArticuloManufacturado;
  quantity: number;
  subtotal: number;
  esPromocion?: boolean; // nuevo campo opcional
  nombrePromocion?: string; // nombre de la promo si aplica
}


export interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  addToCart: (articulo: ArticuloManufacturado, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
  getItemQuantity: (id: number) => number
}
