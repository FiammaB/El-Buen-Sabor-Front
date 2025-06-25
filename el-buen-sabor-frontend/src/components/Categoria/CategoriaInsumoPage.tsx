import React, { useEffect, useState } from "react";
import type { ICategoriaResponseDTO } from "../../models/DTO/ICategoriaResponseDTO";
import { CategoriaForm } from "./CategoriaForm.tsx";
import { Pencil, Trash2, Check } from "lucide-react";
import {CategoriaService} from "../../services/CategoriaService..ts";


export default function CategoriaInsumoPage() {
    const [categorias, setCategorias] = useState<ICategoriaResponseDTO[]>([]);
    const [idInsumos, setIdInsumos] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCategoria, setEditCategoria] = useState<ICategoriaResponseDTO | null>(null);
    const categoriaService = new CategoriaService();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchIdInsumos = async () => {
            setLoading(true);
            try {
                const res = await categoriaService.getAll();
                const insumosCat = res.find((cat) => (cat.denominacion ?? "").toLowerCase() === "insumos");
                setIdInsumos(insumosCat?.id || null);
                if (insumosCat?.id) {
                    setCategorias(
                        res
                            .filter((c) => c.categoriaPadre && c.categoriaPadre.id === insumosCat.id)
                            .map((c) => ({
                                ...c,
                                categoriaPadreId: c.categoriaPadre?.id,
                            }))
                    );
                } else {
                    setCategorias([]);
                }
            } catch (e) {
                alert("Error cargando categorías");
            } finally {
                setLoading(false);
            }
        };
        fetchIdInsumos();
        // eslint-disable-next-line
    }, []);

    // Refrescar solo las hijas de Insumos
    const fetchCategorias = async () => {
        if (!idInsumos) return;
        setLoading(true);
        try {
            const res = await categoriaService.getAll();console.log("Categorías crudas:", res);
            setCategorias(
                res
                    .filter((c) => c.categoriaPadre && c.categoriaPadre.id === idInsumos)
                    .map((c) => ({
                        ...c,
                        categoriaPadreId: c.categoriaPadre?.id,
                    }))
            );
        } catch {
            alert("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    const categoriasFiltradas = categorias.filter(cat =>
        cat.denominacion?.toLowerCase().includes(search.toLowerCase())
    );

    const handleBaja = async (id: number, baja: boolean) => {
        try {
            await categoriaService.toggleBaja(id, baja);
            await fetchCategorias(); // refresca el listado
        } catch {
            alert("Error al cambiar estado de la categoría");
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-800">Categorías de Ingredientes</h2>
                <button
                    onClick={() => { setEditCategoria(null); setShowForm(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    id="createCategory"
                    disabled={!idInsumos}
                >
                    + Nueva Categoría
                </button>
            </div>
            <div className="flex items-center mb-4 gap-2">
                <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    placeholder="Buscar categoría por nombre..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {showForm && idInsumos && (
                <CategoriaForm
                    idCategoriaPadre={idInsumos}
                    reloadCategorias={fetchCategorias}
                    onClose={() => setShowForm(false)}
                    editCategoria={editCategoria}
                />
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 shadow-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-center">ID</th>
                        <th className="p-2 text-center">Nombre</th>
                        <th className="p-2 text-center">Estado</th>
                        <th className="p-2 text-center">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4">Cargando...</td>
                        </tr>
                    ) : categoriasFiltradas.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center p-4">
                                Sin categorías que coincidan.
                            </td>
                        </tr>
                    ) : (
                        categoriasFiltradas.map(cat => (
                            <tr key={cat.id} className={`border-t ${cat.baja ? "opacity-60" : ""}`}>
                                <td className="p-2 text-center">{cat.id}</td>
                                <td className="p-2 text-center">{cat.denominacion}</td>
                                <td className="p-2 text-center">
                                    {cat.baja ? (
                                        <span className="text-red-600 font-semibold">Inactiva</span>
                                    ) : (
                                        <span className="text-green-700 font-semibold">Activa</span>
                                    )}
                                </td>
                                <td className="p-2 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={() => { setEditCategoria(cat); setShowForm(true); }}
                                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition duration-200"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {!cat.baja ? (
                                            <button
                                                onClick={() => handleBaja(cat.id!, true)}
                                                className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition duration-200"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBaja(cat.id!, false)}
                                                className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition duration-200"
                                                title="Reactivar"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
