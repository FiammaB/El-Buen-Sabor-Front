import React, { useEffect, useState } from 'react';
import { ArticuloService } from '../../services/ArticuloService';
import { ArticuloInsumo } from '../../models/Articulos/ArticuloInsumo';
import axios from "axios";

interface ArticuloInsumo {
    id: number;
    denominacion: string;
    stockActual: number;
    precioCompra: number;
    baja: boolean;
    unidadMedida?: { denominacion: string };
}

const articuloService = new ArticuloService();

const CompraIngredientesPage: React.FC = () => {
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [cantidad, setCantidad] = useState<{ [id: number]: number }>({});
    const [error, setError] = useState<string | null>(null);

    const fetchInsumos = async () => {
        try {
            const data = await articuloService.getAllArticulosInsumo();
            setInsumos(data);
        } catch {
            setError('Error cargando insumos');
        }
    };

    useEffect(() => {
        fetchInsumos();
    }, []);

    const handleSumarStock = async (id: number) => {
        try {
            const cant = cantidad[id] || 0;
            await articuloService.sumarStock(id, cant);
            setCantidad(prev => ({ ...prev, [id]: 0 }));
            await fetchInsumos();
        } catch {
            setError('Error al actualizar el stock');
        }
    };

    const handleToggleBaja = async (id: number, baja: boolean) => {
        try {

            setInsumos(prev =>
                prev.map(ins =>
                    ins.id === id ? { ...ins, baja: baja } : ins
                )
            );
            await axios.patch(`/api/articuloInsumo/${id}/baja?baja=${baja}`);

        } catch {
            setError('Error al cambiar el estado');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Registrar Compra de Ingredientes</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <table className="w-full border">
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Stock Actual</th>
                    <th>Precio Compra</th>
                    <th>Sumar Stock</th>
                    <th>Activo</th>
                </tr>
                </thead>
                <tbody>
                {insumos.map(ins => (
                    <tr key={ins.id} className={ins.baja ? 'bg-gray-100' : ''}>
                        <td>{ins.denominacion}</td>
                        <td>{ins.unidadMedida?.denominacion || '-'}</td>
                        <td>{ins.stockActual}</td>
                        <td>${ins.precioCompra.toFixed(2)}</td>
                        <td>
                            <input
                                type="number"
                                min={1}
                                disabled={ins.baja}
                                value={cantidad[ins.id] ?? ''}
                                onChange={e => setCantidad({ ...cantidad, [ins.id]: Number(e.target.value) })}
                                className="border p-1 w-20"
                                placeholder="Cantidad"
                            />
                            <button
                                className="ml-2 px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                                disabled={ins.baja || !(cantidad[ins.id] > 0)}
                                onClick={() => handleSumarStock(ins.id)}
                            >
                                Sumar
                            </button>
                        </td>
                        <td>
                            <input
                                type="checkbox"
                                checked={!ins.baja}
                                onChange={e => handleToggleBaja(ins.id, !e.target.checked)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompraIngredientesPage;
