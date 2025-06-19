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
    const [precioCompra, setPrecioCompra] = useState<{ [id: number]: number }>({});


    const fetchInsumos = async () => {
        try {
            const data = await articuloService.getAllArticulosInsumo();
            setInsumos(data);
            // Setear precioCompra de cada insumo (estado controlado)
            const precios: { [id: number]: number } = {};
            data.forEach(ins => { precios[ins.id] = ins.precioCompra; });
            setPrecioCompra(precios);
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
            setError('Error al actualizar el stock y/o precio');
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

    const handleActualizarPrecio = async (id: number) => {
        try {
            // Lógica para actualizar solo el precio de compra
            const precio = precioCompra[id];
            // Opcional: Validar que el precio es válido y distinto al actual
            await axios.put(`/api/articuloInsumo/${id}/actualizar-precio?precioCompra=${precio}`);
            await fetchInsumos();
        } catch {
            setError('Error al actualizar el precio de compra');
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
                    <th>Nuevo Precio</th> {/* <--- Nueva columna */}
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
                        {/* Nuevo Precio */}
                        <td>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={precioCompra[ins.id] ?? ''}
                                onChange={e => setPrecioCompra({ ...precioCompra, [ins.id]: Number(e.target.value) })}
                                className="border p-1 w-20"
                                disabled={ins.baja}
                            />
                            <button
                                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                                disabled={ins.baja || precioCompra[ins.id] === ins.precioCompra}
                                onClick={() => handleActualizarPrecio(ins.id)}
                            >
                                Actualizar
                            </button>
                        </td>
                        {/* Sumar Stock */}
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
                                className="ml-2 px-2 py-1 bg-green-400 text-white rounded disabled:opacity-50"
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
