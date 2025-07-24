// PARTE 1 de 3: Imports y Lógica Principal

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { crearPromocion, getPromocionById, updatePromocion } from "../../services/PromocionService";
import { ArticuloService } from "../../services/ArticuloService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate, useParams } from "react-router-dom";
import { uploadImage } from "../../services/imagenService";
import type { IArticuloManufacturadoResponseDTO } from "../../models/DTO/IAArticuloManufacturadoResponseDTO";
import type { IArticuloInsumoResponseDTO } from "../../models/DTO/IAArticuloInsumoResponseDTO";
import type { PromocionCreateDTO } from "../../models/DTO/PromocionCreateDTO";
import type { IImagenResponseDTO } from "../../models/DTO/IImagenResponseDTO";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";

const MySwal = withReactContent(Swal);
const tipos = ["HAPPY_HOUR", "PROMOCION_GENERAL"];

interface ArticuloSeleccionado {
    id: number;
    cantidad: number;
}

interface FormularioPromocion {
    denominacion: string;
    descripcionDescuento: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    precioPromocional: number;
    tipoPromocion: string;
    imagen?: FileList;
}

const PromocionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const navigate = useNavigate();

    const { register, handleSubmit, reset, setValue } = useForm<FormularioPromocion>();
    const articuloService = useMemo(() => new ArticuloService(), []);

    const [articulosManufacturadosDisponibles, setArticulosManufacturadosDisponibles] = useState<IArticuloManufacturadoResponseDTO[]>([]);
    const [articulosInsumosDisponibles, setArticulosInsumosDisponibles] = useState<IArticuloInsumoResponseDTO[]>([]);
    const [selectedArticulosManufacturados, setSelectedArticulosManufacturados] = useState<ArticuloSeleccionado[]>([]);
    const [selectedArticulosInsumos, setSelectedArticulosInsumos] = useState<ArticuloSeleccionado[]>([]);
    const [loadingForm, setLoadingForm] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentImageId, setCurrentImageId] = useState<number | null>(null);

    const handleVolver = () => navigate("/admin/promociones");

    useEffect(() => {
        const loadArticulos = async () => {
            try {
                const [manuData, insumoData] = await Promise.all([
                    articuloService.findAllArticulosManufacturadosActivos(),
                    articuloService.findAllArticulosInsumoActivos()
                ]);
                setArticulosManufacturadosDisponibles(manuData);
                setArticulosInsumosDisponibles(insumoData);
            } catch (error) {
                console.error("Error al cargar artículos:", error);
                MySwal.fire("Error", "No se pudieron cargar los artículos.", "error");
            }
        };
        loadArticulos();
    }, [articuloService]);

    useEffect(() => {
        if (isEditing && id) {
            setLoadingForm(true);
            getPromocionById(Number(id))
                .then((promo: IPromocionDTO) => {
                    // --- LÍNEA DE PRUEBA ---
                    console.log("Datos recibidos para editar:", promo);
                    // -----------------------

                    setValue("denominacion", promo.denominacion);
                    setValue("descripcionDescuento", promo.descripcionDescuento);
                    setValue("fechaDesde", promo.fechaDesde);
                    setValue("fechaHasta", promo.fechaHasta);
                    setValue("horaDesde", promo.horaDesde.substring(0, 5));
                    setValue("horaHasta", promo.horaHasta.substring(0, 5));
                    setValue("precioPromocional", promo.precioPromocional);
                    setValue("tipoPromocion", promo.tipoPromocion);

                    if (promo.imagen) {
                        setCurrentImageUrl(promo.imagen.denominacion);
                        setCurrentImageId(promo.imagen.id || null);
                    }

                    
                    if (promo.promocionDetalles) { // Usando la lista correcta para insumos
                        const manufacturados = promo.promocionDetalles.map(d => ({
                            id: d.articuloManufacturado.id,
                            cantidad: d.cantidad
                        }));
                        setSelectedArticulosManufacturados(manufacturados)
                    }

                    if (promo.promocionInsumoDetalles) {
                        const insumos = promo.promocionInsumoDetalles.map(d => ({
                            id: d.articuloInsumo.id,
                            cantidad: d.cantidad
                        }));
                        setSelectedArticulosInsumos(insumos);
                    }
                })
                .catch(error => {
                    console.error("Error al cargar la promoción para edición:", error);
                    MySwal.fire("Error", "No se pudo cargar la promoción para edición.", "error");
                    navigate("/admin/promociones");
                })
                .finally(() => setLoadingForm(false));
        } else { //si es una promocion nueva, terminamos la carga
            setLoadingForm(false);
        }
    }, [id, isEditing, setValue, navigate]);
    // PARTE 2 de 3: Manejadores de Estado y Lógica de Envío

    const handleCheckboxChangeManufacturado = (articuloId: number, checked: boolean) => {
        setSelectedArticulosManufacturados(prev =>
            checked ? [...prev, { id: articuloId, cantidad: 1 }] : prev.filter(a => a.id !== articuloId)
        );
    };
    const handleCantidadChangeManufacturado = (articuloId: number, cantidad: number) => {
        setSelectedArticulosManufacturados(prev =>
            prev.map(a => (a.id === articuloId ? { ...a, cantidad: Number(cantidad) || 1 } : a))
        );
    };

    const handleCheckboxChangeInsumo = (articuloId: number, checked: boolean) => {
        setSelectedArticulosInsumos(prev =>
            checked ? [...prev, { id: articuloId, cantidad: 1 }] : prev.filter(i => i.id !== articuloId)
        );
    };
    const handleCantidadChangeInsumo = (articuloId: number, cantidad: number) => {
        setSelectedArticulosInsumos(prev =>
            prev.map(i => (i.id === articuloId ? { ...i, cantidad: Number(cantidad) || 1 } : i))
        );
    };

    const onSubmit = async (formData: FormularioPromocion) => {
        setIsProcessing(true);
        let finalImageId: number | null = currentImageId;

        if (formData.imagen && formData.imagen.length > 0) {
            try {
                const response = await uploadImage(formData.imagen[0]);
                finalImageId = response.data.id || null;
            } catch (imageError) {
                MySwal.fire("Error", "No se pudo subir la nueva imagen.", "error");
                setIsProcessing(false);
                return;
            }
        }

        const dataToSend: PromocionCreateDTO = {
            denominacion: formData.denominacion,
            descripcionDescuento: formData.descripcionDescuento,
            fechaDesde: formData.fechaDesde,
            fechaHasta: formData.fechaHasta,
            horaDesde: formData.horaDesde + ":00",
            horaHasta: formData.horaHasta + ":00",
            precioPromocional: Number(formData.precioPromocional),
            tipoPromocion: formData.tipoPromocion,
            imagenId: finalImageId,
            promocionDetalles: selectedArticulosManufacturados.map(art => ({
                articuloManufacturado: { id: art.id },
                cantidad: art.cantidad
            })),

            // 👇 Este vuelve a su forma original, que era la correcta.
            promocionInsumoDetalles: selectedArticulosInsumos.map(ins => ({
                articuloInsumoId: ins.id,
                cantidad: ins.cantidad
            })),
            sucursalIds: [],
        };

        try {
            if (isEditing) {
                await updatePromocion(Number(id), dataToSend);
                MySwal.fire("Éxito", "Promoción actualizada correctamente", "success");
            } else {
                await crearPromocion(dataToSend);
                MySwal.fire("Éxito", "Promoción creada correctamente", "success");
            }
            navigate("/admin/promociones");
        } catch (error) {
            console.error("Error al guardar la promoción:", error);
            MySwal.fire("Error", "No se pudo guardar la promoción. Revisa los datos.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loadingForm) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
    }
    // PARTE 3 de 3: El JSX que se renderiza

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="promo-form container mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? "Editar Promoción" : "Crear Nueva Promoción"}</h2>
            <button type="button" onClick={handleVolver} className="mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                Volver a la lista
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="denominacion" className="block text-gray-700 text-sm font-bold mb-2">Denominación</label>
                    <input type="text" id="denominacion" {...register("denominacion", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcionDescuento" className="block text-gray-700 text-sm font-bold mb-2">Descripción del Descuento</label>
                    <input type="text" id="descripcionDescuento" {...register("descripcionDescuento", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="fechaDesde" className="block text-gray-700 text-sm font-bold mb-2">Fecha Desde</label>
                    <input type="date" id="fechaDesde" {...register("fechaDesde", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="form-group">
                    <label htmlFor="fechaHasta" className="block text-gray-700 text-sm font-bold mb-2">Fecha Hasta</label>
                    <input type="date" id="fechaHasta" {...register("fechaHasta", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="horaDesde" className="block text-gray-700 text-sm font-bold mb-2">Hora Desde</label>
                    <input type="time" id="horaDesde" {...register("horaDesde", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="form-group">
                    <label htmlFor="horaHasta" className="block text-gray-700 text-sm font-bold mb-2">Hora Hasta</label>
                    <input type="time" id="horaHasta" {...register("horaHasta", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="precioPromocional" className="block text-gray-700 text-sm font-bold mb-2">Precio Promocional</label>
                    <input type="number" step="0.01" id="precioPromocional" {...register("precioPromocional", { required: true, valueAsNumber: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div className="form-group">
                    <label htmlFor="tipoPromocion" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Promoción</label>
                    <select id="tipoPromocion" {...register("tipoPromocion", { required: true })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                        <option value="">Seleccione</option>
                        {tipos.map((tipo) => (<option key={tipo} value={tipo}>{tipo.replace(/_/g, ' ')}</option>))}
                    </select>
                </div>
            </div>
            <div className="form-group mb-6">
                <label htmlFor="imagen" className="block text-gray-700 text-sm font-bold mb-2">Imagen de la Promoción</label>
                <input type="file" id="imagen" {...register("imagen")} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0" />
                {isEditing && currentImageUrl && (
                    <div className="mt-2">
                        <p className="text-gray-500 text-xs mb-2">Imagen actual:</p>
                        <img src={currentImageUrl} alt="Imagen actual" className="w-32 h-32 object-cover rounded-md border" />
                    </div>
                )}
            </div>

            {/* SECCIÓN ARTÍCULOS MANUFACTURADOS */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Artículos Manufacturados Incluidos</h3>
            {Object.entries(articulosManufacturadosDisponibles.reduce((acc, art) => {
                const categoria = art.categoria?.denominacion || "Sin categoría";
                if (!acc[categoria]) acc[categoria] = [];
                acc[categoria].push(art);
                return acc;
            }, {} as Record<string, IArticuloManufacturadoResponseDTO[]>)).map(([categoria, articulos]) => (
                <details key={categoria} className="mb-4 bg-gray-50 p-3 rounded-md shadow-sm" open>
                    <summary className="font-bold text-md text-gray-800 cursor-pointer">{categoria}</summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        {articulos.map((art) => {
                            const isSelected = selectedArticulosManufacturados.some(s => s.id === art.id!);
                            return (
                                <div key={art.id} className="flex items-center space-x-2 border rounded-md p-3 bg-white">
                                    <input type="checkbox" id={`manu-art-${art.id}`} checked={isSelected} onChange={(e) => handleCheckboxChangeManufacturado(art.id!, e.target.checked)} className="form-checkbox h-5 w-5 text-orange-600" />
                                    <label htmlFor={`manu-art-${art.id}`} className="flex-1 text-sm font-medium text-gray-800 cursor-pointer">{art.denominacion} (${art.precioVenta.toFixed(2)})</label>
                                    {isSelected && <input type="number" min={1} value={selectedArticulosManufacturados.find(s => s.id === art.id!)?.cantidad || 1} onChange={(e) => handleCantidadChangeManufacturado(art.id!, Number(e.target.value))} className="w-16 px-2 py-1 border rounded-md text-center text-sm" />}
                                </div>
                            );
                        })}
                    </div>
                </details>
            ))}

            {/* SECCIÓN ARTÍCULOS INSUMOS */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8">Artículos Insumos Incluidos</h3>
            {Object.entries(articulosInsumosDisponibles.reduce((acc, ins) => {
                const categoria = ins.categoria?.denominacion || "Sin categoría";
                if (!acc[categoria]) acc[categoria] = [];
                acc[categoria].push(ins);
                return acc;
            }, {} as Record<string, IArticuloInsumoResponseDTO[]>)).map(([categoria, insumos]) => (
                <details key={categoria} className="mb-4 bg-gray-50 p-3 rounded-md shadow-sm" open>
                    <summary className="font-bold text-md text-gray-800 cursor-pointer">{categoria}</summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        {insumos.map((ins) => {
                            const isSelected = selectedArticulosInsumos.some(s => s.id === ins.id!);
                            return (
                                <div key={ins.id} className="flex items-center space-x-2 border rounded-md p-3 bg-white">
                                    <input type="checkbox" id={`insumo-art-${ins.id}`} checked={isSelected} onChange={(e) => handleCheckboxChangeInsumo(ins.id!, e.target.checked)} className="form-checkbox h-5 w-5 text-orange-600" />
                                    <label htmlFor={`insumo-art-${ins.id}`} className="flex-1 text-sm font-medium text-gray-800 cursor-pointer">{ins.denominacion} (${ins.precioVenta.toFixed(2)})</label>
                                    {isSelected && <input type="number" min={1} value={selectedArticulosInsumos.find(s => s.id === ins.id!)?.cantidad || 1} onChange={(e) => handleCantidadChangeInsumo(ins.id!, Number(e.target.value))} className="w-16 px-2 py-1 border rounded-md text-center text-sm" />}
                                </div>
                            );
                        })}
                    </div>
                </details>
            ))}

            <button type="submit" disabled={isProcessing} className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? "Guardando..." : (isEditing ? "Actualizar Promoción" : "Guardar Promoción")}
            </button>
        </form>
    );
};

export default PromocionForm;