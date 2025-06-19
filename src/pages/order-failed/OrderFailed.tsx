"use client"

import { useNavigate } from "react-router-dom"
import { XCircle, ArrowRight, RefreshCw } from "lucide-react"

export default function PagoFallido() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Fallido</h1>
          <p className="text-gray-600 mb-6">
            Lo sentimos, hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-red-800">
              Motivos comunes: fondos insuficientes, datos incorrectos o problemas de conexión.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/checkout")}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 flex items-center justify-center gap-2 w-full"
            >
              Intentar nuevamente <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate("/")}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2 w-full"
            >
              Volver al inicio <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
