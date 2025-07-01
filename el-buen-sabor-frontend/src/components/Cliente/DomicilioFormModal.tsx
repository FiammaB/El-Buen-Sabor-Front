// src/components/Cliente/DomicilioFormModal.tsx
import React, { useState } from "react";
import type { IDomicilioDTO } from "../../models/DTO/IClienteDTO"; // o tu ruta

interface Props {
    domicilio: IDomicilioDTO;
    onSave: (nuevoDomicilio: IDomicilioDTO) => void;
    onCancel: () => void;
}

export default function DomicilioFormModal({ domicilio, onSave, onCancel }: Props) {
    const [form, setForm] = useState<IDomicilioDTO>({ ...domicilio });

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <h3 className="text-lg font-bold mb-4">Editar domicilio</h3>
                <form
                    onSubmit={e => {
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
                            onChange={e => setForm(f => ({ ...f, calle: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Número</label>
                        <input
                            type="number"
                            value={form.numero}
                            className="border rounded p-2 w-full"
                            onChange={e => setForm(f => ({ ...f, numero: Number(e.target.value) }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">CP</label>
                        <input
                            type="number"
                            value={form.cp}
                            className="border rounded p-2 w-full"
                            onChange={e => setForm(f => ({ ...f, cp: Number(e.target.value) }))}
                            required
                        />
                    </div>
                    {/* Localidad y provincia puede ser select o mostrar nombre actual (si sólo querés editar básico) */}
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
