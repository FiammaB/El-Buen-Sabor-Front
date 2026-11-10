import { API_ORIGIN } from "../../config/api";
// src/pages/OrderConfirmation/OrderConfirmationPage.tsx

"use client"; // Directiva para frameworks como Next.js, si aplica

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, ArrowLeft, MapPin, Clock, Receipt } from "lucide-react"; // Iconos de Lucide React
import { useNavigate, useSearchParams } from "react-router-dom"; // Hooks de React Router
import { useCart } from '../../components/Cart/context/cart-context'; // Contexto del carrito
import { useAuth } from '../../components/Auth/Context/AuthContext'; // Contexto de autenticación

// Define la interfaz de tu PedidoDTO esperada del backend
// Asegúrate de que esta interfaz coincida con lo que tu backend devuelve para /api/pedidos/{id}
interface PedidoDetailDTO {
  id: number;
  fechaPedido: string; // Formato "YYYY-MM-DD"
  estado: string;
  tipoEnvio: string;
  formaPago: string;
  total: number;
  horaEstimadaFinalizacion?: string; // Formato "HH:mm:ss.SSSSSS" - NO SE USARÁ PARA EL CÁLCULO ACTIVO

  persona: { // Asumiendo que PedidoDTO tiene un PersonaDTO
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
  };
  domicilioEntrega?: { // Asumiendo que PedidoDTO tiene un DomicilioDTO
    id: number;
    calle: string;
    numero: number;
    cp: string;
    localidad: {
      id: number;
      nombre: string;
    };
  };
  sucursal?: { // Asumiendo que PedidoDTO tiene un SucursalDTO
    id: number;
    nombre: string;
    domicilio: { // Asumiendo que SucursalDTO tiene un DomicilioDTO
      calle: string;
      numero: number;
      localidad: { nombre: string; };
    };
  };
  // Puedes añadir más propiedades del PedidoDTO si las necesitas
}


// Minutos entre ahora y una hora "HH:mm:ss" de hoy (negativo si ya pasó).
function minutosHasta(horaEstimadaFinalizacion?: string): number | null {
  if (!horaEstimadaFinalizacion) return null;
  const [h, m, s] = horaEstimadaFinalizacion.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const objetivo = new Date();
  objetivo.setHours(h, m, s || 0, 0);
  return Math.round((objetivo.getTime() - Date.now()) / 60000);
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  // Tiempo estimado real, calculado a partir de lo que carga el cocinero (horaEstimadaFinalizacion).
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);

  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const { clearCart } = useCart();
  const { id: authUserId, telefono: authTelefono } = useAuth();

  const [cartCleared, setCartCleared] = useState(false);
  const [pedidoData, setPedidoData] = useState<PedidoDetailDTO | null>(null);
  const [isLoadingPedido, setIsLoadingPedido] = useState(true);

  console.log("PEDIDO ID en confirmación: ", pedidoId);

  // --- EFECTO 1: Recalcular los minutos restantes cada 30s a partir de la hora
  // real que cargó el cocinero (pedidoData.horaEstimadaFinalizacion), en vez de
  // una cuenta regresiva inventada. ---
  useEffect(() => {
    const recalcular = () => {
      const restantes = minutosHasta(pedidoData?.horaEstimadaFinalizacion);
      if (restantes === null) return;
      setRemainingTime(Math.max(restantes, 0));
      // La primera vez que vemos una hora estimada, la usamos como "total" para la barra de progreso.
      setEstimatedTime((prev) => (prev === null ? Math.max(restantes, 1) : prev));
    };
    recalcular();
    const timer = setInterval(recalcular, 30000);
    return () => clearInterval(timer);
  }, [pedidoData?.horaEstimadaFinalizacion]);

  // --- EFECTO 2: Vaciar el carrito y limpiar la bandera de Mercado Pago ---
  useEffect(() => {
    if (!cartCleared) {
      console.log("OrderConfirmationPage cargada. Vaciando el carrito...");
      clearCart();
      localStorage.removeItem("mercadoPagoInitiated");
      setCartCleared(true);
    }
  }, [clearCart, cartCleared]);

  // --- EFECTO 3: Cargar los datos del pedido y mantenerlos al día ---
  // Mientras el pedido llega vía Mercado Pago, puede tardar unos segundos en pasar
  // de "A_CONFIRMAR" a "PAGADO" (el webhook de MP es asíncrono), así que ahí
  // reintentamos seguido. Una vez confirmado, seguimos consultando cada tanto
  // mientras el pedido siga activo, para que el cliente vea el tiempo real que
  // va cargando el cocinero sin tener que recargar la página.
  const ESTADOS_FINALES = ["ENTREGADO", "CANCELADO", "RECHAZADO", "DEVOLUCION"];

  useEffect(() => {
    if (!pedidoId) {
      setIsLoadingPedido(false);
      return;
    }

    let cancelado = false;
    let intento = 0;
    const MAX_INTENTOS_CONFIRMACION = 15; // ~45s de espera para la confirmación del pago

    const fetchPedidoDetails = async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/api/pedidos/${pedidoId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: PedidoDetailDTO = await res.json();
        if (cancelado) return;

        setPedidoData(data);
        setIsLoadingPedido(false);

        if (ESTADOS_FINALES.includes(data.estado)) return; // ya terminó, no hace falta seguir preguntando

        if (data.estado === "A_CONFIRMAR") {
          intento++;
          if (intento < MAX_INTENTOS_CONFIRMACION) {
            setTimeout(fetchPedidoDetails, 3000);
          }
        } else {
          // Pedido activo (pagado/en cocina/en preparación/listo/en delivery):
          // seguimos consultando cada 15s para reflejar cambios de estado y de tiempo estimado.
          setTimeout(fetchPedidoDetails, 15000);
        }
      } catch (error) {
        if (cancelado) return;
        console.error("Error al cargar los detalles del pedido:", error);
        setIsLoadingPedido(false);

        intento++;
        if (intento < MAX_INTENTOS_CONFIRMACION) {
          setTimeout(fetchPedidoDetails, 3000);
        } else {
          alert("Error al cargar los detalles de tu pedido. Por favor, intenta de nuevo más tarde.");
          setPedidoData(null);
        }
      }
    };

    setIsLoadingPedido(true);
    fetchPedidoDetails();

    return () => {
      cancelado = true;
    };
  }, [pedidoId]); // Dependencia: `pedidoId`

  // --- EFECTO 4: Actualizar el teléfono en AuthContext después de un pedido ---
  useEffect(() => {
    const updateAuthPhoneFromPedido = async () => {
      if (pedidoData && authUserId && pedidoData.persona?.telefono && pedidoData.persona.telefono !== authTelefono) {
        console.log("DEBUG OrderConfirmation: Actualizando teléfono en AuthContext:", pedidoData.persona.telefono);

      }
    };

    updateAuthPhoneFromPedido();
  }, [pedidoData, authUserId, authTelefono]);

  // --- Función para cancelar el pedido ---
  const cancelOrder = useCallback(async () => {
    if (!pedidoId) {
      alert("No se encontró un ID de pedido para cancelar.");
      return;
    }
    if (!authUserId) {
      alert("No se pudo obtener la información del usuario para cancelar el pedido. Por favor, asegúrate de estar logueado.");
      console.error("No userId available for cancellation.");
      return;
    }

    const confirmarCancelacion = window.confirm("¿Estás seguro de que deseas cancelar este pedido?");
    if (!confirmarCancelacion) {
      return;
    }

    let motivoAnulacion: string | null = null;
    do {
      motivoAnulacion = prompt("Por favor, ingresa el motivo de cancelación del pedido:");
      if (motivoAnulacion === null) {
        return;
      }
      if (motivoAnulacion.trim() === "") {
        alert("El motivo de cancelación no puede estar vacío. Por favor, ingresa un motivo válido.");
      }
    } while (motivoAnulacion.trim() === "");

    setIsCancelling(true);

    try {
      const response = await fetch(`${API_ORIGIN}/api/pedidos/${pedidoId}/anular`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motivoAnulacion: motivoAnulacion.trim(),
          usuarioAnuladorId: authUserId,
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
      setIsCancelling(false);
    }
  }, [pedidoId, authUserId, navigate]);

  // --- Manejador para el botón "Volver al inicio" ---
  const handleGoHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página de confirmación */}
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
          {/* Icono de confirmación exitosa */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Mensaje de agradecimiento */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu pedido!</h2>
          <p className="text-gray-600 mb-6">Tu pedido ha sido recibido y está siendo preparado.</p>

          {/* SECCIÓN DE DETALLES DEL PEDIDO (CARGA REAL) */}
          {isLoadingPedido ? (
            <div className="text-center py-8 text-gray-600">Cargando detalles del pedido...</div>
          ) : pedidoData ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Número de pedido:</span>
                <span className="font-bold text-gray-900">#{pedidoData.id}</span>
              </div>

              {pedidoData.formaPago === "MERCADO_PAGO" && pedidoData.estado === "A_CONFIRMAR" && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 text-sm rounded-md p-3 mb-4">
                  <span className="inline-block w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Confirmando tu pago con Mercado Pago...
                </div>
              )}

              <div className="space-y-6">
                {/* Tiempo estimado de entrega (real, cargado por el cocinero) */}
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Tiempo estimado de entrega</p>
                    {remainingTime === null ? (
                      <p className="text-sm text-gray-500 mt-1">
                        Estamos confirmando tu pedido en cocina, en breve vas a ver el tiempo estimado.
                      </p>
                    ) : (
                      <>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">Aproximadamente {estimatedTime} minutos</p>
                          <p className="text-sm font-medium text-orange-500">
                            {remainingTime > 0 ? `${remainingTime} min restantes` : "¡Ya está casi listo!"}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${estimatedTime ? Math.min(Math.max((1 - remainingTime / estimatedTime) * 100, 0), 100) : 0}%`,
                            }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Dirección de entrega o información de sucursal */}
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Dirección de entrega</p>
                    {pedidoData.tipoEnvio === "DELIVERY" && pedidoData.domicilioEntrega ? (
                      <p className="text-sm text-gray-500 mt-1">
                        {pedidoData.domicilioEntrega.calle} {pedidoData.domicilioEntrega.numero}, {pedidoData.domicilioEntrega.localidad.nombre}, {pedidoData.domicilioEntrega.cp}
                      </p>
                    ) : pedidoData.tipoEnvio === "RETIRO_EN_LOCAL" && pedidoData.sucursal ? (
                      <p className="text-sm text-gray-500 mt-1">
                        Retiro en {pedidoData.sucursal.nombre} ({pedidoData.sucursal.domicilio.calle} {pedidoData.sucursal.domicilio.numero}, {pedidoData.sucursal.domicilio.localidad.nombre})
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">9 de julio 123.</p>
                    )}

                    {/* Información de la Persona de Contacto */}
                    <p className="font-medium mt-2">Contacto del Pedido:</p>
                    <p className="text-sm text-gray-500">
                      {pedidoData.persona.nombre} {pedidoData.persona.apellido}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pedidoData.persona.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Teléfono: {pedidoData.persona.telefono || 'Sin teléfono registrado'}
                    </p>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="flex items-center">
                  <Receipt className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Método de pago</p>
                    <p className="text-sm text-gray-500 mt-1">{pedidoData.formaPago}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-600">No se pudieron cargar los detalles del pedido.</div>
          )}

          {/* Botones de acción */}
          <div className="space-y-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition duration-200"
            >
              Volver al inicio
            </button>
            <button
              onClick={cancelOrder}
              disabled={isCancelling || isLoadingPedido || !pedidoData}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelando..." : "Cancelar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}