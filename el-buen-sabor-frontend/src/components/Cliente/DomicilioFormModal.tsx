// src/components/Cliente/DomicilioFormModal.tsx
import React, { useState } from "react";
import type { IDomicilioDTO } from "../../models/DTO/IClienteDTO"; // o tu ruta
import { useEffect } from "react";
import { LocalidadService } from "../../services/LocalidadService";
import type {ILocalidadDTO} from "../../models/DTO/ILocalidadDTO.ts";

interface Props {
    domicilio: IDomicilioDTO;
    onSave: (nuevoDomicilio: IDomicilioDTO) => void;
    onCancel: () => void;
}

export default function DomicilioFormModal({ domicilio, onSave, onCancel }: Props) {
    const [form, setForm] = useState<IDomicilioDTO>({ ...domicilio });
    const [localidades, setLocalidades] = useState<ILocalidadDTO[]>([]);
    const [loadingLocalidades, setLoadingLocalidades] = useState(true);
    const [errorLocalidades, setErrorLocalidades] = useState<string | null>(null);

    const localidadService = new LocalidadService(); // Instancia del servicio de localidades

    useEffect(() => {
        // Cargar las localidades al montar el componente
        const fetchLocalidades = async () => {
            try {
                const data = await localidadService.getAll();
                setLocalidades(data);
                // Si hay una localidad en el domicilio actual, asegúrate de que esté seleccionada
                if (form.localidad && form.localidad.id) {
                    // No es necesario setear el form aquí si ya lo inicializamos arriba
                    // con `domicilio`, que debería contener la localidad completa si viene de una edición.
                    // Si es un domicilio nuevo, `form.localidad.id` será 0 y no afectará la selección inicial.
                }
            } catch (error) {
                console.error("Error al cargar localidades:", error);
                setErrorLocalidades("No se pudieron cargar las localidades.");
            } finally {
                setLoadingLocalidades(false);
            }
        };
        fetchLocalidades();
    }, []);

    const handleLocalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLocalidadId = Number(e.target.value);
        const selectedLocalidad = localidades.find(
            (loc) => loc.id === selectedLocalidadId
        );

        if (selectedLocalidad) {
            setForm((prev) => ({
                ...prev,
                localidad: { // Asegurarse de que el objeto localidad tiene los campos mínimos esperados
                    id: selectedLocalidad.id,
                    nombre: selectedLocalidad.nombre,
                    provincia: selectedLocalidad.provincia ? { ...selectedLocalidad.provincia } : undefined,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, localidad: { id: 0, nombre: "", provincia: {id:0, nombre: "", pais: {id:0, nombre: ""}}} })); // Resetear si no se selecciona
        }
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <h3 className="text-lg font-bold mb-4">{domicilio.id ? "Editar domicilio" : "Agregar nuevo domicilio"}</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave(form);
                    }}
                    className="space-y-3"
                >
                    <div>
                        <label className="font-medium">Calle</label>
                        <input
                            type="text"
                            value={form.calle}
                            className="border rounded p-2 w-full"
                            onChange={(e) => setForm((f) => ({ ...f, calle: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Número</label>
                        <input
                            type="number"
                            value={form.numero}
                            className="border rounded p-2 w-full"
                            onChange={(e) => setForm((f) => ({ ...f, numero: Number(e.target.value) }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">CP</label>
                        <input
                            type="number"
                            value={form.cp}
                            className="border rounded p-2 w-full"
                            onChange={(e) => setForm((f) => ({ ...f, cp: Number(e.target.value) }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Localidad</label>
                        {loadingLocalidades ? (
                            <p>Cargando localidades...</p>
                        ) : errorLocalidades ? (
                            <p className="text-red-500">{errorLocalidades}</p>
                        ) : (
                            <select
                                value={form.localidad?.id || ""} // Asegúrate de que el valor sea el ID
                                onChange={handleLocalidadChange}
                                className="border rounded p-2 w-full"
                                required
                            >
                                <option value="">Seleccione una localidad</option>
                                {localidades.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.nombre} ({loc.provincia?.nombre})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-200 px-3 py-2 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}