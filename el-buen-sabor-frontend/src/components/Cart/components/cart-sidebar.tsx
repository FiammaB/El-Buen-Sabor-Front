// src/components/Cart/CartSidebar.tsx

"use client"; // Esta directiva es común en algunos frameworks como Next.js para indicar que es un componente de cliente. Mantener si tu proyecto lo usa.

import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"; // Iconos de Lucide React
import { useCart } from "../context/cart-context"; // Asegúrate de que esta ruta sea correcta para tu contexto de carrito
import { useNavigate } from "react-router-dom"; // Hook para la navegación programática

// Importar los tipos necesarios para manejar Articulos y Promociones
import type { Articulo } from '../../../models/Articulos/Articulo';
import type { IPromocionDTO } from "../../../models/DTO/IPromocionDTO";

interface CartSidebarProps {
  isOpen: boolean; // Indica si el sidebar está abierto
  onClose: () => void; // Función para cerrar el sidebar
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // Obtiene las funciones y el estado del carrito desde el contexto
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate(); // Inicializa el hook de navegación

  // Si el sidebar no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay: Fondo semi-transparente que cubre el resto de la página cuando el sidebar está abierto */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Sidebar principal: Se posiciona a la derecha de la pantalla */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Encabezado del Sidebar */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Carrito ({totalItems})</h2> {/* Muestra el total de ítems */}
            </div>
            {/* Botón para cerrar el sidebar */}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido de los ítems del carrito: Scrollable si hay muchos productos */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              // Mensaje cuando el carrito está vacío
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm">Agrega algunos productos para comenzar</p>
              </div>
            ) : (
              // Lista de productos en el carrito
              <div className="space-y-4">
                {items.map((item) => {
                  // Accede al item comprable (Articulo o Promocion)
                  const itemData = item.purchasableItem;
                  let imageUrl: string = "/placeholder.svg?height=60&width=60"; // Imagen por defecto
                  let itemName: string = "Producto Desconocido"; // Nombre por defecto
                  let itemPrice: number = 0; // Precio por defecto

                  // ✨ Lógica clave: Determina el tipo de `itemData` para acceder a sus propiedades específicas
                  if (itemData.tipo === 'articulo') {
                    // Si es un artículo, usa las propiedades de Articulo
                    const articulo = itemData as Articulo;
                    imageUrl = articulo.imagen?.denominacion || imageUrl;
                    itemName = articulo.denominacion;
                    itemPrice = articulo.precioVenta;
                  } else if (itemData.tipo === 'promocion') {
                    // Si es una promoción, usa las propiedades de IPromocionDTO
                    const promocion = itemData as IPromocionDTO;
                    imageUrl = promocion.imagen?.denominacion || imageUrl;
                    itemName = promocion.denominacion;
                    itemPrice = promocion.precioPromocional;
                  }

                  return (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                      {/* Imagen del producto/promoción */}
                      <img
                        src={imageUrl}
                        alt={itemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        {/* Nombre del producto/promoción */}
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{itemName}</h3>
                        {/* Precio unitario del producto/promoción, formateado a 2 decimales */}
                        <p className="text-orange-500 font-bold">${itemPrice.toFixed(2)}</p>
                      </div>

                      {/* Controles de cantidad (+/-) */}
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

                      {/* Botón para eliminar el producto/promoción del carrito */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pie de página del Sidebar (Visible solo si hay ítems en el carrito) */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-orange-500">${totalAmount.toFixed(2)}</span> {/* Muestra el total a pagar */}
              </div>

              <div className="space-y-2">
                {/* Botón para proceder al pago: Cierra el sidebar y navega al checkout */}
                <button
                  onClick={() => {
                    onClose(); // Primero cierra el sidebar
                    navigate("/checkout"); // Luego navega a la página de checkout
                  }}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-200"
                >
                  Proceder al Pago
                </button>

                {/* Botón para vaciar completamente el carrito */}
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
  );
}