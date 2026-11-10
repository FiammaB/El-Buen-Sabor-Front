import { useEffect, useState } from "react";
import { getSucursales, type ISucursalDTO } from "../../services/SucursalService";

interface SucursalSelectProps {
    value: number | null;
    onChange: (sucursalId: number) => void;
    className?: string;
}

// Selector de sucursal reutilizable: carga la lista real desde el backend y, si todavía no hay
// nada elegido, propone la primera como default (para no dejar el selector en blanco).
export default function SucursalSelect({ value, onChange, className }: SucursalSelectProps) {
    const [sucursales, setSucursales] = useState<ISucursalDTO[]>([]);

    useEffect(() => {
        getSucursales().then((data) => {
            setSucursales(data);
            if (!value && data.length > 0) {
                onChange(data[0].id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className={className ?? "w-full border rounded-md px-3 py-2"}
        >
            {sucursales.length === 0 && <option value="">Cargando sucursales...</option>}
            {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
        </select>
    );
}
