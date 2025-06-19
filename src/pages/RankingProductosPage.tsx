import React, { useState } from "react";
import { getRanking } from "../services/RankingService";
import type { ProductoRankingDTO } from "../models/DTO/ProductoRankingDTO";
import * as XLSX from "xlsx";
import "./RankingProductosPage.css";

const RankingProductosPage: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [productos, setProductos] = useState<ProductoRankingDTO[]>([]);

    const cargarRanking = async () => {
        try {
            const data = await getRanking(desde, hasta);
            setProductos(data);
        } catch (error) {
            alert("Error al cargar el ranking: " + error);
        }
    };

    const exportarExcel = () => {
        const wb = XLSX.utils.book_new();
        const hoja = XLSX.utils.json_to_sheet(productos);
        XLSX.utils.book_append_sheet(wb, hoja, "Productos Más Vendidos");
        XLSX.writeFile(wb, "ranking_productos.xlsx");
    };

    return (
        <div className="ranking-form">
            <h2>Ranking de Productos Más Vendidos</h2>

            <div className="form-group">
                <label>Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
            </div>

            <div className="form-group">
                <label>Hasta</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
            </div>

            <div className="form-buttons">
                <button type="button" className="btn-submit" onClick={cargarRanking}>Buscar</button>
                <button type="button" className="btn-submit" onClick={exportarExcel} disabled={productos.length === 0}>
                    Exportar Excel
                </button>
            </div>

            {productos.length > 0 && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                    Se encontraron {productos.length} productos vendidos.
                </p>
            )}

            {productos.length === 0 && desde && hasta && (
                <p style={{ color: "red" }}>
                    No se encontraron registros para el rango de fechas seleccionado.
                </p>
            )}

            <div className="ranking-section">
                <h3>Listado</h3>
                <ul>
                    {productos.map((p, index) => (
                        <li key={index}>
                            {p.nombreProducto} - Vendidos: {p.cantidadVendida}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RankingProductosPage;
