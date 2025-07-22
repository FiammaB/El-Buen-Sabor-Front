import React, { useState } from "react";
import { getReporteMonetarioDiario } from "../../services/ReporteMonetarioService";
import type { ReporteMonetarioDiarioDTO } from "../../models/DTO/ReporteMonetarioDTO";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

const ReporteMonetarioPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [reporteDiario, setReporteDiario] = useState<ReporteMonetarioDiarioDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const cargarReporte = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos incompletos", "Seleccioná ambas fechas", "warning");
            return;
        }
        setLoading(true);
        try {
            const datos = await getReporteMonetarioDiario(desde, hasta);
            setReporteDiario(datos);
            if (datos.length > 0) {
                MySwal.fire("Éxito", "Reporte generado correctamente", "success");
            } else {
                MySwal.fire("Sin resultados", "No se encontraron movimientos en el rango de fechas.", "info");
            }
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

    // Calcula los totales generales a partir de los datos diarios
    const totales = reporteDiario.reduce((acc, dia) => {
        acc.ingresos += dia.ingresos;
        acc.costos += dia.costos;
        acc.ganancia += dia.ganancia;
        return acc;
    }, { ingresos: 0, costos: 0, ganancia: 0 });

    const exportarExcel = () => {
        if (reporteDiario.length === 0) {
            MySwal.fire("Sin datos", "No hay reporte para exportar", "info");
            return;
        }
        const datosParaExcel = reporteDiario.map(dia => ({
            "Fecha": dia.fecha,
            "Ingresos": dia.ingresos,
            "Costos": dia.costos,
            "Ganancia": dia.ganancia,
        }));

        // Añadir una fila de totales al final
        datosParaExcel.push({
            "Fecha": "TOTAL",
            "Ingresos": totales.ingresos,
            "Costos": totales.costos,
            "Ganancia": totales.ganancia,
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Monetario Diario");
        XLSX.writeFile(wb, `reporte_monetario_${desde}_${hasta}.xlsx`);
        MySwal.fire("Éxito", "El reporte se exportó correctamente", "success");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
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
                        disabled={reporteDiario.length === 0 || loading}
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Exportar Excel
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition duration-200"
                        onClick={() => navigate(-1)}
                    >
                        Volver Atrás
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {!loading && reporteDiario.length > 0 && (
                    <>
                        <div className="tabla-resultados bg-gray-50 rounded-lg p-6 shadow-inner">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Resultados del Reporte (Totales)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase">Total Ingresos</p>
                                    <p className="text-2xl font-bold text-green-600">${totales.ingresos.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase">Total Costos</p>
                                    <p className="text-2xl font-bold text-red-600">${totales.costos.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase">Ganancia Neta</p>
                                    <p className="text-2xl font-bold text-blue-600">${totales.ganancia.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-center text-xl font-bold text-gray-800 mb-4">Comparación de Valores por Día</h4>
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart data={reporteDiario} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                                        <Bar dataKey="costos" fill="#ef4444" name="Costos" />
                                        <Bar dataKey="ganancia" fill="#3b82f6" name="Ganancia" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Gráfico de Torta (AÑADIDO) */}
                            <div className="flex-1 min-w-[300px]" style={{ height: 400 }}>
                                <h4 className="text-center text-xl font-bold text-gray-800 mb-4">Distribución Total</h4>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Ganancia', value: totales.ganancia },
                                                { name: 'Costos', value: totales.costos },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            label
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
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

export default ReporteMonetarioPage;