import React, { useEffect, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { useNavigate } from "react-router-dom";

export default function ControlStockPage() {
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [porcentajeAlerta, setPorcentajeAlerta] = useState(20);
    const navigate = useNavigate();
    const alertaDecimal = porcentajeAlerta / 100;

    useEffect(() => {
        new ArticuloService()
            .getAllArticulosInsumo()
            .then(setInsumos)
            .catch(() => setError("Error cargando ingredientes"));
    }, []);

    // Filtro de stock bajo/cercano
    const insumosBajoStock = insumos.filter(
        i => !i.baja && i.stockActual < i.stockMinimo
    );

    const insumosCercaDelMinimo = insumos.filter(
        i =>
            !i.baja &&
            i.stockActual >= i.stockMinimo &&
            i.stockActual <= i.stockMinimo * (1 + alertaDecimal)
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">🔎 Control de Stock de Ingredientes</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Alerta si el stock es menor a</span>
                    <input
                        type="number"
                        className="border rounded px-2 py-1 w-16"
                        min={1}
                        max={100}
                        value={porcentajeAlerta}
                        onChange={e => setPorcentajeAlerta(Number(e.target.value))}
                    />
                    <span className="text-sm text-gray-700">%</span>
                </div>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <table className="w-full border text-sm rounded shadow">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Ingrediente</th>
                    <th className="p-2">Unidad</th>
                    <th className="p-2">Stock Actual</th>
                    <th className="p-2">Stock Mínimo</th>
                    <th className="p-2">Diferencia</th>
                    <th className="p-2"></th>
                </tr>
                </thead>
                <tbody>
                {[...insumosBajoStock, ...insumosCercaDelMinimo].length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center p-4 text-gray-500">
                            No hay ingredientes bajos ni cerca del mínimo.
                        </td>
                    </tr>
                ) : (
                    [...insumosBajoStock, ...insumosCercaDelMinimo].map(ins => {
                        const bajoMinimo = ins.stockActual < ins.stockMinimo;
                        const diferencia = ins.stockActual - ins.stockMinimo;
                        return (
                            <tr
                                key={ins.id}
                                className={bajoMinimo ? "bg-red-100" : "bg-yellow-50"}
                            >
                                <td className="p-2 font-semibold">{ins.denominacion}</td>
                                <td className="p-2">{ins.unidadMedida?.denominacion}</td>
                                <td className="p-2">{ins.stockActual}</td>
                                <td className="p-2">{ins.stockMinimo}</td>
                                <td className="p-2">
                                    {diferencia > 0 ? "+" : ""}
                                    {diferencia}
                                </td>
                                <td className="p-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                        onClick={() => navigate("/cocinero/compra-ingredientes", { state: { insumoId: ins.id } })}
                                    >
                                        Registrar compra
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
            <div className="text-sm text-gray-500 mt-2">
                <span className="bg-red-200 px-2 py-1 rounded mr-2 inline-block" /> Bajo el mínimo {" "}
                <span className="bg-yellow-200 px-2 py-1 rounded mr-2 inline-block" /> Cerca del mínimo
            </div>
        </div>
    );
}
