"use client"

import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Truck, Shield, Heart } from 'lucide-react'
import { useCart } from "../context/cart-context"
// import { PedidoService } from '../../../services/PedidoService'
// import { FormaPago, TipoEnvio } from '../../../models/DTO/IPedidoDTO';
// import type {IPedidoDTO} from '../../../models/DTO/IPedidoDTO';

export default function CartPage() {
    const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart()

    const deliveryFee = totalAmount >= 25 ? 0 : 3.99
    const finalTotal = totalAmount + deliveryFee

    // const pedidoService = new PedidoService();

    // Crear pedido tipo pedido DTO
    // const crearPedido = async () => {
    //   // HARDCODEADOOO
    //   // Si lo retira MP y Efectivo
    //   // Si no solo MP
    //   const pedido: IPedidoDTO = {
    //     clienteId: 1, // Reemplazá con el ID real del cliente logueado
    //     domicilioEntregaId: 1, // O undefined si es RETIRO
    //     tipoEnvio: TipoEnvio.DELIVERY,
    //     formaPago: FormaPago.EFECTIVO,
    //     sucursalId: 1, // Reemplazá con la sucursal seleccionada
    //     detallesPedidos: items.map((item) => ({
    //       cantidad: 3,
    //       articuloManufacturadoId: 100,
    //       articuloInsumoId: 1,
    //     })),
    //   }

    //   console.log("PEDIDO:", pedido)

    //   try {
    //     const response = await pedidoService.sendPedido(pedido)
    //     console.log("Pedido creado con éxito:", response)
    //     clearCart()
    //     // Podés redirigir al usuario o mostrar una confirmación
    //   } catch (error) {
    //     console.error("Error al crear el pedido:", error)
    //     alert("No se pudo crear el pedido. Intentalo de nuevo.")
    //   }
    // }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <a href='/landing' className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                                <ArrowLeft className="w-6 h-6" />
                            </a>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Mi Carrito</h1>
                                <p className="text-sm text-gray-500">{totalItems} productos</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-500">El Buen Sabor</div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {items.length === 0 ? (
                    // Carrito vacío
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
                            <p className="text-gray-500 mb-8">
                                Parece que aún no has agregado ningún producto a tu carrito. ¡Explora nuestro menú y encuentra algo
                                delicioso!
                            </p>
                            <a href='/landing' className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium">
                                Explorar Productos
                            </a>
                        </div>
                    </div>
                ) : (
                    // Carrito con productos
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de productos */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Productos en tu carrito</h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-500 hover:text-red-600 text-sm font-medium transition duration-200"
                                    >
                                        Vaciar carrito
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
                                            <img
                                                src={
                                                    item.articulo.imagen && item.articulo.imagen.denominacion.length > 0
                                                        ? item.articulo.imagen.denominacion
                                                        : "/placeholder.svg?height=80&width=80"
                                                }
                                                alt={item.articulo.denominacion}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.articulo.denominacion}</h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {item.articulo.categoria?.denominacion || "Producto especial"}
                                                </p>
                                                <p className="text-orange-500 font-bold">${item.articulo.precioVenta}</p>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition duration-200"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>

                                                <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>

                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition duration-200"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-lg text-gray-900">${item.subtotal.toFixed(2)}</p>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-600 text-sm mt-1 transition duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Productos recomendados */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Te podría interesar</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2].map((item) => (
                                        <div key={item} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                                            <img
                                                src={`/placeholder.svg?height=60&width=60`}
                                                alt="Producto recomendado"
                                                className="w-15 h-15 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 text-sm">Pizza Margherita</h4>
                                                <p className="text-orange-500 font-bold text-sm">$12.99</p>
                                            </div>
                                            <button className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition duration-200">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Resumen del pedido */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del pedido</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                                        <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Costo de envío</span>
                                        <span className="font-semibold">
                      {deliveryFee === 0 ? (
                          <span className="text-green-500">Gratis</span>
                      ) : (
                          `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                                    </div>

                                    {totalAmount < 25 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <p className="text-sm text-orange-700">
                                                Agrega ${(25 - totalAmount).toFixed(2)} más para obtener envío gratis
                                            </p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-orange-500">${finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <a href='/checkout' className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 flex items-center justify-center space-x-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Proceder al Pago</span>
                                </a>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Truck className="w-4 h-4" />
                                        <span>Entrega estimada: 25-35 min</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Shield className="w-4 h-4" />
                                        <span>Pago 100% seguro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}