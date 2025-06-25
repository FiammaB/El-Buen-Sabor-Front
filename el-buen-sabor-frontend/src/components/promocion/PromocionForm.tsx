import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { crearPromocion } from "../../services/PromocionService";
import { getArticulosManufacturados } from "../../services/ArticuloManufacturadoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./PromocionForm.css";

const MySwal = withReactContent(Swal);
const tipos = ["HAPPY_HOUR", "PROMO_1"];

interface ArticuloSeleccionado {
    articuloId: number;
    cantidad: number;
}

interface FormularioPromocion {
    denominacion: string;
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    precioPromocional: number;
    tipoPromocion: string;
    articulos: ArticuloSeleccionado[];
}

const PromocionForm: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<FormularioPromocion>();
    const [articulosDisponibles, setArticulosDisponibles] = useState<any[]>([]);
    const [seleccionados, setSeleccionados] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        getArticulosManufacturados()
            .then(setArticulosDisponibles)
            .catch((error) => console.error("Error al cargar artículos", error));
    }, []);

    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSeleccionados((prev) => ({ ...prev, [id]: 1 }));
        } else {
            const nuevos = { ...seleccionados };
            delete nuevos[id];
            setSeleccionados(nuevos);
        }
    };

    const handleCantidadChange = (id: number, cantidad: number) => {
        setSeleccionados((prev) => ({ ...prev, [id]: cantidad }));
    };

    const onSubmit = async (data: any) => {
        const articulos: ArticuloSeleccionado[] = Object.entries(seleccionados)
            .map(([articuloId, cantidad]) => ({
                articuloId: parseInt(articuloId),
                cantidad: Number(cantidad),
            }))
            .filter((item) => item.cantidad > 0);

        const promocion: FormularioPromocion = {
            ...data,
            articulos,
        };

        try {
            await crearPromocion(promocion);
            MySwal.fire("Éxito", "Promoción creada correctamente", "success");
            reset();
            setSeleccionados({});
        } catch (error) {
            MySwal.fire("Error", "No se pudo crear la promoción", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="promo-form">
            <h2>Crear Promoción</h2>

            <label>Denominación</label>
            <input type="text" {...register("denominacion")} required />

            <label>Fecha Desde</label>
            <input type="date" {...register("fechaDesde")} required />

            <label>Fecha Hasta</label>
            <input type="date" {...register("fechaHasta")} required />

            <label>Hora Desde</label>
            <input type="time" {...register("horaDesde")} required />

            <label>Hora Hasta</label>
            <input type="time" {...register("horaHasta")} required />

            <label>Precio Promocional</label>
            <input type="number" step="0.01" {...register("precioPromocional")} required />

            <label>Tipo de Promoción</label>
            <select {...register("tipoPromocion")} required>
                <option value="">Seleccione</option>
                {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                        {tipo}
                    </option>
                ))}
            </select>

            <h3>Artículos Manufacturados</h3>
            {articulosDisponibles.map((art) => (
                <div key={art.id} className="articulo-entry">
                    <input
                        type="checkbox"
                        id={`art-${art.id}`}
                        checked={seleccionados[art.id] !== undefined}
                        onChange={(e) => handleCheckboxChange(art.id, e.target.checked)}
                    />
                    <label htmlFor={`art-${art.id}`} style={{ marginRight: "10px" }}>
                        {art.denominacion}
                    </label>

                    {art.imagen?.denominacion && (
                        <img
                            src={art.imagen.denominacion}
                            alt={art.denominacion}
                            style={{ width: "120px", height: "auto", marginTop: "5px", borderRadius: "8px" }}
                        />
                    )}

                    {seleccionados[art.id] !== undefined && (
                        <input
                            type="number"
                            min={1}
                            value={seleccionados[art.id]}
                            onChange={(e) => handleCantidadChange(art.id, Number(e.target.value))}
                            style={{ width: "80px" }}
                        />
                    )}
                </div>
            ))}

            <button type="submit" className="btn-submit">
                Guardar Promoción
            </button>
        </form>
    );
};

export default PromocionForm;
