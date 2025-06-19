"use client"

import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "../context/cart-context"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Carrito ({totalItems})</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm">Agrega algunos productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={
                        item.articulo.imagen?.denominacion && item.articulo.imagen.denominacion.length > 0
                          ? item.articulo.imagen.denominacion
                          : "/placeholder.svg?height=60&width=60"
                      }
                      alt={item.articulo.denominacion}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.articulo.denominacion}</h3>
                      <p className="text-orange-500 font-bold">${item.articulo.precioVenta}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-orange-500">${totalAmount.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-200">
                  Proceder al Pago
                </button>

                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
