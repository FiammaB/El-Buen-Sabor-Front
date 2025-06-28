import React, { useEffect, useState } from "react";
import { getPromociones } from "../../services/PromocionService";
import type { IPromocionDTO } from "../../models/DTO/IPromocionDTO";
import "./PromocionList.css";

const PromocionList: React.FC = () => {
    const [promociones, setPromociones] = useState<IPromocionDTO[]>([]);

    useEffect(() => {
        getPromociones()
            .then(setPromociones)
            .catch((error) => console.error("Error al cargar promociones:", error));
    }, []);

    return (
        <div className="promocion-list-container">
            <h2>Promociones disponibles</h2>
            <div className="promocion-grid">
                {promociones.map((promo) => (
                    <div key={promo.id} className="promocion-card">
                        <h3>{promo.denominacion}</h3>
                        <p>Válida desde {promo.fechaDesde} hasta {promo.fechaHasta}</p>
                        <p>Precio promocional: ${promo.precioPromocional.toFixed(2)}</p>
                        <ul>
                            {promo.articulos?.map((a) => (
                                <li key={a.articuloId}>• {a.nombre} x{a.cantidad}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromocionList;
