/* // src/pages/auth/CocineroDashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../components/Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PedidoService } from "../../services/PedidoService";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";
import React from "react";

export default function CocineroDashboard() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const pedidoService = new PedidoService();
    const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
    const [openSlide, setOpenSlide] = useState<number | null>(null);
    const [delayMinutes, setDelayMinutes] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (role === "COCINERO") {
            fetchPedidos();
        }
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

    const cambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await pedidoService.actualizarEstadoPedido(id, nuevoEstado);
            fetchPedidos();
        } catch (error) {
            console.error("Error al actualizar estado:", error);
        }
    };

    const agregarRetraso = async (pedido: IPedidoDTO, minutos: number) => {
        if (!pedido.id) return;
        // Calculá la nueva hora
        const original = pedido.horaEstimadaFinalizacion || "";
        // parse original ("18:35:22" o "18:35")
        const [h, m] = original.split(":");
        const fecha = new Date();
        fecha.setHours(Number(h), Number(m));
        fecha.setMinutes(fecha.getMinutes() + minutos);

        // armá string nueva hora
        const nuevaHora = fecha
            .toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", hour12: false });

        // Hacé un update al pedido (PUT) enviando la nueva hora
        try {
            await pedidoService.actualizarHoraEstimada(pedido.id, nuevaHora); // te paso cómo abajo
            fetchPedidos();
        } catch (err) {
            alert("No se pudo actualizar la hora");
        }
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
            <h2 className="text-3xl font-bold text-green-700 mb-6">Panel del Cocinero 👨‍🍳</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-green-300">
                    <h3 className="text-lg font-bold mb-2">🍳 Ver Pedidos para Preparar</h3>
                    <p className="text-sm text-gray-600 mb-4">Visualizá y gestioná los pedidos asignados.</p>
                    <button
                        onClick={fetchPedidos}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Actualizar Pedidos
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
                    <h3 className="text-lg font-bold mb-2">🚪 Cerrar Sesión</h3>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="p-8">
   //             {/* ...Cabecera y acciones... */
//                 <h3 className="text-xl font-semibold mb-4">📋 Pedidos en Preparación:</h3>
//                 <table className="min-w-full border border-gray-300 shadow-sm">
//                     <thead>
//                         <tr className="bg-gray-100">
//                             <th className="p-2">ID</th>
//                             <th className="p-2">Fecha</th>
//                             <th className="p-2">Total</th>
//                             <th className="p-2">Hora Estimada</th>
//                             <th className="p-2 text-center">+Tiempo</th>
//                             <th className="p-2">Acción</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {pedidos.length > 0 ? (
//                             pedidos.map((pedido) => {
//                                 let nuevoEstado = "";
//                                 let botonTexto = "";
//                                 let buttonColor = "";

//                                 if (pedido.estado === "EN_COCINA") {
//                                     nuevoEstado = "EN_PREPARACION";
//                                     botonTexto = "Marcar en Preparación";
//                                     buttonColor = "bg-blue-500 hover:bg-blue-600";
//                                 } else if (pedido.estado === "EN_PREPARACION") {
//                                     nuevoEstado = "LISTO";
//                                     botonTexto = "Marcar como Listo";
//                                     buttonColor = "bg-green-600 hover:bg-green-700";
//                                 } else {
//                                     // No mostrar botón para otros estados
//                                     nuevoEstado = "";
//                                     botonTexto = "";
//                                     buttonColor = "";
//                                 }

//                                 return (
//                                     <React.Fragment key={pedido.id}>
//                                         <tr className="border-t">
//                                             <td className="p-2 text-center">{pedido.id}</td>
//                                             <td className="p-2 text-center">{pedido.fechaPedido}</td>
//                                             <td className="p-2 text-center">${pedido.total?.toFixed(2)}</td>
//                                             <td className="p-2 text-center">
//                                                 {pedido.horaEstimadaFinalizacion
//                                                     ? pedido.horaEstimadaFinalizacion.slice(0, 5)
//                                                     : "Sin asignar"}
//                                             </td>
//                                             <td className="p-2 text-center">
//                                                 <div className="flex items-center justify-center gap-1">
//                                                     <input
//                                                         type="number"
//                                                         min={1}
//                                                         placeholder="Min"
//                                                         className="border rounded p-1 w-14 text-center"
//                                                         value={delayMinutes[pedido.id!] || ""}
//                                                         onChange={e => setDelayMinutes({
//                                                             ...delayMinutes,
//                                                             [pedido.id!]: Number(e.target.value)
//                                                         })}
//                                                     />
//                                                     <button
//                                                         className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
//                                                         onClick={() => agregarRetraso(pedido, delayMinutes[pedido.id!] || 0)}
//                                                     >
//                                                         +Min
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                             <td className="p-2 text-center">
//                                                 {nuevoEstado && (
//                                                     <button
//                                                         onClick={() => cambiarEstado(pedido.id!, nuevoEstado)}
//                                                         className={text - white px-3 py-1 rounded ${buttonColor}}
//                               >
//                                                 {botonTexto}
//                                             </button>
//                           )}
//                                         </td>
//                                     </tr>
//                       {/* Subfila para manufacturados */ }
//                                 {
//                                     pedido.detalles.filter(det => det.articuloManufacturado).map((det, idx) => (
//                                         <tr key={idx} className="bg-gray-50">
//                                             <td colSpan={6} className="pl-8 py-2">
//                                                 <span
//                                                     onClick={() => setOpenSlide(openSlide === det.articuloManufacturado!.id ? null : det.articuloManufacturado!.id)}
//                                                     className="cursor-pointer font-semibold text-blue-700 hover:underline"
//                                                 >
//                                                     ▶ {det.articuloManufacturado?.denominacion} (x{det.cantidad})
//                                                 </span>
//                                                 {openSlide === det.articuloManufacturado!.id && (
//                                                     <div className="mt-2 ml-4 border-l-4 border-blue-400 pl-4 py-2 bg-white rounded shadow">
//                                                         <div>
//                                                             <strong>Preparación:</strong>{" "}
//                                                             <span>{det.articuloManufacturado?.preparacion || "Sin descripción"}</span>
//                                                         </div>
//                                                         <div className="mt-2">
//                                                             <strong>Insumos:</strong>
//                                                             <ul className="list-disc ml-5">
//                                                                 {det.articuloManufacturado?.detalles?.map((d, i) => (
//                                                                     <li key={i}>
//                                                                         {d.articuloInsumo.denominacion} <span className="text-gray-500">(x{d.cantidad})</span>
//                                                                     </li>
//                                                                 )) || <li>Sin insumos</li>}
//                                                             </ul>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))
//                                 }
//                     </React.Fragment>
//                     );
//               })
//                     ) : (
//                     <tr>
//                         <td colSpan={6} className="text-center p-4">
//                             No hay pedidos en preparación.
//                         </td>
//                     </tr>
//           )}
//                 </tbody>
//             </table>
//         </div>
//     </div >
//   );
// } */