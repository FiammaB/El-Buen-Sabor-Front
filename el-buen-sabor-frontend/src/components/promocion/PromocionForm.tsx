// src/components/PromocionForm/PromocionForm.tsx

import React, { useEffect, useState, useMemo } from "react"; // <-- Añadir useMemo
import { useForm } from "react-hook-form";
import { crearPromocion, getPromocionById, updatePromocion } from "../../services/PromocionService";
// Ya no necesitas ArticuloManufacturadoService si ArticuloService ya tiene el método
// import { getArticulosManufacturados } from "../../services/ArticuloManufacturadoService";
import { ArticuloService } from "../../services/ArticuloService"; // <-- ¡NUEVO! Importar la clase ArticuloService

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { useNavigate, useParams } from "react-router-dom";
import { uploadImage } from "../../services/imagenService";
import type { IArticuloManufacturadoResponseDTO } from "../../models/DTO/IAArticuloManufacturadoResponseDTO";
import type { IArticuloInsumoResponseDTO } from "../../models/DTO/IAArticuloInsumoResponseDTO"; // Importar DTO de insumos
import type { PromocionCreateDTO } from "../../models/DTO/PromocionCreateDTO";

import type { IImagenResponseDTO } from "../../models/DTO/IImagenResponseDTO";

const MySwal = withReactContent(Swal);
const tipos = ["HAPPY_HOUR", "PROMOCION_GENERAL"];

interface ArticuloSeleccionado {
    id: number;
    // La cantidad no se envía al backend para promociones, solo para mostrar en frontend si fuera necesario para manufacturados
    cantidad?: number; // Hacemos opcional para insumos
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
    articuloManufacturadoIds: number[];
    articuloInsumoIds: number[]; // <-- ¡NUEVO! IDs de artículos insumos
}

const PromocionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const navigate = useNavigate();

    const { register, handleSubmit, reset, setValue } = useForm<FormularioPromocion>();

    // Instanciar ArticuloService una sola vez
    const articuloService = useMemo(() => new ArticuloService(), []); // <-- ¡NUEVO! Instanciar el servicio con useMemo

    const [articulosManufacturadosDisponibles, setArticulosManufacturadosDisponibles] = useState<IArticuloManufacturadoResponseDTO[]>([]);
    const [articulosInsumosDisponibles, setArticulosInsumosDisponibles] = useState<IArticuloInsumoResponseDTO[]>([]); // <-- ¡NUEVO ESTADO!
    const [selectedArticulosManufacturados, setSelectedArticulosManufacturados] = useState<ArticuloSeleccionado[]>([]);
    const [selectedArticulosInsumos, setSelectedArticulosInsumos] = useState<ArticuloSeleccionado[]>([]); // <-- ¡NUEVO ESTADO!
    const [loadingForm, setLoadingForm] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [currentImageId, setCurrentImageId] = useState<number | null>(null);

    const handleVolver = () => {
        navigate("/admin/promociones");
    };

    // Cargar artículos manufacturados e insumos disponibles al montar el componente
    useEffect(() => {
        const loadArticulos = async () => {
            try {
                // Cargar Artículos Manufacturados
                const manuData = await articuloService.findAllArticulosManufacturadosActivos(); // Usar el servicio instanciado
                setArticulosManufacturadosDisponibles(manuData.filter(art => art.id !== undefined && art.id !== null));

                // Cargar Artículos Insumos (solo los que NO son para elaborar y activos)
                const insumoData = await articuloService.findAllArticulosInsumoActivos(); // Usar el servicio instanciado y su método filtrado
                setArticulosInsumosDisponibles(insumoData.filter(ins => ins.id !== undefined && ins.id !== null)); // Ya filtrados por el service

            } catch (error) {
                console.error("Error al cargar artículos:", error);
                MySwal.fire("Error", "No se pudieron cargar los artículos para la promoción.", "error");
            }
        };
        loadArticulos();
    }, [articuloService]); // Dependencia del servicio

    // Cargar datos de la promoción para edición
    useEffect(() => {
        if (isEditing) {
            setLoadingForm(true);
            getPromocionById(Number(id))
                .then(promo => {
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
                    } else {
                        setCurrentImageUrl(null);
                        setCurrentImageId(null);
                    }

                    // Precargar artículos manufacturados seleccionados
                    if (promo.articulosManufacturados) {
                        setSelectedArticulosManufacturados(
                            promo.articulosManufacturados.map(art => ({
                                id: art.id!,
                                cantidad: 1, // Mantener cantidad si el formulario la usa para UI, aunque no se envíe al backend
                            }))
                        );
                    } else {
                        setSelectedArticulosManufacturados([]);
                    }

                    // <-- ¡NUEVO! Precargar artículos insumos seleccionados
                    if (promo.articulosInsumo) {
                        setSelectedArticulosInsumos(
                            promo.articulosInsumo.map(ins => ({
                                id: ins.id!,
                            }))
                        );
                    } else {
                        setSelectedArticulosInsumos([]);
                    }
                })
                .catch(error => {
                    console.error("Error al cargar la promoción para edición:", error);
                    MySwal.fire("Error", "No se pudo cargar la promoción para editar.", "error");
                    navigate("/admin/promociones");
                })
                .finally(() => {
                    setLoadingForm(false);
                });
        } else {
            setLoadingForm(false);
            setCurrentImageUrl(null);
            setCurrentImageId(null);
        }
    }, [id, isEditing, setValue, navigate]);

    // Manejador para checkboxes de Artículos Manufacturados
    const handleCheckboxChangeManufacturado = (articuloId: number, checked: boolean) => {
        setSelectedArticulosManufacturados(prev => {
            if (checked) {
                // Aquí podrías añadir una cantidad por defecto si la usas en la UI
                return [...prev, { id: articuloId, cantidad: 1 }];
            } else {
                return prev.filter(art => art.id !== articuloId);
            }
        });
    };

    // Manejador para cantidades de Artículos Manufacturados (si aplica)
    const handleCantidadChangeManufacturado = (articuloId: number, cantidad: number) => {
        setSelectedArticulosManufacturados(prev =>
            prev.map(art =>
                art.id === articuloId ? { ...art, cantidad: Number(cantidad) } : art
            )
        );
    };

    // <-- ¡NUEVO! Manejador para checkboxes de Artículos Insumos
    const handleCheckboxChangeInsumo = (articuloId: number, checked: boolean) => {
        setSelectedArticulosInsumos(prev => {
            if (checked) {
                return [...prev, { id: articuloId }];
            } else {
                return prev.filter(ins => ins.id !== articuloId);
            }
        });
    };

    const onSubmit = async (formData: FormularioPromocion) => {
        setIsProcessing(true);
        let finalImageId: number | null = null;

        // 1. Subir la imagen si hay una nueva seleccionada en el input de archivo
        if (formData.imagen && formData.imagen.length > 0) {
            try {
                const response = await uploadImage(formData.imagen[0]);
                const uploadedImage: IImagenResponseDTO = response.data;
                finalImageId = uploadedImage.id || null;
                MySwal.fire("Imagen subida", "La imagen se subió correctamente.", "success");
            } catch (imageError) {
                console.error("Error al subir la imagen:", imageError);
                MySwal.fire("Error", "No se pudo subir la imagen. Inténtalo de nuevo.", "error");
                setIsProcessing(false);
                return;
            }
        } else if (isEditing && currentImageId !== null) {
            finalImageId = currentImageId;
            MySwal.fire("Advertencia", "No se seleccionó nueva imagen. Se mantendrá la existente.", "info");
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
            articuloManufacturadoIds: selectedArticulosManufacturados.map(art => art.id),
            articuloInsumoIds: selectedArticulosInsumos.map(ins => ins.id), // <-- ¡NUEVO! IDs de artículos insumos
            sucursalIds: [], // Asegúrate de manejar sucursales si son relevantes en el frontend
        };

        try {
            if (isEditing) {
                await updatePromocion(Number(id), dataToSend);
                MySwal.fire("Éxito", "Promoción actualizada correctamente", "success");
            } else {
                await crearPromocion(dataToSend);
                MySwal.fire("Éxito", "Promoción creada correctamente", "success");
            }
            reset();
            setSelectedArticulosManufacturados([]);
            setSelectedArticulosInsumos([]); // Limpiar insumos seleccionados
            setCurrentImageUrl(null);
            setCurrentImageId(null);
            navigate("/admin/promociones");
        } catch (error) {
            console.error("Error al guardar la promoción:", error);
            MySwal.fire("Error", "No se pudo guardar la promoción. Revisa los datos.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loadingForm) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="promo-form container mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? "Editar Promoción" : "Crear Nueva Promoción"}</h2>
            <button type="button" onClick={handleVolver} className="mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                Volver a la lista
            </button>

            {/* Resto de campos de texto e imagen (Denominación, Descripción, Fechas, Horas, Precio, Tipo) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="denominacion" className="block text-gray-700 text-sm font-bold mb-2">Denominación</label>
                    <input
                        type="text"
                        id="denominacion"
                        {...register("denominacion", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="descripcionDescuento" className="block text-gray-700 text-sm font-bold mb-2">Descripción del Descuento</label>
                    <input
                        type="text"
                        id="descripcionDescuento"
                        {...register("descripcionDescuento", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="fechaDesde" className="block text-gray-700 text-sm font-bold mb-2">Fecha Desde</label>
                    <input
                        type="date"
                        id="fechaDesde"
                        {...register("fechaDesde", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fechaHasta" className="block text-gray-700 text-sm font-bold mb-2">Fecha Hasta</label>
                    <input
                        type="date"
                        id="fechaHasta"
                        {...register("fechaHasta", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="horaDesde" className="block text-gray-700 text-sm font-bold mb-2">Hora Desde</label>
                    <input
                        type="time"
                        id="horaDesde"
                        {...register("horaDesde", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="horaHasta" className="block text-gray-700 text-sm font-bold mb-2">Hora Hasta</label>
                    <input
                        type="time"
                        id="horaHasta"
                        {...register("horaHasta", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label htmlFor="precioPromocional" className="block text-gray-700 text-sm font-bold mb-2">Precio Promocional</label>
                    <input
                        type="number"
                        step="0.01"
                        id="precioPromocional"
                        {...register("precioPromocional", { required: true, valueAsNumber: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tipoPromocion" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Promoción</label>
                    <select
                        id="tipoPromocion"
                        {...register("tipoPromocion", { required: true })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Seleccione</option>
                        {tipos.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group mb-6">
                <label htmlFor="imagen" className="block text-gray-700 text-sm font-bold mb-2">Imagen de la Promoción</label>
                <input
                    type="file"
                    id="imagen"
                    {...register("imagen")}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {isEditing && currentImageUrl && (
                    <div className="mt-2">
                        <p className="text-gray-500 text-xs mb-2">Imagen actual:</p>
                        <img src={currentImageUrl} alt="Imagen actual de la promoción" className="w-32 h-32 object-cover rounded-md border border-gray-200" />
                        <p className="text-gray-500 text-xs mt-1">
                            Subir una nueva imagen reemplazará la actual.
                        </p>
                    </div>
                )}
                {isEditing && !currentImageUrl && (
                    <p className="text-gray-500 text-xs mt-1">
                        Esta promoción no tiene imagen. Sube una nueva.
                    </p>
                )}
            </div>

            {/* SECCIÓN ARTÍCULOS MANUFACTURADOS */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Artículos Manufacturados Incluidos</h3>
            {articulosManufacturadosDisponibles.length === 0 && !loadingForm ? (
                <p className="text-gray-600 mb-4">Cargando artículos manufacturados o no hay artículos disponibles.</p>
            ) : (
                Object.entries(
                    articulosManufacturadosDisponibles.reduce((acc, art) => {
                        const categoria = art.categoria?.denominacion || "Sin categoría";
                        if (!acc[categoria]) acc[categoria] = [];
                        acc[categoria].push(art);
                        return acc;
                    }, {} as Record<string, IArticuloManufacturadoResponseDTO[]>)
                ).map(([categoria, articulos]) => (
                    <details key={categoria} className="mb-4 bg-gray-50 p-3 rounded-md shadow-sm">
                        <summary className="font-bold text-md text-gray-800 cursor-pointer">{categoria}</summary>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                            {articulos.map((art) => {
                                const isSelected = selectedArticulosManufacturados.some(selected => selected.id === art.id!);
                                return (
                                    <div key={art.id} className="flex items-center space-x-2 border rounded-md p-3 bg-white">
                                        <input
                                            type="checkbox"
                                            id={`manu-art-${art.id}`}
                                            checked={isSelected}
                                            onChange={(e) => handleCheckboxChangeManufacturado(art.id!, e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-orange-600"
                                        />
                                        <label htmlFor={`manu-art-${art.id}`} className="flex-1 text-sm font-medium text-gray-800 cursor-pointer">
                                            {art.denominacion} (${art.precioVenta.toFixed(2)})
                                        </label>
                                        {isSelected && (
                                            <input
                                                type="number"
                                                min={1}
                                                value={selectedArticulosManufacturados.find(s => s.id === art.id!)?.cantidad || 1}
                                                onChange={(e) => handleCantidadChangeManufacturado(art.id!, Number(e.target.value))}
                                                className="w-16 px-2 py-1 border rounded-md text-center text-sm"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </details>
                ))
            )}

            {/* <-- ¡NUEVO! SECCIÓN ARTÍCULOS INSUMOS */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8">Artículos Insumos Incluidos (No para Elaborar)</h3>
            {articulosInsumosDisponibles.length === 0 && !loadingForm ? (
                <p className="text-gray-600 mb-4">Cargando artículos insumos o no hay insumos disponibles (solo se muestran los que NO son para elaborar).</p>
            ) : (
                Object.entries(
                    articulosInsumosDisponibles.reduce((acc, ins) => {
                        // Usar la categoría del insumo para agrupar
                        const categoria = ins.categoria?.denominacion || "Sin categoría";
                        if (!acc[categoria]) acc[categoria] = [];
                        acc[categoria].push(ins);
                        return acc;
                    }, {} as Record<string, IArticuloInsumoResponseDTO[]>)
                ).map(([categoria, insumos]) => (
                    <details key={categoria} className="mb-4 bg-gray-50 p-3 rounded-md shadow-sm">
                        <summary className="font-bold text-md text-gray-800 cursor-pointer">{categoria}</summary>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                            {insumos.map((ins) => {
                                const isSelected = selectedArticulosInsumos.some(selected => selected.id === ins.id!);
                                return (
                                    <div key={ins.id} className="flex items-center space-x-2 border rounded-md p-3 bg-white">
                                        <input
                                            type="checkbox"
                                            id={`insumo-art-${ins.id}`}
                                            checked={isSelected}
                                            onChange={(e) => handleCheckboxChangeInsumo(ins.id!, e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-orange-600"
                                        />
                                        <label htmlFor={`insumo-art-${ins.id}`} className="flex-1 text-sm font-medium text-gray-800 cursor-pointer">
                                            {ins.denominacion} (${ins.precioCompra.toFixed(2)}) {/* Muestra precioCompra */}
                                        </label>
                                        {/* No hay input de cantidad para insumos aquí, ya que el backend no lo usa para promociones */}
                                    </div>
                                );
                            })}
                        </div>
                    </details>
                ))
            )}

            <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
            >
                {isProcessing ? "Guardando..." : (isEditing ? "Actualizar Promoción" : "Guardar Promoción")}
            </button>
        </form>
    );
};

export default PromocionForm;