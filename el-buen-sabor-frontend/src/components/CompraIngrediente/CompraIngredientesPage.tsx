import React, { useEffect, useState } from 'react';
import { ArticuloService } from '../../services/ArticuloService';
import { ArticuloInsumo } from '../../models/Articulos/ArticuloInsumo';
import { Plus } from 'lucide-react';
import IngredienteForm from "./IngredieteForm.tsx";
import { useLocation } from "react-router-dom";

const articuloService = new ArticuloService();

const CompraIngredientesPage: React.FC = () => {
    const [insumos, setInsumos] = useState<ArticuloInsumo[]>([]);
    const location = useLocation();
    const [selectedInsumoId, setSelectedInsumoId] = useState<number | null>(null);
    useEffect(() => {
        const state = location.state as { insumoId?: number } | null;
        if (state?.insumoId) {
            setSelectedInsumoId(state.insumoId);
        }
    }, [location.state]);
    const [cantidad, setCantidad] = useState<number>(0);
    const [nuevoPrecio, setNuevoPrecio] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [showAltaIngrediente, setShowAltaIngrediente] = useState(false);


    // Recarga la lista de insumos
    const fetchInsumos = async () => {
        try {
            // Fetch all insumos, regardless of their 'baja' status
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
        if (!selectedInsumoId || cantidad <= 0) {
            setError('Debe seleccionar un ingrediente y la cantidad debe ser mayor a 0 para sumar stock.');
            return;
        }
        setError(null); // Clear previous errors
        try {
            await articuloService.sumarStock(selectedInsumoId, cantidad);
            setCantidad(0);
            fetchInsumos();
        } catch (err) {
            setError('Error al sumar stock. Asegúrese de que el ingrediente exista y la cantidad sea válida.');
            console.error("Error sumar stock:", err);
        }
    };

    const handleRestarStock = async () => {
        if (!selectedInsumoId || cantidad <= 0) {
            setError('Debe seleccionar un ingrediente y la cantidad debe ser mayor a 0 para restar stock.');
            return;
        }
        setError(null); // Clear previous errors
        try {
            await articuloService.restarStock(selectedInsumoId, cantidad);
            setCantidad(0);
            fetchInsumos();
        } catch (err) {
            setError('Error al restar stock. Asegúrese de que el ingrediente exista y tenga suficiente stock.');
            console.error("Error restar stock:", err);
        }
    };

    const handleActualizarPrecio = async () => {
        if (!selectedInsumoId || nuevoPrecio === undefined || nuevoPrecio < 0) {
            setError('Debe seleccionar un ingrediente y un precio válido (mayor o igual a 0) para actualizar.');
            return;
        }
        setError(null); // Clear previous errors
        try {
            await articuloService.actualizarPrecioCompra(selectedInsumoId, nuevoPrecio);
            fetchInsumos();
        } catch (err) {
            setError('Error al actualizar el precio. Asegúrese de que el ingrediente exista y el precio sea válido.');
            console.error("Error actualizar precio:", err);
        }
    };

    const insumosDisponiblesEnDropdown = insumos.slice().sort((a, b) => a.denominacion.localeCompare(b.denominacion)); // All insumos, sorted

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
                                {insumosDisponiblesEnDropdown.map(ins => (
                                    <option key={ins.id} value={ins.id}>
                                        {ins.denominacion} {ins.baja ? "(Inactivo)" : ""}
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
                                // Removed disabling based on selectedInsumo.baja
                                disabled={!selectedInsumoId}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                // Removed disabling based on selectedInsumo.baja
                                disabled={!selectedInsumoId || cantidad <= 0}
                                onClick={handleSumarStock}
                                style={{ minWidth: 100 }}
                            >
                                Sumar stock
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                // Removed disabling based on selectedInsumo.baja
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
                                // Removed disabling based on selectedInsumo.baja
                                disabled={!selectedInsumoId}
                            />
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                // Removed disabling based on selectedInsumo.baja
                                disabled={!selectedInsumoId || nuevoPrecio === undefined || nuevoPrecio < 0}
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
                            insumosExistentes={insumos}
                            onSave={onIngredienteCreado}
                            onCancel={() => setShowAltaIngrediente(false)}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de referencia */}
            <h2 className="text-xl font-semibold mb-2">Lista de ingredientes</h2>
            <div className="mb-6">
                <div
                    className={`min-h-[64px] rounded-xl border-2 transition-all duration-200 shadow-sm bg-white
    ${selectedInsumo ? "border-green-400 shadow-md" : "border-dashed border-gray-300"}
    flex items-center gap-8 px-8 py-4`}
                    style={{ opacity: selectedInsumo ? 1 : 0.8 }}
                >
                    {selectedInsumo ? (
                        <>
                            <div className="flex-1">
                                <div className="text-lg font-bold text-green-700">{selectedInsumo.denominacion}</div>
                                <div className="text-sm text-gray-500">
                                    Unidad: {selectedInsumo.unidadMedida?.denominacion ?? "-"}
                                    {" | "} Stock actual: {selectedInsumo.stockActual}
                                    {" | "} Precio compra: ${selectedInsumo.precioCompra?.toFixed(2)}
                                </div>
                            </div>
                            <div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${selectedInsumo.baja ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
            {selectedInsumo.baja ? "Inactivo" : "Activo"}
          </span>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400">Seleccione un ingrediente para editar sus datos</span>
                    )}
                </div>
            </div>
            <table className="w-full border text-sm border-separate border-spacing-y-2">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Unidad</th>
                    <th className="p-3">Stock Actual</th>
                    <th className="p-3">Precio Compra</th>
                    <th className="p-3">Activo</th>
                </tr>
                </thead>
                <tbody>
                {insumos.map((ins, idx) => {
                    // Alternar fondo blanco y gris claro
                    const bg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    return (
                        <tr
                            key={ins.id}
                            className={`${bg} ${ins.baja ? 'opacity-60' : ''} rounded-lg transition`}
                        >
                            <td className="p-3">{ins.denominacion}</td>
                            <td className="p-3">{ins.unidadMedida?.denominacion || '-'}</td>
                            <td className="p-3">{ins.stockActual}</td>
                            <td className="p-3">${ins.precioCompra.toFixed(2)}</td>
                            <td className="p-3">
                                {ins.baja ? (
                                    <span className="text-red-500">No</span>
                                ) : (
                                    <span className="text-green-600">Sí</span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default CompraIngredientesPage;