import React, { useState } from "react";
import { getReporteClientes } from "../../services/ClienteReporteService";
import type { ClienteReporteDTO } from "../../models/DTO/ClienteReporteDTO";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import "./ReporteClientesPage.css";

const MySwal = withReactContent(Swal);

const ReporteClientesPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [ordenarPor, setOrdenarPor] = useState("cantidad");
    const [clientes, setClientes] = useState<ClienteReporteDTO[]>([]);

    const cargarReporte = async () => {
        if (!desde || !hasta) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Debés seleccionar ambas fechas para continuar.',
            });
            return;
        }

        try {
            const data = await getReporteClientes(desde, hasta, ordenarPor);
            setClientes(data);

            if (data.length === 0) {
                MySwal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron pedidos en ese rango de fechas.',
                });
            }

        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: 'Error al cargar el reporte',
                text: (error as Error).message || 'Ocurrió un error inesperado.',
            });
        }
    };

    const exportarExcel = () => {
        if (clientes.length === 0) {
            MySwal.fire({
                icon: 'info',
                title: 'Nada para exportar',
                text: 'Primero realizá una búsqueda con resultados.',
            });
            return;
        }

        const wb = XLSX.utils.book_new();
        const hoja = XLSX.utils.json_to_sheet(clientes);
        XLSX.utils.book_append_sheet(wb, hoja, "Reporte Clientes");
        XLSX.writeFile(wb, "reporte_clientes.xlsx");

        MySwal.fire({
            icon: 'success',
            title: 'Exportación exitosa',
            text: 'El archivo Excel fue generado correctamente.',
        });
    };

    return (
        <div className="reporte-clientes-container">
            <h2>Reporte de Pedidos por Cliente</h2>

            <div className="form-group">
                <label>Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Hasta</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Ordenar por</label>
                <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
                    <option value="cantidad">Cantidad de Pedidos</option>
                    <option value="importe">Importe Total</option>
                </select>
            </div>

            <div className="botones">
                <button className="btn-submit" onClick={cargarReporte}>Buscar</button>
                <button className="btn-submit" onClick={exportarExcel} disabled={clientes.length === 0}>Exportar Excel</button>
            </div>

            {clientes.length > 0 && (
                <>
                    <table className="reporte-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Cantidad de Pedidos</th>
                                <th>Total Gastado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((c) => (
                                <tr key={c.idCliente}>
                                    <td>{c.nombre}</td>
                                    <td>{c.apellido}</td>
                                    <td>{c.cantidadPedidos}</td>
                                    <td>${c.totalGastado?.toFixed(2)}</td>
                                    <td>
                                        <button className="btn-detalle" onClick={() => {
                                            MySwal.fire({
                                                icon: 'info',
                                                title: 'Funcionalidad en desarrollo',
                                                text: 'Próximamente vas a poder ver el detalle de pedidos por cliente.',
                                            });
                                        }}>
                                            Ver Pedidos
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Gráficos */}
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Gráfico de barras */}
                        <div style={{ width: 500, height: 300 }}>
                            <h4 style={{ textAlign: "center" }}>Cantidad de pedidos por cliente</h4>
                            <ResponsiveContainer>
                                <BarChart data={clientes}>
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="cantidadPedidos" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gráfico de torta */}
                        <div style={{ width: 400, height: 300 }}>
                            <h4 style={{ textAlign: "center" }}>Proporción del total gastado</h4>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={clientes}
                                        dataKey="totalGastado"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#82ca9d"
                                        label
                                    >
                                        {clientes.map((_, index) => (
                                            <Cell key={index} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReporteClientesPage;
