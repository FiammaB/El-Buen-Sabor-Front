import { useEffect, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { getSucursales, type ISucursalDTO } from "../../services/SucursalService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/Context/AuthContext.tsx";


export default function ControlStockPage() {
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [sucursales, setSucursales] = useState<ISucursalDTO[]>([]);
    const [sucursalId, setSucursalId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [porcentajeAlerta, setPorcentajeAlerta] = useState(20);
    const navigate = useNavigate();
    const alertaDecimal = porcentajeAlerta / 100;
    const { role } = useAuth();

    useEffect(() => {
        new ArticuloService()
            .getAllArticulosInsumo()
            .then(setInsumos)
            .catch(() => setError("Error cargando ingredientes"));
        getSucursales()
            .then(data => {
                setSucursales(data);
                if (data.length > 0) setSucursalId(data[0].id);
            })
            .catch(() => setError("Error cargando sucursales"));
    }, []);

    // Stock EN LA SUCURSAL elegida (cada sucursal tiene su propio stock, no un pool compartido)
    const stockEnSucursal = (ins: ArticuloInsumo) =>
        ins.stockPorSucursal.find(s => s.sucursalId === sucursalId);

    const insumosConStockAca = insumos
        .map(ins => ({ ins, stock: stockEnSucursal(ins) }))
        .filter((x): x is { ins: ArticuloInsumo; stock: NonNullable<ReturnType<typeof stockEnSucursal>> } => !!x.stock);

    // Filtro de stock bajo/cercano
    const insumosBajoStock = insumosConStockAca.filter(
        ({ stock }) => stock.stockActual < stock.stockMinimo
    );

    const insumosCercaDelMinimo = insumosConStockAca.filter(
        ({ stock }) =>
            stock.stockActual >= stock.stockMinimo &&
            stock.stockActual <= stock.stockMinimo * (1 + alertaDecimal)
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

            <div className="mb-4 flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sucursal:</label>
                <select
                    className="border rounded px-2 py-1"
                    value={sucursalId ?? ""}
                    onChange={e => setSucursalId(Number(e.target.value))}
                >
                    {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                </select>
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
                            No hay ingredientes bajos ni cerca del mínimo en esta sucursal.
                        </td>
                    </tr>
                ) : (
                    [...insumosBajoStock, ...insumosCercaDelMinimo].map(({ ins, stock }) => {
                        const bajoMinimo = stock.stockActual < stock.stockMinimo;
                        const diferencia = stock.stockActual - stock.stockMinimo;
                        const compraRoute =
                            role === "ADMINISTRADOR"
                                ? "/admin/compra-ingredientes"
                                : "/cocinero/compra-ingredientes";

                        return (
                            <tr
                                key={ins.id}
                                className={bajoMinimo ? "bg-red-100" : "bg-yellow-50"}
                            >
                                <td className="p-2 font-semibold">{ins.denominacion}</td>
                                <td className="p-2">{ins.unidadMedida?.denominacion}</td>
                                <td className="p-2">{stock.stockActual}</td>
                                <td className="p-2">{stock.stockMinimo}</td>
                                <td className="p-2">
                                    {diferencia > 0 ? "+" : ""}
                                    {diferencia}
                                </td>
                                <td className="p-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                        onClick={() => navigate(compraRoute, { state: { insumoId: ins.id, sucursalId } })}
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
