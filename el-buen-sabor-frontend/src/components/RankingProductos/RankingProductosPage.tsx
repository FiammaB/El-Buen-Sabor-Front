import React, { useState } from "react";
import { getRanking } from "../../services/RankingService"; // Asegúrate de que la ruta sea correcta
import type { ProductoRankingDTO } from "../../models/DTO/ProductoRankingDTO"; // Asegúrate de que la ruta sea correcta
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";

// Importar componentes de Recharts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const MySwal = withReactContent(Swal);

const RankingProductosPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [productos, setProductos] = useState<ProductoRankingDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const cargarRanking = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos incompletos", "Seleccioná ambas fechas", "warning");
            return;
        }

        setLoading(true);
        try {
            console.log("Desde:", desde, "Hasta:", hasta);
            const data = await getRanking(desde, hasta);
            setProductos(data);

            if (data.length === 0) {
                MySwal.fire({
                    icon: "info",
                    title: "Sin resultados",
                    text: "No se encontraron productos vendidos en ese rango de fechas.",
                });
            } else {
                MySwal.fire("Éxito", "Ranking generado correctamente", "success");
            }
        } catch (error) {
            console.error("Error al cargar el ranking:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el ranking. Por favor, intentá de nuevo más tarde.",
            });
        } finally {
            setLoading(false);
        }
    };

    const exportarExcel = () => {
        if (productos.length === 0) {
            MySwal.fire("Sin datos", "No hay ranking para exportar", "info");
            return;
        }

        const datosParaExcel = productos.map((p) => ({
            "Nombre Producto": p.nombreProducto,
            "Cantidad Vendida": p.cantidadVendida,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Productos Más Vendidos");
        XLSX.writeFile(wb, `ranking_productos_${desde}_${hasta}.xlsx`);

        MySwal.fire("Éxito", "El reporte se exportó correctamente", "success");
    };

    // --- Preparación de datos y colores para los gráficos ---
    // Los datos para el gráfico de barras ya están en el formato correcto (productos)
    // Para el gráfico de torta, necesitaremos agrupar por alguna categoría si tu DTO la tuviera,
    // pero si solo tienes nombreProducto y cantidadVendida, podemos simular una distribución por tipo
    // o simplemente usar los productos como están para el ejemplo.
    // Asumiremos que quieres un gráfico de torta de la cantidad vendida de cada producto.
    // Si tu DTO `ProductoRankingDTO` tuviera un campo `tipoProducto` o `categoria`,
    // podríamos agrupar por eso para un gráfico de torta más significativo.
    // Para este ejemplo, cada slice será un producto.

    const dataTorta = productos.map((p) => ({
        name: p.nombreProducto,
        value: p.cantidadVendida,
    }));

    const colores = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7f0e",
        "#a4de6c",
        "#d0ed57",
        "#83a6ed",
        "#8dd1e1",
        "#f3b7d6",
        "#f15f79",
    ]; // Más colores para productos

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {" "}
            {/* Contenedor principal de la página */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                {" "}
                {/* Contenedor del formulario/ranking */}
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Ranking de Productos Más Vendidos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="form-group">
                        <label
                            htmlFor="fechaDesde"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Desde
                        </label>
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
                        <label
                            htmlFor="fechaHasta"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Hasta
                        </label>
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
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <button
                        type="button"
                        className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={cargarRanking}
                        disabled={loading}
                    >
                        {loading ? "Cargando..." : "Buscar Ranking"}
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={exportarExcel}
                        disabled={productos.length === 0 || loading}
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
                {!loading && productos.length > 0 && (
                    <div className="ranking-section bg-gray-50 rounded-lg p-6 shadow-inner">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                            Listado de Productos Más Vendidos
                        </h3>
                        <div className="overflow-x-auto">
                            {" "}
                            {/* Para scroll horizontal en tablas pequeñas */}
                            <ul className="divide-y divide-gray-200">
                                {productos.map((p, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center py-3 px-2 hover:bg-white transition-colors"
                                    >
                                        <span className="text-lg font-medium text-gray-800">
                                            {p.nombreProducto}
                                        </span>
                                        <span className="text-lg font-semibold text-orange-600">
                                            Vendidos: {p.cantidadVendida}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Contenedor de gráficos */}
                        <div className="flex flex-wrap justify-center gap-8 mt-8">
                            {/* Gráfico de barras */}
                            <div style={{ width: 600, height: 300 }}>
                                <h4 className="text-center mb-2 font-semibold">
                                    Cantidad Vendida por Producto
                                </h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productos}>
                                        <XAxis dataKey="nombreProducto" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="cantidadVendida"
                                            fill="#8884d8"
                                            name="Cantidad Vendida"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Gráfico de torta */}
                            <div style={{ width: 400, height: 300 }}>
                                <h4 className="text-center mb-2 font-semibold">
                                    Distribución de Ventas por Producto
                                </h4>
                                <ResponsiveContainer width="100%" height="100%">
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
                                                <Cell key={`cell-${i}`} fill={colores[i % colores.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
                {/* Mensaje de no resultados o si no se ha buscado aún */}
                {!loading && productos.length === 0 && (desde || hasta) && (
                    <div className="text-center py-12 text-gray-500">
                        <p>
                            No se encontraron productos vendidos para el rango de fechas
                            seleccionado.
                        </p>
                    </div>
                )}
                {!loading && productos.length === 0 && !desde && !hasta && (
                    <div className="text-center py-12 text-gray-500">
                        <p>
                            Ingresa un rango de fechas y haz clic en "Buscar Ranking" para ver
                            los productos más vendidos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingProductosPage;