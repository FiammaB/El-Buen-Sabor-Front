import React, { useEffect, useState } from "react";
import { getPromociones } from "../../services/PromocionService";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import type { IArticuloManufacturadoResponseDTO } from "../../models/DTO/IAArticuloManufacturadoResponseDTO";
import { getArticulosManufacturados } from "../../services/ArticuloManufacturadoService";
import { useCart } from "../../components/Cart/context/cart-context";

const PromocionPage: React.FC = () => {
    const [promociones, setPromociones] = useState<IPromocionDTO[]>([]);
    const [articulos, setArticulos] = useState<IArticuloManufacturadoResponseDTO[]>([]);
    const { addToCart } = useCart();

    useEffect(() => {
        getPromociones().then(setPromociones).catch(console.error);
        getArticulosManufacturados().then(setArticulos).catch(console.error);
    }, []);

    const hoy = new Date();
    const promocionesVigentes = promociones.filter((promo) => {
        const desde = new Date(promo.fechaDesde);
        const hasta = new Date(promo.fechaHasta);
        return desde <= hoy && hasta >= hoy;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-orange-600">Promociones vigentes</h1>

            <div className="flex justify-center gap-4 mb-8">
                <button
                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                    onClick={() => window.location.href = "/"}
                >
                    Volver al inicio
                </button>
                <button
                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                    onClick={() => window.location.href = "/cart"}
                >
                    Ir al carrito
                </button>
            </div>

            {promocionesVigentes.length === 0 ? (
                <p className="text-center text-lg text-gray-600">
                    No hay promociones disponibles en este momento.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {promocionesVigentes.map((promo) => (
                        <div key={promo.id} className="bg-white shadow rounded p-4 flex flex-col items-center">
                            <img
                                src={promo.imagen?.denominacion || "/promo.jpg"}
                                alt="Promo"
                                className="w-full h-48 object-cover rounded mb-4"
                            />
                            <h2 className="text-xl font-semibold text-center mb-2">{promo.denominacion}</h2>
                            <p className="text-orange-600 font-bold mb-2">${promo.precioPromocional.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 text-center mb-2">
                                Desde: {promo.fechaDesde} <br />
                                Hasta: {promo.fechaHasta}
                            </p>
                            <ul className="text-sm text-gray-700 mb-4">
                                {promo.articulosManufacturados?.map((articulo) => (
                                    <li key={articulo.id}>
                                        {articulo.denominacion} - ${articulo.precioVenta.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
                                onClick={() => {
                                    const promoCombo = {
                                        id: promo.id,
                                        denominacion: `Combo: ${promo.denominacion}`,
                                        precioVenta: promo.precioPromocional,
                                        descripcion: "Promoción especial",
                                        tiempoEstimadoMinutos: 20,
                                        imagen: {
                                            denominacion: promo.imagen?.denominacion || ""
                                        },
                                        categoria: { id: 999, denominacion: "Promoción" },
                                        categoriaId: 999,
                                        detalles: [],
                                        preparacion: ""
                                    };
                                    addToCart(promoCombo, 1);
                                }}
                            >
                                Agregar al carrito
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromocionPage;
