import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface PedidoDTO {
  id: number;
  fechaPedido: string;
  estado: string;
  total: number;
  persona: {
    nombre: string;
    apellido: string;
  };
}

export default function PedidosEntregadosAdmin() {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Limpiamos antes de cargar para evitar que quede un estado viejo
    setPedidos([]);
    setCargando(true);

    axios
      .get("/api/pedidos/cajero")
      .then((res) => {
        setPedidos(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar pedidos entregados:", err);
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando pedidos entregados...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos Entregados</h1>
      {pedidos.length === 0 ? (
        <p>No hay pedidos entregados.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Cliente</th>
              <th className="border border-gray-300 p-2">Fecha</th>
              <th className="border border-gray-300 p-2">Estado</th>
              <th className="border border-gray-300 p-2">Total</th>
              <th className="border border-gray-300 p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos
              .filter((p) => p.estado === "ENTREGADO")
              .map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">{pedido.id}</td>
                  <td className="border border-gray-300 p-2">
                    {pedido.persona?.nombre} {pedido.persona?.apellido}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(pedido.fechaPedido).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">{pedido.estado}</td>
                  <td className="border border-gray-300 p-2">
                    ${pedido.total.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/admin/pedidos/${pedido.id}`, { replace: true })
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
