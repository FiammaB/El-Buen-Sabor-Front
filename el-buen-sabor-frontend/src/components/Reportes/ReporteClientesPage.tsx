import React, { useState } from "react";
import { getReporteClientes } from "../../services/ClienteReporteService";
import type { ClienteReporteDTO } from "../../models/DTO/ClienteReporteDTO";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from "react-router-dom"; // Importa useNavigate

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'; // Importa los componentes de Recharts

const MySwal = withReactContent(Swal);

// Definir colores para los gráficos de torta
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'];


const ReporteClientesPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [ordenarPor, setOrdenarPor] = useState("cantidad");
    const [clientes, setClientes] = useState<ClienteReporteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Inicializa useNavigate

    const cargarReporte = async () => {
        if (!desde || !hasta) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Debés seleccionar ambas fechas para continuar.',
            });
            return;
        }

        setLoading(true);
        try {
            const data = await getReporteClientes(desde, hasta, ordenarPor);
            setClientes(data);

            if (data.length === 0) {
                MySwal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron pedidos en ese rango de fechas.',
                });
            } else {
                MySwal.fire({
                    icon: 'success',
                    title: 'Reporte generado',
                    text: 'El reporte de clientes se cargó correctamente.',
                });
            }
        } catch (error) {
            console.error("Error al cargar el reporte de clientes:", error);
            MySwal.fire({
                icon: 'error',
                title: 'Error al cargar el reporte',
                text: (error as Error).message || 'Ocurrió un error inesperado al intentar obtener el reporte.',
            });
        } finally {
            setLoading(false);
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

        const datosParaExcel = clientes.map(c => ({
            "ID Cliente": c.idPersona,
            "Nombre": c.nombre,
            "Total Gastado": c.totalGastado,
            "Cantidad de Pedidos": c.cantidadPedidos,
        }));

        const wb = XLSX.utils.book_new();
        const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
        XLSX.utils.book_append_sheet(wb, hoja, "Reporte Clientes");
        XLSX.writeFile(wb, `reporte_clientes_${desde}_${hasta}.xlsx`);

        MySwal.fire({
            icon: 'success',
            title: 'Exportación exitosa',
            text: 'El archivo Excel fue generado correctamente.',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8"> {/* Aumentado a max-w-6xl para gráficos */}
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Reporte de Pedidos por Cliente</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                        <label htmlFor="fechaDesde" className="block text-gray-700 text-sm font-bold mb-2">Desde</label>
                        <input
                            type="date"
                            id="fechaDesde"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            required
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
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div className="form-group mb-6">
                    <label htmlFor="ordenarPor" className="block text-gray-700 text-sm font-bold mb-2">Ordenar por</label>
                    <select
                        id="ordenarPor"
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="cantidad">Cantidad de Pedidos</option>
                        <option value="importe">Importe Total</option>
                    </select>
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
                        disabled={clientes.length === 0 || loading}
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

                {!loading && clientes.length > 0 && (
                    <>
                        <div className="tabla-resultados bg-gray-50 rounded-lg p-6 shadow-inner mb-8"> {/* Añadido mb-8 */}
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Resultados del Reporte</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Apellido</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cantidad de Pedidos</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Gastado</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {clientes.map((c) => (
                                            <tr key={c.idPersona} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{c.nombre}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{c.apellido}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">{c.cantidadPedidos}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-green-700">${c.totalGastado?.toFixed(2)}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm">
                                                    <button
                                                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-xs"
                                                        onClick={() => navigate(`/admin/clientes/${c.idPersona}/pedidos`)} // <-- CAMBIO CLAVE AQUÍ
                                                    >
                                                        Ver Pedidos
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Contenedores para los gráficos */}
                        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 mt-8"> {/* Añadido mt-8 */}
                            <div className="bg-gray-50 rounded-lg p-6 shadow-inner w-full lg:w-1/2"> {/* Estilos para cada gráfico */}
                                <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Cantidad de pedidos por cliente</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={clientes}>
                                        <XAxis
                                            dataKey={(cliente) => `  ${cliente.apellido}`}
                                            tickLine={false}
                                            axisLine={false}
                                            style={{ fontSize: '0.75rem' }} />
                                        <YAxis tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="cantidadPedidos" fill="#8884d8" name="Pedidos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 shadow-inner w-full lg:w-1/2"> {/* Estilos para cada gráfico */}
                                <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Proporción del total gastado</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={clientes}
                                            dataKey="totalGastado"
                                            nameKey="nombre"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#82ca9d"
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Formato de porcentaje
                                        >
                                            {clientes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`$${(value as number).toFixed(2)}`, props.payload.nombre]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {/* Mensaje de no resultados o si no se ha buscado aún */}
                {!loading && clientes.length === 0 && (desde || hasta) && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No se encontraron clientes para el rango de fechas seleccionado.</p>
                    </div>
                )}
                {!loading && clientes.length === 0 && !desde && !hasta && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Ingresa un rango de fechas y haz clic en "Buscar Reporte" para ver los clientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReporteClientesPage;