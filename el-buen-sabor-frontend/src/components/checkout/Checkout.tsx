"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, CreditCard, MapPin, Truck, ShoppingBag, Check, Shield } from "lucide-react"
import { useCart } from "../../components/Cart/context/cart-context" // Asegúrate que esta ruta sea correcta
import { PedidoService } from "../../services/PedidoService"
import { MercadoPagoService } from "../../services/MercadoPagoService"
import { FormaPago, TipoEnvio } from "../../models/DTO/IPedidoDTO"
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO"
import { useNavigate } from "react-router-dom"
import LoginForm from "../../components/Auth/components/LoginForm"
import { useAuth } from "../Auth/Context/AuthContext";

// Importaciones adicionales para tipado
import type { Articulo } from "../../models/Articulos/Articulo";
import type { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";

interface Localidad {
  id: number;
  nombre: string;
}

type Address = {
  id: number;
  calle: string;
  numero: number;
  cp: string;
  localidad: {
    id: number;
    nombre?: string;
  };
};


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
  const { items, totalItems, totalAmount, clearCart } = useCart() // 'items' del carrito es ahora CartItem[]
  const pedidoService = new PedidoService()
  const mercadoPagoService = new MercadoPagoService()

  const [currentStep, setCurrentStep] = useState<"information" | "delivery" | "payment" | "confirmation">("information")
  const [paymentMethod, setPaymentMethod] = useState<FormaPago>(FormaPago.MERCADO_PAGO)
  const [deliveryType, setDeliveryType] = useState<TipoEnvio>(TipoEnvio.DELIVERY)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isMercadoPagoReady, setIsMercadoPagoReady] = useState(false)

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [newAddress, setNewAddress] = useState({
    calle: "",
    numero: "",
    cp: "",
    localidadId: ""
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const auth = useAuth();
  console.log("CONTEXT EN CHECKOUT", auth);

  useEffect(() => {
    try {
      console.log("Id al traer el dom ", auth.id)
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`http://localhost:8080/api/domicilios/cliente/${auth.id}`);
          const data = await res.json();
          console.log("Domicilios recibidos:", data);
          if (Array.isArray(data)) {
            setAddresses(data);
          } else {
            setAddresses([]); // seguridad por si viene null o un objeto
          }
        } catch (error) {
          console.error("Error al obtener domicilios:", error);
          setAddresses([]);
        }
      };

      fetchAddresses();
    } catch (e) {
      console.log(e)
    }
  }, [auth?.id]);


  // Obtenemos localidades
  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/localidades");
        const data = await res.json();
        setLocalidades(data);
        console.log("Localidades", data)
      } catch (err) {
        console.error("Error al traer localidades:", err);
      }
    };
    fetchLocalidades();
  }, []);

  const autopopulate = (domicilio: any) => {
    setCustomerInfo({
      ...customerInfo,
      address: `${domicilio.calle} ${domicilio.numero}`,
      city: domicilio.localidad?.nombre ?? "",
      zipCode: domicilio.cp ?? "",
    });
  };


  console.log(useAuth())
  const { username, email, telefono } = useAuth();

  console.log(email, telefono)

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
      // <-- CAMBIO IMPORTANTE AQUÍ: Construcción de los detalles del pedido
      const detallesPedido = items.map((item) => {
        let articuloId: number | undefined;
        let subTotalCalculado: number = 0;
        let precioUnitario: number = 0; // Para el cálculo del subTotal

        if (item.purchasableItem.tipo === 'articulo') {
          const articulo = item.purchasableItem as Articulo;
          articuloId = articulo.id;
          precioUnitario = articulo.precioVenta || 0;
        } else if (item.purchasableItem.tipo === 'promocion') {
          const promocion = item.purchasableItem as IPromocionDTO;
          articuloId = promocion.id; // Usamos el ID de la promoción como si fuera un "articulo" en este contexto de pedido
          precioUnitario = promocion.precioPromocional || 0;
          // Opcional: Si tu backend necesita los IDs de los artículos individuales de la promoción,
          // tendrías que enviar item.purchasableItem.articulosManufacturados.map(a => a.id)
          // pero para un PedidoDetalle básico, el ID de la promoción es suficiente.
        }

        subTotalCalculado = Number((precioUnitario * item.quantity).toFixed(2));

        // Si `articuloId` es undefined, esto podría causar problemas en el backend.
        // Idealmente, todos los items en el carrito deberían tener un ID.
        if (articuloId === undefined) {
          console.error("Item en carrito sin ID definido, omitiendo en PedidoDetalle:", item);
          return null; // Omitir este detalle o lanzar un error
        }

        return {
          cantidad: item.quantity,
          subTotal: subTotalCalculado,
          articuloId: articuloId, // Esto es el ID del item (Articulo o Promocion)
        };
      }).filter(detail => detail !== null) as IPedidoDTO['detalles']; // Filtrar cualquier null si se omitieron items sin ID


      const pedido: IPedidoDTO = {
        fechaPedido: new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
        estado: "A_CONFIRMAR",
        tipoEnvio: deliveryType, // Ej: "DELIVERY"
        formaPago: paymentMethod, // Ej: "MERCADO_PAGO"
        // El total debe ser el total final, incluyendo el costo de envío si es delivery
        total: finalTotal, // Usar el finalTotal ya calculado
        clienteId: auth.id || 1, // Usar el ID real del cliente logueado desde el contexto de autenticación
        // Domicilio ID y Sucursal ID: Esto dependerá de cómo manejes los domicilios/sucursales.
        // Esto es solo un placeholder, necesitarías la lógica real para obtener el ID de domicilio/sucursal.
        domicilioId: deliveryType === TipoEnvio.DELIVERY ? selectedAddressId ?? undefined : undefined,
        sucursalId: deliveryType === TipoEnvio.RETIRO_EN_LOCAL ? 1 : undefined, // solo si es retiro, y obtener el ID real
        detalles: detallesPedido,
        id: 0
      };

      console.log("PEDIDO A ENVIAR:", pedido)

      if (paymentMethod === FormaPago.MERCADO_PAGO) {
        try {
          const preferenceId = await mercadoPagoService.createPreference(pedido)
          console.log("PREF ID ", preferenceId);

          localStorage.setItem("pendingOrderData", JSON.stringify(pedido))

          window.location.href = JSON.parse(preferenceId).initPoint;

        } catch (error) {
          console.error("Error al procesar pago con MercadoPago:", error)
          alert("Error al procesar el pago con MercadoPago. Por favor intenta nuevamente.")
          setIsProcessing(false)
          return
        }
      } else {
        const response = await pedidoService.sendPedido(pedido)
        console.log("Pedido creado con éxito:", response)
        setIsComplete(true)
        clearCart()

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

  // <-- CAMBIO IMPORTANTE AQUÍ: Si el usuario ya está logueado, pasar al paso de entrega
  useEffect(() => {
    if (username && currentStep === "information") {
      setCurrentStep("delivery");
    }
  }, [username, currentStep]);


  const goToNextStep = () => {
    if (currentStep === "information") setCurrentStep("delivery")
    else if (currentStep === "delivery") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("confirmation")
  }

  const goToPreviousStep = () => {
    if (currentStep === "confirmation") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("delivery")
    else if (currentStep === "delivery" && !username) setCurrentStep("information")
    else if (currentStep === "delivery" && username) navigate("/")
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
                <h1 className="text-[20px] font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">{totalItems} productos</p>
              </div>
            </div>
            <a href="/" className="text-2xl font-bold text-orange-500">El Buen Sabor</a>
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
                <>
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
                  </div>

                  {deliveryType === TipoEnvio.DELIVERY && (
                    <>
                      {!showNewAddressForm && (
                        <>
                          <h3 className="font-semibold mt-8">Elegí tu domicilio</h3>

                          <div className="space-y-3">
                            {addresses.map((d) => (
                              <label
                                key={d.id}
                                className={`block border-2 rounded-md p-4 cursor-pointer ${selectedAddressId === d.id ? "border-orange-500" : "border-gray-200"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  className="sr-only"
                                  checked={selectedAddressId === d.id}
                                  onChange={() => {
                                    setSelectedAddressId(d.id);
                                    autopopulate(d);
                                  }}
                                />
                                <span className="block font-medium">{`${d.calle} ${d.numero}`}</span>
                                <span className="text-sm text-gray-500">{`${d.localidad?.nombre ?? ""} (${d.cp})`}</span>
                              </label>
                            ))}

                            <button
                              type="button"
                              onClick={() => setShowNewAddressForm(true)}
                              className="w-full border-2 border-dashed border-orange-300 rounded-md py-2 text-orange-500 hover:bg-orange-50"
                            >
                              + Agregar nuevo domicilio
                            </button>
                          </div>
                        </>
                      )}

                      {showNewAddressForm && (
                        <div className="space-y-4 pt-6 border-t mt-6">
                          <h3 className="font-semibold text-lg">Nuevo domicilio</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm block text-gray-700 mb-1">Calle</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newAddress.calle}
                                onChange={(e) => setNewAddress({ ...newAddress, calle: e.target.value })}
                                placeholder="Ej: San Martín"
                              />
                            </div>
                            <div>
                              <label className="text-sm block text-gray-700 mb-1">Número</label>
                              <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newAddress.numero}
                                onChange={(e) => setNewAddress({ ...newAddress, numero: e.target.value })}
                                placeholder="Ej: 123"
                              />
                            </div>
                            <div>
                              <label className="text-sm block text-gray-700 mb-1">Código Postal</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newAddress.cp}
                                onChange={(e) => setNewAddress({ ...newAddress, cp: e.target.value })}
                                placeholder="Ej: 5500"
                              />
                            </div>
                            <div>
                              <label className="text-sm block text-gray-700 mb-1">Localidad</label>
                              <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={newAddress.localidadId}
                                onChange={(e) => setNewAddress({ ...newAddress, localidadId: e.target.value })}
                              >
                                <option value="">Seleccioná una</option>
                                {localidades.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`http://localhost:8080/api/domicilios/cliente/${auth.id}`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      calle: newAddress.calle,
                                      numero: parseInt(newAddress.numero),
                                      cp: newAddress.cp,
                                      localidad: {
                                        id: parseInt(newAddress.localidadId)
                                      }
                                    }),
                                  });

                                  if (!res.ok) throw new Error("Error al guardar domicilio");
                                  const saved = await res.json();

                                  setAddresses((prev) => [...prev, saved]);
                                  setSelectedAddressId(saved.id);
                                  autopopulate(saved);
                                  setShowNewAddressForm(false);
                                  setNewAddress({ calle: "", numero: "", cp: "", localidadId: "" });
                                } catch (err) {
                                  console.error(err);
                                  alert("Error al guardar el domicilio. Verificá los datos.");
                                }
                              }}
                              className="bg-orange-500 text-white px-4 py-2 rounded-md"
                            >
                              Guardar domicilio
                            </button>
                            <button
                              onClick={() => {
                                setShowNewAddressForm(false);
                                setNewAddress({ calle: "", numero: "", cp: "", localidadId: "" });
                              }}
                              className="border border-gray-300 px-4 py-2 rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={goToNextStep}
                    className="disabled:bg-gray-400 mt-8 w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                    disabled={
                      (deliveryType === TipoEnvio.DELIVERY && !selectedAddressId) || showNewAddressForm
                    }
                  >
                    Continuar a Pago
                  </button>
                </>
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
                        <p><span className="font-medium">Nombre:</span> {username || "No especificado"}</p>
                        <p><span className="font-medium">Email:</span> {email || "No especificado"}</p>
                        <p><span className="font-medium">Teléfono:</span> {telefono || "No especificado"}</p>
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
                        {items.map((item) => {
                          // <-- CAMBIO IMPORTANTE AQUÍ: Acceder a las propiedades del purchasableItem
                          let itemDisplayName: string = item.purchasableItem.denominacion;
                          let itemDisplayPrice: number;

                          if (item.purchasableItem.tipo === 'articulo') {
                            itemDisplayPrice = (item.purchasableItem as Articulo).precioVenta || 0;
                          } else if (item.purchasableItem.tipo === 'promocion') {
                            itemDisplayPrice = (item.purchasableItem as IPromocionDTO).precioPromocional || 0;
                            // Opcional: Podrías añadir un texto como "(Promoción)" junto al nombre
                            itemDisplayName = `${item.purchasableItem.denominacion} (Promo)`;
                          } else {
                            itemDisplayPrice = 0; // Fallback
                          }

                          return (
                            <div key={item.id} className="flex justify-between">
                              <span>
                                {item.quantity}x {itemDisplayName}
                              </span>
                              {/* Mostrar el subtotal del item del carrito, que ya está calculado */}
                              <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
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

          {/* Order Summary (panel de la derecha) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del pedido</h3>

              <div className="space-y-4 mb-6">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item) => {
                    // <-- CAMBIO IMPORTANTE AQUÍ: Acceder a las propiedades a través de purchasableItem
                    let imageUrl: string = "/placeholder.svg?height=48&width=48";
                    let itemDisplayName: string = item.purchasableItem.denominacion;

                    if (item.purchasableItem.tipo === 'articulo') {
                      const articulo = item.purchasableItem as Articulo;
                      // Asumiendo que la imagen del artículo está en .imagen.denominacion
                      imageUrl = articulo.imagen?.denominacion || imageUrl;
                    } else if (item.purchasableItem.tipo === 'promocion') {
                      const promocion = item.purchasableItem as IPromocionDTO;
                      // Asumiendo que la imagen de la promoción está en .imagen.denominacion
                      // Y que podría necesitar el prefijo de localhost:8080 si se sirve desde el backend
                      imageUrl = promocion.imagen?.denominacion ? `http://localhost:8080/${promocion.imagen.denominacion}` : imageUrl;
                    }

                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={imageUrl} // Usamos la URL determinada
                            alt={itemDisplayName} // Usamos el nombre determinado
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{itemDisplayName}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                      </div>
                    );
                  })}
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
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Pago 100% seguro</span>
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