import React, { useState, useEffect } from "react";
import { CategoriaService } from "../../services/CategoriaService.";
import { UnidadMedidaService } from "../../services/UnidadMedidaService";
import { ArticuloService } from "../../services/ArticuloService";
import { uploadImage } from "../../services/imagenService.ts";
import { Categoria } from "../../models/Categoria/Categoria";
import { UnidadMedida } from "../../models/Categoria/UnidadMedida";
import { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";

interface IngredienteFormProps {
    onSave: () => void;
    onCancel: () => void;
}

export default function IngredienteForm({ onSave, onCancel }: IngredienteFormProps) {
    // Estado individual por campo
    const [denominacion, setDenominacion] = useState("");
    const [precioCompra, setPrecioCompra] = useState<number | "">("");
    const [stockActual, setStockActual] = useState<number | "">("");
    const [stockMinimo, setStockMinimo] = useState<number | "">("");
    const [categoriaId, setCategoriaId] = useState<number | "">("");
    const [unidadMedidaId, setUnidadMedidaId] = useState<number | "">("");
    const [imagenId, setImagenId] = useState<number | undefined>(undefined);
    const [formReady, setFormReady] = useState(false);

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Carga categorías y unidades
    useEffect(() => {
        new CategoriaService().getAll().then(setCategorias);
        new UnidadMedidaService().getAll().then(setUnidades);
    }, []);

    useEffect(() => {
        if (categorias.length && unidades.length) {
            setCategoriaId(categorias[0].id ?? "");
            setUnidadMedidaId(unidades[0].id ?? "");
            setFormReady(true);
        }
    }, [categorias, unidades]);

    // Por defecto, selecciona la primera categoría/unidad si existen y no hay selección
    useEffect(() => {
        if (categorias.length > 0 && !categoriaId) setCategoriaId(categorias[0].id ?? "");
    }, [categorias]);
    useEffect(() => {
        if (unidades.length > 0 && !unidadMedidaId) setUnidadMedidaId(unidades[0].id ?? "");
    }, [unidades]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const res = await uploadImage(file);
            setImagenId(res.data.id);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validación básica
        if (
            !denominacion ||
            precioCompra === "" ||
            stockActual === "" ||
            stockMinimo === "" ||
            !categoriaId ||
            !unidadMedidaId
        ) {
            alert("Completá todos los campos.");
            return;
        }

        // Armar el objeto tal como espera tu backend
        const payload = {
            denominacion,
            precioCompra: Number(precioCompra),
            stockActual: Number(stockActual),
            stockMinimo: Number(stockMinimo),
            precioVenta: 0,
            esParaElaborar: false,
            categoriaId: Number(categoriaId),
            unidadMedidaId: Number(unidadMedidaId),
            imagenId: imagenId ?? null,
        };

        try {
            await new ArticuloService().createArticuloInsumo(payload as ArticuloInsumo);
            // Reset form después de crear
            setDenominacion("");
            setPrecioCompra("");
            setStockActual("");
            setStockMinimo("");
            setCategoriaId(categorias[0]?.id ?? "");
            setUnidadMedidaId(unidades[0]?.id ?? "");
            setImagenId(undefined);
            onSave();
        } catch {
            alert("Error al crear ingrediente");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                value={denominacion}
                onChange={e => setDenominacion(e.target.value)}
                placeholder="Denominación"
                required
                className="border rounded p-2 w-full"
            />
            <input
                type="number"
                value={precioCompra}
                onChange={e => setPrecioCompra(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Precio de compra"
                required
                className="border rounded p-2 w-full"
                min={0}
                step="0.01"
            />
            <input
                type="number"
                value={stockActual}
                onChange={e => setStockActual(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Stock actual"
                required
                className="border rounded p-2 w-full"
                min={0}
            />
            <input
                type="number"
                value={stockMinimo}
                onChange={e => setStockMinimo(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Stock mínimo"
                required
                className="border rounded p-2 w-full"
                min={0}
            />
            <select
                value={categoriaId}
                onChange={e => setCategoriaId(Number(e.target.value))}
                required
                className="border rounded p-2 w-full"
            >
                {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.denominacion}</option>
                ))}
            </select>
            <select
                value={unidadMedidaId}
                onChange={e => setUnidadMedidaId(Number(e.target.value))}
                required
                className="border rounded p-2 w-full"
            >
                {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.denominacion}</option>
                ))}
            </select>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full"
            />
            <div className="flex justify-end gap-2">
                <button type="button" className="text-gray-500" onClick={onCancel}>Cancelar</button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={isUploading || !formReady}
                >
                    Crear ingrediente
                </button>
            </div>
        </form>
    );
}
