// src/pages/auth/PedidosPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/Context/AuthContext";
import { PedidoService } from "../../services/PedidoService.ts";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO.ts";
import React from "react";
import ComandaTicket, { type ItemComanda } from "./ComandaTicket";

export default function PedidosPage() {
  const { role } = useAuth();
  const pedidoService = new PedidoService();
  const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
  const [openSlideIds, setOpenSlideIds] = useState<Set<number>>(new Set());
  const [delayMinutes, setDelayMinutes] = useState<{[key: number]: number}>({});
  const { id: userId } = useAuth();
  const [comanda, setComanda] = useState<{ pedido: IPedidoDTO; items: ItemComanda[] } | null>(null);

  // Cuando se elige un pedido para imprimir, esperamos a que el ticket esté
  // en el DOM y recién ahí abrimos el diálogo de impresión del navegador.
  useEffect(() => {
    if (!comanda) return;
    const id = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(id);
  }, [comanda]);

  useEffect(() => {
    if (role !== "COCINERO") return;
    fetchPedidos();
    const intervalId = setInterval(fetchPedidos, 8000);
    return () => clearInterval(intervalId);
  }, [role]);

  const fetchPedidos = async () => {
    try {
      const data = await pedidoService.getPedidosEnCocina();
      setPedidos(data);
      console.log(pedidos);
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
    }
  };

  // Formatea una fecha como "HH:mm:ss" (formato que espera el backend, LocalTime.parse).
  const formatHora = (fecha: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
  };

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      // Al pasar a "En preparación" le pedimos al cocinero cuánto va a tardar,
      // así el cliente y la caja ven un tiempo real, no uno inventado.
      if (nuevoEstado === "EN_PREPARACION") {
        const minutosStr = window.prompt("¿Cuántos minutos va a tardar este pedido?", "20");
        if (minutosStr === null) return; // canceló
        const minutos = Number(minutosStr);
        if (!Number.isFinite(minutos) || minutos <= 0) {
          alert("Ingresá un número de minutos válido.");
          return;
        }
        const nuevaHora = formatHora(new Date(Date.now() + minutos * 60000));
        await pedidoService.actualizarHoraEstimada(id, nuevaHora);
      }

      await pedidoService.actualizarEstadoPedido(id, {
        estado: nuevoEstado,
        empleadoId: userId, // <--- pasa el id del usuario logueado si es necesario
      });
      fetchPedidos();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const agregarRetraso = async (pedido: IPedidoDTO, minutos: number) => {
    if (!pedido.id || !Number.isFinite(minutos) || minutos <= 0) return;
    // Suma los minutos de retraso a partir de ahora (más simple y confiable que
    // tratar de parsear la hora estimada anterior).
    const nuevaHora = formatHora(new Date(Date.now() + minutos * 60000));

    try {
      await pedidoService.actualizarHoraEstimada(pedido.id, nuevaHora);
      fetchPedidos();
    } catch (err) {
      alert("No se pudo actualizar la hora");
    }
  };

  const toggleSlide = (detalleId: number) => {
    setOpenSlideIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(detalleId)) {
        newSet.delete(detalleId);
      } else {
        newSet.add(detalleId);
      }
      return newSet;
    });
  };


  if (role !== "COCINERO") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Acceso denegado 🚫</h2>
        <p className="text-gray-600 mt-4">No tenés permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Panel de Pedidos 👨‍🍳</h2>
        <div className="p-8">
          <h3 className="text-xl font-semibold mb-4">📋 Pedidos en Preparación:</h3>
          <table className="min-w-full border border-gray-300 shadow-sm">
            <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Total</th>
              <th className="p-2">Hora Estimada</th>
              <th className="p-2 text-center">+Tiempo</th>
              <th className="p-2">Acción</th>
              <th className="p-2">Comanda</th>
            </tr>
            </thead>
            <tbody>
            {pedidos.length > 0 ? (
                pedidos.map((pedido) => {
                  let nuevoEstado = "";
                  let botonTexto = "";
                  let buttonColor = "";

                  if (pedido.estado === "EN_COCINA") {
                    nuevoEstado = "EN_PREPARACION";
                    botonTexto = "Marcar en Preparación";
                    buttonColor = "bg-blue-500 hover:bg-blue-600";
                  } else if (pedido.estado === "EN_PREPARACION") {
                    nuevoEstado = "LISTO";
                    botonTexto = "Marcar como Listo";
                    buttonColor = "bg-green-600 hover:bg-green-700";
                  }

                  // 1. Manufacturados sueltos
                  const manufacturadosSuelto = pedido.detalles
                      .filter(det => det.articuloManufacturado && !det.promocion)
                      .map(det => ({
                        id: det.articuloManufacturado?.id,
                        denominacion: det.articuloManufacturado?.denominacion,
                        cantidad: det.cantidad,
                        preparacion: det.articuloManufacturado?.preparacion,
                        detalles: det.articuloManufacturado?.detalles,
                        observaciones: det.observaciones,
                      }));

                  // 2. Manufacturados de promociones
                  const manufacturadosPromo = [];
                  pedido.detalles
                      .filter(det => det.promocion && det.promocion.promocionDetalles)
                      .forEach(det => {
                        det.promocion.promocionDetalles.forEach(pd => {
                          manufacturadosPromo.push({
                            id: pd.articuloManufacturado?.id,
                            denominacion: pd.articuloManufacturado?.denominacion,
                            cantidad: (pd.cantidad || 0) * (det.cantidad || 1), // OJO: cantidad total es la de la promo * la cantidad de la promo pedida
                            preparacion: pd.articuloManufacturado?.preparacion,
                            detalles: pd.articuloManufacturado?.detalles,
                            observaciones: det.observaciones,
                          });
                        });
                      });

                  // AGRUPAR MANUFACTURADOS por id
                  const agrupados = {};
                  [...manufacturadosSuelto, ...manufacturadosPromo].forEach(am => {
                    if (!am.id) return;
                    if (agrupados[am.id]) {
                      agrupados[am.id].cantidad += am.cantidad;
                      if (am.observaciones && !agrupados[am.id].observaciones?.includes(am.observaciones)) {
                        agrupados[am.id].observaciones = agrupados[am.id].observaciones
                            ? `${agrupados[am.id].observaciones}; ${am.observaciones}`
                            : am.observaciones;
                      }
                    } else {
                      agrupados[am.id] = { ...am };
                    }
                  });
                  const manufacturadosAgrupados = Object.values(agrupados);

                  return (
                      <React.Fragment key={pedido.id}>
                        <tr className="border-t">
                          <td className="p-2 text-center">{pedido.id}</td>
                          <td className="p-2 text-center">{pedido.fechaPedido}</td>
                          <td className="p-2 text-center">${pedido.total?.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            {pedido.horaEstimadaFinalizacion
                                ? pedido.horaEstimadaFinalizacion.slice(0, 5)
                                : "Sin asignar"}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                  type="number"
                                  min={1}
                                  placeholder="Min"
                                  className="border rounded p-1 w-14 text-center"
                                  value={delayMinutes[pedido.id!] || ""}
                                  onChange={e => setDelayMinutes({
                                    ...delayMinutes,
                                    [pedido.id!]: Number(e.target.value)
                                  })}
                              />
                              <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                  onClick={() => agregarRetraso(pedido, delayMinutes[pedido.id!] || 0)}
                              >
                                +Min
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            {nuevoEstado && (
                                <button
                                    onClick={() => cambiarEstado(pedido.id!, nuevoEstado)}
                                    className={`text-white px-3 py-1 rounded ${buttonColor}`}
                                >
                                  {botonTexto}
                                </button>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <button
                                onClick={() => setComanda({ pedido, items: manufacturadosAgrupados as ItemComanda[] })}
                                className="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded text-xs"
                            >
                              🖨️ Imprimir
                            </button>
                          </td>
                        </tr>

                        {/* SUBFILAS: Manufacturados agrupados (promo + sueltos) */}
                        {manufacturadosAgrupados.map((am, idx) => (
                            <tr key={am.id + "-" + idx} className="bg-gray-50">
                              <td colSpan={7} className="pl-8 py-2">
                        <span
                            onClick={() => toggleSlide((am.id ?? 0) * 1000 + idx)}
                            className="cursor-pointer font-semibold text-blue-700 hover:underline"
                        >
                          {am.denominacion} (x{am.cantidad})
                        </span>
                                {am.observaciones && (
                                    <span className="ml-2 text-xs font-semibold text-red-600">
                                      ⚠️ {am.observaciones}
                                    </span>
                                )}

                                {openSlideIds.has((am.id ?? 0) * 1000 + idx) && (
                                    <div className="mt-2 ml-4 border-l-4 border-blue-400 pl-4 py-2 bg-white rounded shadow">
                                      <div>
                                        <strong>Preparación:</strong>{" "}
                                        <span>{am.preparacion || "Sin descripción"}</span>
                                      </div>
                                      <div className="mt-2">
                                        <strong>Insumos:</strong>
                                        <ul className="list-disc ml-5">
                                          {am.detalles?.length
                                              ? am.detalles.map((d, i) => (
                                                  <li key={i}>
                                                    {d.articuloInsumo?.denominacion ?? "Insumo desconocido"}{" "}
                                                    <span className="text-gray-500">(x{d.cantidad})</span>
                                                  </li>
                                              ))
                                              : <li>Sin insumos</li>
                                          }
                                        </ul>
                                      </div>
                                    </div>
                                )}
                              </td>
                            </tr>
                        ))}
                      </React.Fragment>
                  );
                })
            ) : (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    No hay pedidos en preparación.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
        {comanda && <ComandaTicket pedido={comanda.pedido} items={comanda.items} />}
      </div>
  );
}
