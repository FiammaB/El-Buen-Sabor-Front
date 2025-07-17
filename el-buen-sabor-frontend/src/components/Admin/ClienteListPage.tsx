// src/admin/Clientes/ClienteListPage.tsx
import { useEffect, useState } from "react";
import type { IClienteDTO } from "../../models/DTO/IClienteDTO";
import { ClienteService } from "../../services/ClienteService";
import { Loader2, Pencil, X } from "lucide-react";

export default function ClienteListPage() {
    const [clientes, setClientes] = useState<IClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [clienteEdit, setClienteEdit] = useState<IClienteDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [clienteExpandidoId, setClienteExpandidoId] = useState<number | null>(null);

    // Se asume que ClienteService no necesita instanciarse en cada render
    const clienteService = new ClienteService();

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const data = await clienteService.getAllClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            // Aquí podrías agregar un estado para mostrar un mensaje de error en la UI
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleUpdateCliente = async () => {
        if (!clienteEdit) return;
        try {
            await clienteService.updateCliente(clienteEdit.id, clienteEdit);
            setShowForm(false);
            setClienteEdit(null);
            fetchClientes(); // Volver a cargar los clientes para reflejar los cambios
        } catch (err) {
            alert("Error al actualizar el cliente.");
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Clientes</h1>

            {loading ? (
                <div className="flex items-center justify-center space-x-2 text-gray-600 mt-10">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Cargando clientes...</span>
                </div>
            ) : (
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["ID", "Nombre", "Apellido", "Email", "Teléfono", "Fecha Nacimiento", "Domicilios", "Estado", "Acciones"]
                                        .map((h) => (
                                            <th key={h} className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {clientes.map((cliente) => (
                                    <>
                                        <tr key={cliente.id} className={`transition-colors hover:bg-gray-50 ${cliente.baja ? "bg-red-50 opacity-60" : ""}`}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cliente.id}</td>
                                            {/* CAMBIO: Se usa 'cliente.nombre' en lugar de 'cliente.nombreUsuario' para coincidir con el DTO */}
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cliente.nombre || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cliente.apellido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cliente.emailUsuario || "-"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cliente.telefono}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {cliente.fechaNacimiento
                                                    ? new Date(cliente.fechaNacimiento).toLocaleDateString("es-AR", { timeZone: 'UTC' })
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {cliente.domicilios && cliente.domicilios.length > 0 ? (
                                                    <button
                                                        onClick={() => setClienteExpandidoId(clienteExpandidoId === cliente.id ? null : cliente.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                    >
                                                        {clienteExpandidoId === cliente.id ? "Ocultar" : "Ver"} ({cliente.domicilios.length})
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Sin datos</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cliente.baja ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {cliente.baja ? "Inactivo" : "Activo"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setClienteEdit(cliente);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    title="Editar cliente"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>

                                        {clienteExpandidoId === cliente.id && (
                                            <tr>
                                                <td colSpan={9} className="bg-gray-50 px-6 py-4">
                                                    <h4 className="font-semibold text-xs mb-2 text-gray-600">DOMICILIOS:</h4>
                                                    <div className="flex overflow-x-auto gap-4 pb-2">
                                                        {cliente.domicilios?.map((d, i) => (
                                                            <div key={d.id || i} className="min-w-[280px] bg-white rounded-lg p-3 border shadow-sm text-xs text-gray-600">
                                                                <p><strong>Calle:</strong> {d.calle} {d.numero}</p>
                                                                <p><strong>CP:</strong> {d.cp}</p>
                                                                <p><strong>Localidad:</strong> {d.localidad?.nombre}, {d.localidad?.provincia?.nombre}</p>
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
                    </div>
                </section>
            )}

            {/* Modal de edición flotante con LABELS */}
            {showForm && clienteEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold mb-5 text-gray-800">Editar Cliente #{clienteEdit.id}</h2>

                        <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* MEJORA: Se agrega un label para cada campo */}
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={clienteEdit.nombre || ''}
                                    readOnly // <-- AGREGADO

                                //onChange={(e) => setClienteEdit({ ...clienteEdit, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    id="apellido"
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={clienteEdit.apellido}
                                    readOnly // <-- AGREGADO

                                //onChange={(e) => setClienteEdit({ ...clienteEdit, apellido: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={clienteEdit.emailUsuario || ''}
                                    readOnly // <-- AGREGADO

                                //onChange={(e) => setClienteEdit({ ...clienteEdit, emailUsuario: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    id="telefono"
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={clienteEdit.telefono}
                                    onChange={(e) => setClienteEdit({ ...clienteEdit, telefono: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center mt-2">
                                <input
                                    id="estado"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    checked={!clienteEdit.baja}
                                    onChange={() => setClienteEdit((prev) => ({ ...prev!, baja: !prev?.baja }))}
                                />
                                <label htmlFor="estado" className="ml-2 block text-sm text-gray-900">
                                    Cliente activo
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => { setShowForm(false); setClienteEdit(null); }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateCliente}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}