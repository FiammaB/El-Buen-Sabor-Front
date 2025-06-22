"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, CreditCard, MapPin, Truck, ShoppingBag, Check } from "lucide-react"
import { useCart } from "../Cart/context/cart-context"
import { PedidoService } from "../../services/PedidoService"
import { MercadoPagoService } from "../../services/MercadoPagoService"
import { FormaPago, TipoEnvio } from "../../models/DTO/IPedidoDTO"
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO"
import { useNavigate } from "react-router-dom"
import LoginForm from "../../pages/auth/components/LoginForm"
import { useAuth } from "../../pages/auth/Context/AuthContext"

// MercadoPago SDK script loader
const loadMercadoPagoScript = () => {
  return new Promise<void>((resolve) => {
    if (window.MercadoPago) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalItems, totalAmount, clearCart } = useCart()
  const pedidoService = new PedidoService()
  const mercadoPagoService = new MercadoPagoService()

  const [currentStep, setCurrentStep] = useState<"information" | "delivery" | "payment" | "confirmation">("information")
  const [paymentMethod, setPaymentMethod] = useState<FormaPago>(FormaPago.MERCADO_PAGO)
  const [deliveryType, setDeliveryType] = useState<TipoEnvio>(TipoEnvio.DELIVERY)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isMercadoPagoReady, setIsMercadoPagoReady] = useState(false)

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const { username } = useAuth();

  // Load MercadoPago SDK when component mounts
  useEffect(() => {
    const initMercadoPago = async () => {
      try {
        await loadMercadoPagoScript()
        setIsMercadoPagoReady(true)
      } catch (error) {
        console.error("Failed to load MercadoPago SDK:", error)
      }
    }

    initMercadoPago()
  }, [])

  const deliveryFee = deliveryType === TipoEnvio.DELIVERY ? (totalAmount >= 25 ? 0 : 3.99) : 0
  const finalTotal = totalAmount + deliveryFee

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async () => {
    setIsProcessing(true)

    try {
      const pedido: IPedidoDTO = {
        fechaPedido: new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
        estado: "A_CONFIRMAR",
        tipoEnvio: deliveryType, // Ej: "DELIVERY"
        formaPago: paymentMethod, // Ej: "MERCADO_PAGO"
        total: Number(
          items.reduce((acc, item) => acc + item.articulo.precioVenta * item.quantity, 0).toFixed(2)
        ),
        clienteId: 1, // ID real del cliente logueado
        domicilioId: deliveryType === "DELIVERY" ? 1 : 1, // solo si es delivery
        detalles: items.map((item) => ({
          cantidad: item.quantity,
          subTotal: Number((item.articulo.precioVenta * item.quantity).toFixed(2)),
          articuloId: item.articulo.id,
        })),
      };

      console.log("PEDIDO:", pedido)

      if (paymentMethod === FormaPago.MERCADO_PAGO) {
        try {
          // Create MercadoPago preference
          const preferenceId = await mercadoPagoService.createPreference(pedido)
          console.log("PREF ID ", preferenceId);

          // Store order in localStorage to retrieve after payment
          localStorage.setItem("pendingOrderData", JSON.stringify(pedido))

          // console.log(JSON.parse(preferenceId));

          window.location.href = JSON.parse(preferenceId).initPoint;

        } catch (error) {
          console.error("Error al procesar pago con MercadoPago:", error)
          alert("Error al procesar el pago con MercadoPago. Por favor intenta nuevamente.")
          setIsProcessing(false)
          return
        }
      } else {
        // For cash payments, proceed with normal flow
        const response = await pedidoService.sendPedido(pedido)
        console.log("Pedido creado con éxito:", response)
        setIsComplete(true)
        clearCart()

        // En una app real, redirigirías al usuario a una página de confirmación
        setTimeout(() => {
          navigate("/order-confirmation")
        }, 2000)
      }
    } catch (error) {
      console.error("Error al crear el pedido:", error)
      alert("No se pudo crear el pedido. Intentalo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (currentStep === "information" && username) setCurrentStep("delivery");

  const goToNextStep = () => {
    if (currentStep === "information") setCurrentStep("delivery")
    else if (currentStep === "delivery") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("confirmation")
  }

  const goToPreviousStep = () => {
    if (currentStep === "confirmation") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("delivery")
    else if (currentStep === "delivery") setCurrentStep("information")
    else navigate("/cart")
  }

  if (items.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16 max-w-md mx-auto">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">No puedes proceder al checkout sin productos en tu carrito.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200 font-medium"
          >
            Explorar Productos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={goToPreviousStep} className="p-2 hover:bg-gray-100 rounded-full transition duration-200">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">{totalItems} productos</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-500">El Buen Sabor</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between mb-8">
                <div
                  className={`flex flex-col items-center ${currentStep === "information" ? "text-orange-500" : "text-gray-500"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "information" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
                  >
                    1
                  </div>
                  <span className="text-xs mt-1">Información</span>
                </div>
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-1 w-full ${currentStep !== "information" ? "bg-orange-500" : "bg-gray-200"}`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col items-center ${currentStep === "delivery" ? "text-orange-500" : "text-gray-500"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "delivery" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
                  >
                    2
                  </div>
                  <span className="text-xs mt-1">Entrega</span>
                </div>
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-1 w-full ${currentStep === "payment" || currentStep === "confirmation" ? "bg-orange-500" : "bg-gray-200"}`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col items-center ${currentStep === "payment" ? "text-orange-500" : "text-gray-500"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "payment" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
                  >
                    3
                  </div>
                  <span className="text-xs mt-1">Pago</span>
                </div>
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-1 w-full ${currentStep === "confirmation" ? "bg-orange-500" : "bg-gray-200"}`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col items-center ${currentStep === "confirmation" ? "text-orange-500" : "text-gray-500"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "confirmation" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
                  >
                    4
                  </div>
                  <span className="text-xs mt-1">Confirmación</span>
                </div>
              </div>

              {/* Step Content */}
              {(currentStep === "information" && !username) && (
                <div>
                  <LoginForm onSuccess={() => setCurrentStep("delivery")} />
                </div>
              )}

              {currentStep === "delivery" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Método de Entrega</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`relative border-2 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${deliveryType === TipoEnvio.DELIVERY ? "border-orange-500" : "border-gray-200"
                        }`}
                      onClick={() => setDeliveryType(TipoEnvio.DELIVERY)}
                    >
                      <input
                        type="radio"
                        id="delivery"
                        name="deliveryType"
                        className="sr-only"
                        checked={deliveryType === TipoEnvio.DELIVERY}
                        onChange={() => setDeliveryType(TipoEnvio.DELIVERY)}
                      />
                      <div className="flex flex-col items-center">
                        <Truck className="mb-3 h-6 w-6" />
                        <span className="font-medium">Delivery a domicilio</span>
                        <span className="text-sm text-gray-500">25-35 minutos</span>
                        <span className="text-sm text-orange-500 font-medium mt-2">
                          {totalAmount >= 25 ? "Envío gratis" : `$${deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`relative border-2 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${deliveryType === TipoEnvio.RETIRO_EN_LOCAL ? "border-orange-500" : "border-gray-200"
                        }`}
                      onClick={() => setDeliveryType(TipoEnvio.RETIRO_EN_LOCAL)}
                    >
                      <input
                        type="radio"
                        id="pickup"
                        name="deliveryType"
                        className="sr-only"
                        checked={deliveryType === TipoEnvio.RETIRO_EN_LOCAL}
                        onChange={() => setDeliveryType(TipoEnvio.RETIRO_EN_LOCAL)}
                      />
                      <div className="flex flex-col items-center">
                        <MapPin className="mb-3 h-6 w-6" />
                        <span className="font-medium">Retiro en sucursal</span>
                        <span className="text-sm text-gray-500">15-20 minutos</span>
                        <span className="text-sm text-green-500 font-medium mt-2">Gratis</span>
                      </div>
                    </div>
                  </div>

                  {deliveryType === TipoEnvio.DELIVERY && (
                    <div className="space-y-4 pt-4">
                      <h3 className="font-semibold">Dirección de entrega</h3>
                      <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Dirección
                        </label>
                        <input
                          id="address"
                          name="address"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Calle y número"
                          value={customerInfo.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            Ciudad
                          </label>
                          <input
                            id="city"
                            name="city"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Ciudad"
                            value={customerInfo.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            Código Postal
                          </label>
                          <input
                            id="zipCode"
                            name="zipCode"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="5500"
                            value={customerInfo.zipCode}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={goToNextStep}
                      className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
                    >
                      Continuar a Pago
                    </button>
                  </div>
                </div>
              )}

              {currentStep === "payment" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Método de Pago</h2>

                  <div className="space-y-4">
                    <div
                      className={`relative border-2 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${paymentMethod === FormaPago.MERCADO_PAGO ? "border-orange-500" : "border-gray-200"
                        }`}
                      onClick={() => setPaymentMethod(FormaPago.MERCADO_PAGO)}
                    >
                      <input
                        type="radio"
                        id="mercadopago"
                        name="paymentMethod"
                        className="sr-only"
                        checked={paymentMethod === FormaPago.MERCADO_PAGO}
                        onChange={() => setPaymentMethod(FormaPago.MERCADO_PAGO)}
                      />
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500 text-white p-2 rounded-md">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Mercado Pago</p>
                          <p className="text-sm text-gray-500">Tarjeta, transferencia o QR</p>
                        </div>
                      </div>
                    </div>

                    {deliveryType === TipoEnvio.RETIRO_EN_LOCAL && (
                      <div
                        className={`relative border-2 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${paymentMethod === FormaPago.EFECTIVO ? "border-orange-500" : "border-gray-200"
                          }`}
                        onClick={() => setPaymentMethod(FormaPago.EFECTIVO)}
                      >
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          className="sr-only"
                          checked={paymentMethod === FormaPago.EFECTIVO}
                          onChange={() => setPaymentMethod(FormaPago.EFECTIVO)}
                        />
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500 text-white p-2 rounded-md">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Efectivo</p>
                            <p className="text-sm text-gray-500">Pago al retirar</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {paymentMethod === FormaPago.MERCADO_PAGO && (
                    <div className="space-y-4 pt-4 border p-4 rounded-md border-gray-200">
                      <h3 className="font-semibold">Información importante</h3>
                      <p className="text-sm text-gray-600">
                        Al seleccionar MercadoPago, serás redirigido a la plataforma segura de MercadoPago para
                        completar tu pago.
                      </p>
                      <p className="text-sm text-gray-600">
                        Podrás elegir entre diferentes métodos de pago como tarjetas de crédito/débito, transferencia
                        bancaria o pago en efectivo.
                      </p>

                      {!isMercadoPagoReady && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-sm text-yellow-700">Cargando integración con MercadoPago...</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={goToNextStep}
                      className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
                      disabled={paymentMethod === FormaPago.MERCADO_PAGO && !isMercadoPagoReady}
                    >
                      Revisar Pedido
                    </button>
                  </div>
                </div>
              )}

              {currentStep === "confirmation" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Confirmar Pedido</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Información Personal</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>
                          <span className="font-medium">Nombre:</span>{" "}
                          {username || "No especificado"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          No especificado
                        </p>
                        <p>
                          <span className="font-medium">Teléfono:</span>{" "}
                          No especificado
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Método de Entrega</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium">
                          {deliveryType === TipoEnvio.DELIVERY ? "Delivery a domicilio" : "Retiro en sucursal"}
                        </p>
                        {deliveryType === TipoEnvio.DELIVERY && (
                          <>
                            <p>{customerInfo.address || "No especificado"}</p>
                            <p>
                              {customerInfo.city || "No especificado"}, {customerInfo.zipCode || "No especificado"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Método de Pago</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>{paymentMethod === FormaPago.MERCADO_PAGO ? "Mercado Pago" : "Efectivo"}</p>
                        {paymentMethod === FormaPago.MERCADO_PAGO && (
                          <p className="text-sm text-gray-500 mt-1">
                            Serás redirigido a MercadoPago para completar el pago de forma segura.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Resumen de Productos</h3>
                      <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.articulo.denominacion}
                            </span>
                            <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-medium">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Envío</span>
                          <span className="font-medium">
                            {deliveryFee === 0 ? "Gratis" : `$${deliveryFee.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-orange-500">${finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isProcessing || (paymentMethod === FormaPago.MERCADO_PAGO && !isMercadoPagoReady)}
                      className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? "Procesando..."
                        : paymentMethod === FormaPago.MERCADO_PAGO
                          ? "Pagar con MercadoPago"
                          : "Confirmar y Pagar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del pedido</h3>

              <div className="space-y-4 mb-6">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.articulo.imagen && item.articulo.imagen.denominacion.length > 0
                              ? item.articulo.imagen.denominacion
                              : "/placeholder.svg?height=48&width=48"
                          }
                          alt={item.articulo.denominacion}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.articulo.denominacion}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Costo de envío</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? <span className="text-green-500">Gratis</span> : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {totalAmount < 25 && deliveryType === TipoEnvio.DELIVERY && (
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

              {isComplete ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-800">¡Pedido realizado con éxito!</p>
                  <p className="text-sm text-green-600 mt-1">Redirigiendo...</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span>Entrega estimada: 25-35 min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
