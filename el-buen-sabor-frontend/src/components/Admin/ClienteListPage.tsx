// src/admin/Clientes/ClienteListPage.tsx
import { useEffect, useState } from "react";
import type { IClienteDTO } from "../../models/DTO/IClienteDTO";
import { ClienteService } from "../../services/ClienteService";
import { useNavigate } from "react-router-dom";
import {Loader2, Pencil} from "lucide-react";

export default function ClienteListPage() {
    const [clientes, setClientes] = useState<IClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [clienteEdit, setClienteEdit] = useState<IClienteDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [clienteExpandidoId, setClienteExpandidoId] = useState<number | null>(null);

    const clienteService = new ClienteService();

    useEffect(() => {
        const fetchClientes = async () => {
            setLoading(true);
            try {
                const data = await clienteService.getAllClientes();
                setClientes(data);
            } catch (error) {
                console.error("Error al cargar clientes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientes();
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Listado de Clientes</h1>

            {loading ? (
                <div className="flex items-center space-x-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Cargando...</span>
                </div>
            ) : (
                <section className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            {[
                                "ID",
                                "Nombre",
                                "Apellido",
                                "Email",
                                "Teléfono",
                                "Fecha Nacimiento",
                                "Domicilios",
                                "Estado",
                                "Acciones",
                            ].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {clientes.map((cliente) => (
                            <>
                                <tr key={cliente.id} className={`hover:bg-gray-50 ${cliente.baja ? "opacity-50" : ""}`}>
                                    <td className="px-4 py-3 whitespace-nowrap">{cliente.id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{cliente.nombreUsuario}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{cliente.apellido}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{cliente.emailUsuario}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{cliente.telefono}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {cliente.fechaNacimiento
                                            ? new Date(cliente.fechaNacimiento).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {cliente.domicilios && cliente.domicilios.length > 0 ? (
                                            <button
                                                onClick={() =>
                                                    setClienteExpandidoId(clienteExpandidoId === cliente.id ? null : cliente.id)
                                                }
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                {clienteExpandidoId === cliente.id ? "Ocultar domicilios" : "Ver domicilios"}
                                            </button>
                                        ) : (
                                            <span className="text-gray-500 text-sm">Sin domicilios</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {cliente.baja ? "Inactivo" : "Activo"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setClienteEdit(cliente);
                                                setShowForm(true);
                                            }}
                                            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>

                                {clienteExpandidoId === cliente.id && (
                                    <tr>
                                        <td colSpan={9} className="bg-gray-50 px-4 py-3">
                                            <div className="flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                {cliente.domicilios.map((d, i) => (
                                                    <div
                                                        key={i}
                                                        className="min-w-[240px] bg-white rounded-md p-4 border shadow text-xs"
                                                    >
                                                        <div><strong>Calle:</strong> {d.calle} {d.numero}</div>
                                                        <div><strong>CP:</strong> {d.cp}</div>
                                                        <div>
                                                            <strong>Localidad:</strong> {d.localidad?.nombre}, {d.localidad?.provincia?.nombre}, {d.localidad?.provincia?.pais?.nombre}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Modal de edición flotante */}
            {showForm && clienteEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Editar Cliente</h2>

                        <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-2">
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={clienteEdit.nombreUsuario}
                                onChange={(e) =>
                                    setClienteEdit({ ...clienteEdit, nombreUsuario: e.target.value })
                                }
                                placeholder="Nombre"
                            />
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={clienteEdit.apellido}
                                onChange={(e) =>
                                    setClienteEdit({ ...clienteEdit, apellido: e.target.value })
                                }
                                placeholder="Apellido"
                            />
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                value={clienteEdit.emailUsuario}
                                onChange={(e) =>
                                    setClienteEdit({ ...clienteEdit, emailUsuario: e.target.value })
                                }
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={clienteEdit.telefono}
                                onChange={(e) =>
                                    setClienteEdit({ ...clienteEdit, telefono: e.target.value })
                                }
                                placeholder="Teléfono"
                            />

                            {/* Domicilios */}
                            {clienteEdit.domicilios?.length > 0 && (
                                <div className="border rounded p-3 bg-gray-50">
                                    <h3 className="font-medium text-sm mb-2">Direcciones</h3>
                                    <ul className="text-sm space-y-2">
                                        {clienteEdit.domicilios.map((dom, index) => (
                                            <li key={dom.id || index} className="border-b pb-2">
                                                <div><strong>Calle:</strong> {dom.calle} {dom.numero}</div>
                                                <div><strong>CP:</strong> {dom.cp}</div>
                                                <div>
                                                    <strong>Localidad:</strong> {dom.localidad?.nombre}, {dom.localidad?.provincia?.nombre}, {dom.localidad?.provincia?.pais?.nombre}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={!clienteEdit.baja}
                                    onChange={() =>
                                        setClienteEdit((prev) => ({ ...prev!, baja: !prev?.baja }))
                                    }
                                />
                                Cliente activo
                            </label>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await clienteService.updateCliente(clienteEdit.id, clienteEdit);
                                            const nuevos = await clienteService.getAllClientes();
                                            setClientes(nuevos);
                                            setShowForm(false);
                                        } catch (err) {
                                            alert("Error al actualizar");
                                        }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
