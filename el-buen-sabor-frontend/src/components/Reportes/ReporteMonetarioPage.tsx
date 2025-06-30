import React, { useState } from "react";
import { getReporteMonetario } from "../../services/ReporteMonetarioService";
import type { ReporteMonetarioDTO } from "../../models/DTO/ReporteMonetarioDTO";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MySwal = withReactContent(Swal);

const ReporteMonetarioPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [reporte, setReporte] = useState<ReporteMonetarioDTO | null>(null);
    const [loading, setLoading] = useState(false);

    const cargarReporte = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos incompletos", "Seleccioná ambas fechas", "warning");
            return;
        }

        setLoading(true);
        try {
            const datos = await getReporteMonetario(desde, hasta);
            setReporte(datos);
            MySwal.fire("Éxito", "Reporte generado correctamente", "success");
        } catch (error) {
            console.error("Error al obtener el reporte:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el reporte. Por favor, intentá de nuevo más tarde.",
            });
        } finally {
            setLoading(false);
        }
    };

    const exportarExcel = () => {
        if (!reporte) {
            MySwal.fire("Sin datos", "No hay reporte para exportar", "info");
            return;
        }

        const datosParaExcel = [
            {
                "Total Ingresos": reporte.totalIngresos,
                "Total Costos": reporte.totalCostos,
                "Ganancia Neta": reporte.ganancia,
            },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Monetario");
        XLSX.writeFile(wb, `reporte_monetario_${desde}_${hasta}.xlsx`);

        MySwal.fire("Éxito", "El reporte se exportó correctamente", "success");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Reporte Monetario</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="form-group">
                        <label htmlFor="fechaDesde" className="block text-gray-700 text-sm font-bold mb-2">Desde</label>
                        <input
                            type="date"
                            id="fechaDesde"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaHasta" className="block text-gray-700 text-sm font-bold mb-2">Hasta</label>
                        <input
                            type="date"
                            id="fechaHasta"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <button
                        onClick={cargarReporte}
                        disabled={loading}
                        className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Cargando..." : "Buscar Reporte"}
                    </button>
                    <button
                        onClick={exportarExcel}
                        disabled={!reporte || loading}
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Exportar Excel
                    </button>
                </div>

                {reporte && (
                    <>
                        <div className="tabla-resultados bg-gray-50 rounded-lg p-6 shadow-inner">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Resultados del Reporte</h3>
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Ingresos</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Costos</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ganancia Neta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-3 px-4 whitespace-nowrap text-lg font-medium text-green-700">${reporte.totalIngresos.toFixed(2)}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-lg font-medium text-red-700">${reporte.totalCostos.toFixed(2)}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-lg font-bold text-blue-700">${reporte.ganancia.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Gráfico de torta */}
                            <div style={{ width: 400, height: 300 }}>
                                <h4 style={{ textAlign: "center" }}>Distribución Monetaria</h4>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Ingresos', value: reporte.totalIngresos },
                                                { name: 'Costos', value: reporte.totalCostos },
                                                { name: 'Ganancia', value: reporte.ganancia },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            <Cell fill="#00C49F" />
                                            <Cell fill="#FF8042" />
                                            <Cell fill="#0088FE" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gráfico de barras */}
                            <div style={{ width: 500, height: 300 }}>
                                <h4 style={{ textAlign: "center" }}>Comparación de valores</h4>
                                <ResponsiveContainer>
                                    <BarChart data={[reporte]}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="totalIngresos" fill="#00C49F" name="Ingresos" />
                                        <Bar dataKey="totalCostos" fill="#FF8042" name="Costos" />
                                        <Bar dataKey="ganancia" fill="#0088FE" name="Ganancia" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReporteMonetarioPage;
