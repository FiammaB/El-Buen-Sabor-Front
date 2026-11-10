import { useState } from "react";
import { useAuth } from "../Auth/Context/AuthContext.tsx";
import SucursalSelect from "./SucursalSelect";

// Antes de entrar al panel, cocinero/cajero/delivery eligen en qué sucursal están trabajando
// este turno (pueden rotar de sucursal entre turnos, no es un dato fijo del usuario). Una vez
// elegida queda guardada para el resto de la sesión (ver AuthContext.setSucursalId).
export default function SeleccionarSucursalGate({ children }: { children: React.ReactNode }) {
    const { sucursalId, setSucursalId } = useAuth();
    const [seleccion, setSeleccion] = useState<number | null>(null);

    if (sucursalId) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-2">¿En qué sucursal trabajás hoy?</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Elegí la sucursal para este turno — vas a ver solo los pedidos de esa sucursal.
                </p>
                <SucursalSelect value={seleccion} onChange={setSeleccion} className="w-full border rounded-md px-3 py-2 mb-4" />
                <button
                    onClick={() => seleccion && setSucursalId(seleccion)}
                    disabled={!seleccion}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md py-2 font-medium"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
