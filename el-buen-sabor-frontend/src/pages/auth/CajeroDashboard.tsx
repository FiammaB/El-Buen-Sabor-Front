// src/pages/CajeroDashboard.tsx
import { useEffect, useState } from "react";
import PedidoService from "../../services/PedidoService";
import { useAuth } from "../auth/Context/AuthContext";
import type { IPedidoDTO } from "../../models/DTO/IPedidoDTO";


export default function CajeroDashboard() {
  const [pedidos, setPedidos] = useState<IPedidoDTO[]>([]);
  const pedidoService = new PedidoService();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await pedidoService.getPedidosParaCobrar();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const cobrarPedido = async (id: number) => {
    try {
      await pedidoService.cobrarPedido(id);
      await cargarPedidos();
    } catch (error) {
      console.error("Error al cobrar pedido:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pedidos para Cobrar</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Fecha</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Estado</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td className="border px-4 py-2">{pedido.id}</td>
              <td className="border px-4 py-2">{pedido.fechaPedido}</td>
              <td className="border px-4 py-2">${pedido.total}</td>
              <td className="border px-4 py-2">{pedido.estado}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => cobrarPedido(pedido.id!)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Cobrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
