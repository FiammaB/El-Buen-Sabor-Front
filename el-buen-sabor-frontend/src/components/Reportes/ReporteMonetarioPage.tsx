import React, { useState } from "react";
import { getReporteMonetario } from "../../services/ReporteMonetarioService";
import type { ReporteMonetarioDTO } from "../../models/DTO/ReporteMonetarioDTO";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import "./ReporteMonetarioPage.css";

const MySwal = withReactContent(Swal);

const ReporteMonetarioPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [reporte, setReporte] = useState<ReporteMonetarioDTO | null>(null);

    const cargarReporte = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos incompletos", "Seleccioná ambas fechas", "warning");
            return;
        }

        try {
            const datos = await getReporteMonetario(desde, hasta);
            setReporte(datos);
        } catch {
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el reporte",
            });
        }
    };

    const exportarExcel = () => {
        if (!reporte) {
            MySwal.fire("Sin datos", "No hay reporte para exportar", "info");
            return;
        }

        const datos = [
            {
                Ingresos: reporte.totalIngresos,
                Costos: reporte.totalCostos,
                Ganancia: reporte.ganancia,
            },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datos);
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Monetario");
        XLSX.writeFile(wb, "reporte_monetario.xlsx");

        MySwal.fire("Éxito", "El reporte se exportó correctamente", "success");
    };

    return (
        <div className="formulario-reporte">
            <h2>Reporte Monetario</h2>
            <label>Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />

            <label>Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />

            <div className="botones">
                <button onClick={cargarReporte}>Buscar</button>
                <button onClick={exportarExcel}>Exportar Excel</button>
            </div>

            {reporte && (
                <>
                    <div className="tabla-resultados">
                        <table>
                            <thead>
                                <tr>
                                    <th>Total Ingresos</th>
                                    <th>Total Costos</th>
                                    <th>Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${reporte.totalIngresos}</td>
                                    <td>${reporte.totalCostos}</td>
                                    <td>${reporte.ganancia}</td>
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
    );
};

export default ReporteMonetarioPage;
