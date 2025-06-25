import React, { useState } from "react";
import { getReporteMonetario } from "../services/ReporteMonetarioService";
import type { ReporteMonetarioDTO } from "../models/DTO/ReporteMonetarioDTO";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
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
        } catch (error) {
            MySwal.fire("Error", "No se pudo obtener el reporte", "error");
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
            )}
        </div>
    );
};

export default ReporteMonetarioPage;
