import React, { useState } from "react";
import { getRanking } from "../../services/RankingService"; // Asegúrate de que la ruta sea correcta
import type { ProductoRankingDTO } from "../../models/DTO/ProductoRankingDTO"; // Asegúrate de que la ruta sea correcta
import * as XLSX from "xlsx";
import Swal from "sweetalert2"; // Importar Swal
import withReactContent from "sweetalert2-react-content"; // Importar withReactContent

const MySwal = withReactContent(Swal);

const RankingProductosPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [productos, setProductos] = useState<ProductoRankingDTO[]>([]);
    const [loading, setLoading] = useState(false); // Ya existe, lo usaremos correctamente

    const cargarRanking = async () => {
        if (!desde || !hasta) {
            MySwal.fire("Campos incompletos", "Seleccioná ambas fechas", "warning");
            return;
        }

        setLoading(true); // Activar carga
        try {
            console.log("Desde:", desde, "Hasta:", hasta);
            const data = await getRanking(desde, hasta);
            setProductos(data);

            if (data.length === 0) {
                MySwal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron productos vendidos en ese rango de fechas.',
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
            setLoading(false); // Desactivar carga
        }
    };

    const exportarExcel = () => {
        if (productos.length === 0) {
            MySwal.fire("Sin datos", "No hay ranking para exportar", "info");
            return;
        }

        const datosParaExcel = productos.map(p => ({
            "Nombre Producto": p.nombreProducto,
            "Cantidad Vendida": p.cantidadVendida,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Productos Más Vendidos");
        XLSX.writeFile(wb, `ranking_productos_${desde}_${hasta}.xlsx`);

        MySwal.fire("Éxito", "El reporte se exportó correctamente", "success");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8"> {/* Contenedor principal de la página */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8"> {/* Contenedor del formulario/ranking */}
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Ranking de Productos Más Vendidos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {!loading && productos.length > 0 && (
                    <div className="ranking-section bg-gray-50 rounded-lg p-6 shadow-inner">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Listado de Productos Más Vendidos</h3>
                        <div className="overflow-x-auto"> {/* Para scroll horizontal en tablas pequeñas */}
                            <ul className="divide-y divide-gray-200">
                                {productos.map((p, index) => (
                                    <li key={index} className="flex justify-between items-center py-3 px-2 hover:bg-white transition-colors">
                                        <span className="text-lg font-medium text-gray-800">{p.nombreProducto}</span>
                                        <span className="text-lg font-semibold text-orange-600">Vendidos: {p.cantidadVendida}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Mensaje de no resultados o si no se ha buscado aún */}
                {!loading && productos.length === 0 && (desde || hasta) && ( // Si no está cargando, no hay productos, pero se intentó buscar
                    <div className="text-center py-12 text-gray-500">
                        <p>No se encontraron productos vendidos para el rango de fechas seleccionado.</p>
                    </div>
                )}
                {!loading && productos.length === 0 && !desde && !hasta && ( // Si no hay búsqueda aún
                    <div className="text-center py-12 text-gray-500">
                        <p>Ingresa un rango de fechas y haz clic en "Buscar Ranking" para ver los productos más vendidos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingProductosPage;