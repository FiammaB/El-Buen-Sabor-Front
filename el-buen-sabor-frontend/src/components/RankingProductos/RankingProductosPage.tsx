import React, { useState } from "react";
import { getRanking } from "../../services/RankingService";
import type { ProductoRankingDTO } from "../../models/DTO/ProductoRankingDTO";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MySwal = withReactContent(Swal);

const RankingProductosPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [ranking, setRanking] = useState<ProductoRankingDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const cargarRanking = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos requeridos", "Seleccioná ambas fechas", "warning");
            return;
        }

        setLoading(true);
        try {
            const data = await getRanking(desde, hasta);
            if (data.length === 0) {
                MySwal.fire("Sin resultados", "No se encontraron ventas en ese período", "info");
            } else {
                setRanking(data);
                MySwal.fire("Éxito", "Ranking cargado correctamente", "success");
            }
        } catch (error) {
            console.error("Error al obtener ranking:", error);
            MySwal.fire("Error", "Hubo un problema al obtener el ranking", "error");
        } finally {
            setLoading(false);
        }
    };

    // Calcular totales para gráfico de torta
    const totalesPorTipo = ranking.reduce((acc, producto) => {
        acc[producto.tipo] = (acc[producto.tipo] || 0) + producto.cantidadVendida;
        return acc;
    }, {} as Record<string, number>);

    const dataTorta = Object.entries(totalesPorTipo).map(([tipo, value]) => ({
        name: tipo,
        value
    }));

    const colores = ["#0088FE", "#FF8042"]; // Cocina y Bebidas

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Ranking de Productos Más Vendidos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="fechaDesde" className="block text-gray-700 font-bold mb-2">Desde</label>
                        <input
                            type="date"
                            id="fechaDesde"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3"
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaHasta" className="block text-gray-700 font-bold mb-2">Hasta</label>
                        <input
                            type="date"
                            id="fechaHasta"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3"
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={cargarRanking}
                        disabled={loading}
                        className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : "Buscar"}
                    </button>
                </div>

                {ranking.length > 0 && (
                    <>
                        <div className="overflow-x-auto mb-6">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Producto</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Cantidad Vendida</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4">{p.nombreProducto}</td>
                                            <td className="py-2 px-4 text-blue-600 font-semibold">{p.cantidadVendida}</td>
                                            <td className="py-2 px-4">{p.tipo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            {/* Gráfico de barras */}
                            <div style={{ width: 600, height: 300 }}>
                                <h4 className="text-center mb-2 font-semibold">Cantidad Vendida por Producto</h4>
                                <ResponsiveContainer>
                                    <BarChart data={ranking}>
                                        <XAxis dataKey="nombreProducto" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="cantidadVendida" fill="#8884d8" name="Cantidad Vendida" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gráfico de torta */}
                            <div style={{ width: 400, height: 300 }}>
                                <h4 className="text-center mb-2 font-semibold">Distribución por Tipo</h4>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={dataTorta}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {dataTorta.map((_, i) => (
                                                <Cell key={i} fill={colores[i % colores.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RankingProductosPage;
