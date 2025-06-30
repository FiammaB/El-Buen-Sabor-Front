// src/pages/PromocionList/PromocionList.tsx

import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importamos Link y useNavigate
import { getPromociones, activatePromocion, deactivatePromocion } from "../../services/PromocionService";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import { Edit, Power, Eye, PlusCircle } from 'lucide-react'; // Iconos de Lucide
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const PromocionList: React.FC = () => {
    const [promociones, setPromociones] = useState<IPromocionDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState<boolean>(false); // Nuevo estado para mostrar inactivas
    const navigate = useNavigate();

    // Función para cargar las promociones (reutilizable)
    const fetchPromociones = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPromociones();
            setPromociones(data);
        } catch (err) {
            setError("Error al cargar las promociones.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromociones();
    }, [fetchPromociones]);

    /* const handleDelete = async (id: number) => {//'handleDelete' is assigned a value but never used.eslint@typescript-eslint/no-unused-vars
         MySwal.fire({
             title: "¿Estás seguro?",
             text: "¡No podrás revertir esto! La promoción se dará de baja.",
             icon: "warning",
             showCancelButton: true,
             confirmButtonColor: "#d33",
             cancelButtonColor: "#3085d6",
             confirmButtonText: "Sí, dar de baja",
             cancelButtonText: "Cancelar",
         }).then(async (result) => {
             if (result.isConfirmed) {
                 try {
                     await deactivatePromocion(id); // O deletePromocion(id) si la eliminación es física
                     MySwal.fire("¡Dada de baja!", "La promoción ha sido dada de baja lógicamente.", "success");
                     fetchPromociones(); // Recargar la lista
                 } catch (err) {
                     MySwal.fire("Error", "No se pudo dar de baja la promoción.", "error");
                     console.error(err);
                 }
             }
         });
     };
 */
    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            if (currentStatus) { // Si está activa, la desactivamos
                await deactivatePromocion(id);
                MySwal.fire("¡Desactivada!", "La promoción ha sido desactivada.", "success");
            } else { // Si está inactiva, la activamos
                await activatePromocion(id);
                MySwal.fire("¡Activada!", "La promoción ha sido activada.", "success");
            }
            fetchPromociones(); // Recargar la lista
        } catch (err) {
            MySwal.fire("Error", "No se pudo cambiar el estado de la promoción.", "error");
            console.error(err);
        }
    };

    const filteredPromociones = showInactive
        ? promociones
        : promociones.filter(promo => promo.baja === false || promo.baja === undefined); // Asumo que baja=false es activo

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <button onClick={fetchPromociones} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Gestión de Promociones</h2>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                        >
                            <Eye className="w-5 h-5 mr-2" />
                            {showInactive ? "Ocultar inactivas" : "Mostrar inactivas"}
                        </button>
                        <Link
                            to="/admin/promociones/new" // Ruta para el formulario de creación
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Crear Promoción
                        </Link>
                    </div>
                </div>

                {filteredPromociones.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No hay promociones para mostrar.</p>
                        {!showInactive && <p>Intenta mostrar las promociones inactivas si existen.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPromociones.map((promo) => (
                            <div key={promo.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
                                <div className="relative">
                                    <img
                                        src={promo.imagen?.denominacion || "/placeholder.svg?height=200&width=300"}
                                        alt={promo.denominacion}
                                        className="w-full h-40 object-cover"
                                    />
                                    {promo.baja && (//Property 'baja' does not exist on type 'IPromocionDTO'
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                            INACTIVA
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{promo.denominacion}</h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{promo.descripcionDescuento}</p>
                                    <p className="text-sm text-gray-500">
                                        Válida: {promo.fechaDesde} al {promo.fechaHasta}
                                    </p>
                                    <p className="text-orange-500 font-bold text-xl mt-2">${promo.precioPromocional.toFixed(2)}</p>

                                    {promo.articulosManufacturados && promo.articulosManufacturados.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-700">
                                            <span className="font-semibold">Incluye:</span>
                                            <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                                {promo.articulosManufacturados.map((art) => (
                                                    <li key={art.id}>{art.denominacion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between space-x-2">
                                        <button
                                            onClick={() => navigate(`/admin/promociones/edit/${promo.id}`)}
                                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                                        >
                                            <Edit className="w-4 h-4 mr-1" /> Editar
                                        </button>
                                        <button
                                            // Llama a handleToggleActive, pasando el ID de la promo y su estado actual de 'activo'
                                            onClick={() => handleToggleActive(promo.id!, promo.baja === false)} //
                                            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm flex items-center justify-center
                                                ${promo.baja === false // Si 'baja' es false (está activa), el botón es para "Desactivar"
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'}`} // Si 'baja' es true (está inactiva), el botón es para "Activar"
                                        >
                                            <Power className="w-4 h-4 mr-1" />
                                            {promo.baja === false ? "Desactivar" : "Activar"} {/* */}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromocionList;