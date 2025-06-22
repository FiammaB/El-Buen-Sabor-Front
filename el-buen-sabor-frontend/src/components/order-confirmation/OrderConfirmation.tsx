"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft, MapPin, Clock, Receipt } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"


export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [remainingTime, setRemainingTime] = useState(30)

  const [searchParams] = useSearchParams()
  const pedido = searchParams.get("pedido")

  console.log("PEDIDO ID: ", pedido)

  // Simulate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const cancelOrder = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${pedido}/anular`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motivoAnulacion: "Cancelado por el cliente desde la pantalla de confirmación",
          usuarioAnuladorId: 1, // Reemplazar con el ID real del usuario logueado o fijo para testing
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al cancelar el pedido.")
      }

      alert("Pedido cancelado exitosamente.")
      navigate("/") // Redirige al inicio u otra ruta
    } catch (err) {
      alert("Hubo un problema al cancelar el pedido.")
      console.error(err)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Confirmación de Pedido</h1>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-500">El Buen Sabor</div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu pedido!</h2>
          <p className="text-gray-600 mb-6">Tu pedido ha sido recibido y está siendo preparado.</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Número de pedido:</span>
              <span className="font-bold text-gray-900">#{pedido}</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-orange-500 mr-4" />
                <div className="flex-1">
                  <p className="font-medium">Tiempo estimado de entrega</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500">Aproximadamente {estimatedTime} minutos</p>
                    <p className="text-sm font-medium text-orange-500">{remainingTime} min restantes</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(1 - remainingTime / estimatedTime) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="w-6 h-6 text-orange-500 mr-4" />
                <div>
                  <p className="font-medium">Dirección de entrega</p>
                  <p className="text-sm text-gray-500 mt-1">Calle Principal 123, Ciudad</p>
                </div>
              </div>

              <div className="flex items-center">
                <Receipt className="w-6 h-6 text-orange-500 mr-4" />
                <div>
                  <p className="font-medium">Método de pago</p>
                  <p className="text-sm text-gray-500 mt-1">Mercado Pago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* <button
              onClick={() => navigate("/order-tracking")}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
            >
              Seguir mi pedido
            </button> */}

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition duration-200"
            >
              Volver al inicio
            </button>
            <button
              onClick={cancelOrder}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition duration-200"
            >
              Cancelar pedido
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
