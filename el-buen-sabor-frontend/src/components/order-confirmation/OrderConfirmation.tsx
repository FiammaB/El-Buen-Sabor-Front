// src/pages/OrderConfirmation/OrderConfirmationPage.tsx

"use client"

import { useEffect, useState, useCallback } from "react"
import { CheckCircle, ArrowLeft, MapPin, Clock, Receipt } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useCart } from '../../components/Cart/context/cart-context';
import { useAuth } from '../../components/Auth/Context/AuthContext';

export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [remainingTime, setRemainingTime] = useState(30)
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchParams] = useSearchParams()
  const pedidoId = searchParams.get("pedido")
  const { clearCart } = useCart(); // Obtén clearCart del contexto
  const { id: userId } = useAuth();

  // --- Estado para controlar si el carrito ya ha sido vaciado ---
  const [cartCleared, setCartCleared] = useState(false); // ✨ NUEVO ESTADO

  console.log("PEDIDO ID en confirmación: ", pedidoId)

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
    }, 60000)

    return () => clearInterval(timer)
  }, [])


  useEffect(() => {

    if (!cartCleared) {
      console.log("OrderConfirmationPage cargada. Vaciando el carrito...");
      clearCart();
      localStorage.removeItem("mercadoPagoInitiated");
      setCartCleared(true);
    }
  }, [clearCart, cartCleared]);


  const cancelOrder = useCallback(async () => {
    if (!pedidoId) {
      alert("No se encontró un ID de pedido para cancelar.");
      return;
    }
    if (!userId) {
      alert("No se pudo obtener la información del usuario para cancelar el pedido. Por favor, asegúrate de estar logueado.");
      console.error("No userId available for cancellation.");
      return;
    }

    setIsCancelling(true); // ✨ Inicia el estado de cancelación

    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/anular`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motivoAnulacion: "Cancelado por el cliente desde la pantalla de confirmación",
          usuarioAnuladorId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar el pedido.");
      }

      alert("Pedido cancelado exitosamente.");
      navigate("/");
    } catch (err) {
      alert(`Hubo un problema al cancelar el pedido: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Error al cancelar pedido:", err);
    } finally {
      setIsCancelling(false); // ✨ Finaliza el estado de cancelación (siempre, incluso si hay error)
    }
  }, [pedidoId, userId, navigate]);


  const handleGoHome = useCallback(() => {
    navigate("/");
  }, [navigate]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
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
              <span className="font-bold text-gray-900">#{pedidoId || 'Cargando...'}</span>
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
            <button
              onClick={handleGoHome}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition duration-200"
            >
              Volver al inicio
            </button>
            <button
              onClick={cancelOrder}

              disabled={isCancelling}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelando..." : "Cancelar pedido"} {/* ✨ Texto dinámico */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}