import React, { useEffect, useState } from 'react';
import { ArticuloService } from '../../services/ArticuloService';
import { ArticuloInsumo } from '../../models/Articulos/ArticuloInsumo';
import { Plus } from 'lucide-react';
// Importa el modal/form de alta rápida:
import Ingredientes from '../../admin/pages/ingredientes';
import IngredienteForm from "./IngredieteForm.tsx";

const articuloService = new ArticuloService();

const CompraIngredientesPage: React.FC = () => {
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const [selectedInsumoId, setSelectedInsumoId] = useState<number | null>(null);
    const [cantidad, setCantidad] = useState<number>(0);
    const [nuevoPrecio, setNuevoPrecio] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [showAltaIngrediente, setShowAltaIngrediente] = useState(false);

    // Recarga la lista de insumos
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

    useEffect(() => {
        if (selectedInsumoId) {
            const ins = insumos.find(i => i.id === selectedInsumoId);
            setNuevoPrecio(ins?.precioCompra ?? undefined);
        }
    }, [selectedInsumoId, insumos]);

    const handleSumarStock = async () => {
        if (!selectedInsumoId || cantidad <= 0) return;
        try {
            await articuloService.sumarStock(selectedInsumoId, cantidad);
            setCantidad(0);
            fetchInsumos();
        } catch {
            setError('Error al sumar stock.');
        }
    };

    const handleRestarStock = async () => {
        if (!selectedInsumoId || cantidad <= 0) return;
        try {
            await articuloService.restarStock(selectedInsumoId, cantidad);
            setCantidad(0);
            fetchInsumos();
        } catch {
            setError('Error al restar stock.');
        }
    };

    const handleActualizarPrecio = async () => {
        if (!selectedInsumoId || nuevoPrecio === undefined) return;
        try {
            await articuloService.actualizarPrecioCompra(selectedInsumoId, nuevoPrecio);
            fetchInsumos();
        } catch {
            setError('Error al actualizar el precio.');
        }
    };



    // Solo ingredientes activos en el combo
    const insumosActivos = insumos.filter(i => !i.baja);
    const selectedInsumo = insumos.find(i => i.id === selectedInsumoId);

    // Modal de alta rápida
    const handleAltaIngrediente = () => setShowAltaIngrediente(true);
    const onIngredienteCreado = () => {
        setShowAltaIngrediente(false);
        fetchInsumos();
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Registrar Compra de Ingredientes</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="bg-white p-6 rounded shadow mb-8 flex flex-col gap-4">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Ingrediente</label>
                        <div className="flex items-center gap-2">
                            <select
                                className="border rounded p-2 w-full"
                                value={selectedInsumoId ?? ""}
                                onChange={e => setSelectedInsumoId(Number(e.target.value))}
                            >
                                <option value="">Seleccione un ingrediente</option>
                                {insumosActivos.map(ins => (
                                    <option key={ins.id} value={ins.id}>
                                        {ins.denominacion}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAltaIngrediente}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center gap-1"
                                title="Agregar nuevo ingrediente"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Unidad</label>
                        <div className="px-2 py-1 border rounded bg-gray-50 min-w-[80px]">
                            {selectedInsumo?.unidadMedida?.denominacion ?? "-"}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    {/* Cantidad y botones de stock */}
                    <div className="flex flex-col">
                        <label className="block font-medium mb-1">Cantidad</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={1}
                                className="border rounded p-2 w-24"
                                value={cantidad}
                                onChange={e => setCantidad(Number(e.target.value))}
                                disabled={!selectedInsumoId}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                disabled={!selectedInsumoId || cantidad <= 0}
                                onClick={handleSumarStock}
                                style={{ minWidth: 100 }}
                            >
                                Sumar stock
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                disabled={!selectedInsumoId || cantidad <= 0}
                                onClick={handleRestarStock}
                                style={{ minWidth: 100 }}
                            >
                                Restar stock
                            </button>
                        </div>
                    </div>

                    {/* Precio y actualizar */}
                    <div className="flex flex-col">
                        <label className="block font-medium mb-1">Precio de compra</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="border rounded p-2 w-28"
                                value={nuevoPrecio ?? ""}
                                onChange={e => setNuevoPrecio(Number(e.target.value))}
                                disabled={!selectedInsumoId}
                            />
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                disabled={!selectedInsumoId || nuevoPrecio === undefined}
                                onClick={handleActualizarPrecio}
                                style={{ minWidth: 120 }}
                            >
                                Actualizar precio
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal alta rápida */}
            {showAltaIngrediente && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <IngredienteForm
                            onSave={onIngredienteCreado}
                            onCancel={() => setShowAltaIngrediente(false)}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de referencia */}
            <h2 className="text-xl font-semibold mb-2">Lista de ingredientes</h2>
            <table className="w-full border text-sm">
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Stock Actual</th>
                    <th>Precio Compra</th>
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
                            {ins.baja ? (
                                <span className="text-red-500">No</span>
                            ) : (
                                <span className="text-green-600">Sí</span>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompraIngredientesPage;
