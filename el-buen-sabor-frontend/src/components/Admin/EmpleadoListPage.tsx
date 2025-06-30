// src/admin/Empleados/EmpleadoListPage.tsx
import { useEffect, useState } from "react";
import type { UsuarioDTO } from "../../models/DTO/UsuarioDTO";
import { UsuarioService } from "../../services/UsuarioService";
import {Check, Loader2, Pencil, Trash2} from "lucide-react";
import {ClienteService} from "../../services/ClienteService.ts";
import type {IClienteDTO} from "../../models/DTO/IClienteDTO.ts";

const ROLES_EMPLEADO = ["ADMINISTRADOR", "COCINERO", "CAJERO", "DELIVERY"];

export default function EmpleadoListPage() {
    const [loading, setLoading] = useState(false);
    const [usuarioEdit, setUsuarioEdit] = useState<UsuarioDTO | null>(null);
    const [clienteEdit, setClienteEdit] = useState<IClienteDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const clienteService = new ClienteService();
    const usuarioService = new UsuarioService();

    type UsuarioConCliente = UsuarioDTO & {
        cliente?: IClienteDTO;
        esCliente?: boolean;
    };

    const [usuarios, setUsuarios] = useState<UsuarioConCliente[]>([]);

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const [usuariosData, clientesData] = await Promise.all([
                usuarioService.getAllUsuarios(),
                clienteService.getAllClientes()
            ]);
            setUsuarios(
                usuariosData
                    .filter((u) => ROLES_EMPLEADO.includes(u.rol))
                    .map((u) => ({
                        ...u,
                        baja: u.baja ?? false,
                        esCliente: clientesData.some((c) => c.emailUsuario === u.email),
                        cliente: clientesData.find((c) => c.emailUsuario === u.email)
                    }))
            );
        } catch (err) {
            alert("Error al cargar empleados");
        } finally {
            setLoading(false);
        }
    };



    const handleEditClick = (usuario: any) => {
        setUsuarioEdit(usuario);
        setClienteEdit(usuario.cliente || null);
        setShowForm(true);
    };

    const handleBajaEmpleado = async (id: number, baja: boolean) => {
        try {
            await usuarioService.toggleBaja(id, baja);
            await fetchEmpleados();
        } catch {
            alert("Error al cambiar estado");
        }
    };


    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Listado de Empleados</h1>
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
                            {["ID", "Nombre", "Email", "Rol", "Estado", "Acciones"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id} className={`hover:bg-gray-50 ${usuario.baja ? "opacity-50" : ""}`}>
                                <td className="px-4 py-3 whitespace-nowrap">{usuario.id}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{usuario.nombre}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{usuario.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{usuario.rol}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {usuario.baja ? "Inactivo" : "Activo"}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {/* Botón editar */}
                                        <button
                                            onClick={() => handleEditClick(usuario)}
                                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition duration-200"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {/* Botón baja/reactivar */}
                                        {!usuario.baja ? (
                                            <button
                                                onClick={() => handleBajaEmpleado(usuario.id!, true)}
                                                className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition duration-200"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBajaEmpleado(usuario.id!, false)}
                                                className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition duration-200"
                                                title="Reactivar"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Modal de edición flotante */}
            {showForm && usuarioEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Editar Empleado</h2>
                        <p className="text-xs text-gray-500 mb-2">
                            La contraseña no puede modificarse desde este panel.
                        </p>
                        <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-2">
                            {/* DATOS USUARIO */}
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={usuarioEdit.nombre}
                                onChange={(e) =>
                                    setUsuarioEdit({ ...usuarioEdit, nombre: e.target.value })
                                }
                                placeholder="Nombre"
                            />
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                value={usuarioEdit.email}
                                onChange={(e) =>
                                    setUsuarioEdit({ ...usuarioEdit, email: e.target.value })
                                }
                                placeholder="Email"
                            />
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={usuarioEdit.rol}
                                onChange={(e) =>
                                    setUsuarioEdit({ ...usuarioEdit, rol: e.target.value as any })
                                }
                            >
                                {ROLES_EMPLEADO.map((rol) => (
                                    <option key={rol} value={rol}>{rol}</option>
                                ))}
                            </select>

                            {/* DATOS CLIENTE (solo si existe) */}
                            {clienteEdit && (
                                <>
                                    <div className="font-semibold text-gray-600 mt-2 mb-1 border-b">Datos personales (Cliente asociado)</div>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={clienteEdit.apellido}
                                        onChange={(e) => setClienteEdit({ ...clienteEdit, apellido: e.target.value })}
                                        placeholder="Apellido"
                                    />
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={clienteEdit.telefono}
                                        onChange={(e) => setClienteEdit({ ...clienteEdit, telefono: e.target.value })}
                                        placeholder="Teléfono"
                                    />
                                    <input
                                        type="date"
                                        className="w-full border rounded px-3 py-2"
                                        value={clienteEdit.fechaNacimiento?.substring(0, 10) || ""}
                                        onChange={(e) => setClienteEdit({ ...clienteEdit, fechaNacimiento: e.target.value })}
                                        placeholder="Fecha de nacimiento"
                                    />
                                </>
                            )}

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
                                            // Actualizar usuario (sin password)
                                            await usuarioService.updateUsuario(usuarioEdit.id, {
                                                nombre: usuarioEdit.nombre,
                                                email: usuarioEdit.email,
                                                rol: usuarioEdit.rol
                                            });
                                            // Si existe cliente, actualizar también cliente
                                            if (clienteEdit) {
                                                await clienteService.updateCliente(clienteEdit.id, {
                                                    apellido: clienteEdit.apellido,
                                                    telefono: clienteEdit.telefono,
                                                    fechaNacimiento: clienteEdit.fechaNacimiento,

                                                });
                                            }
                                            // Recargar usuarios
                                            const [usuariosData, clientesData] = await Promise.all([
                                                usuarioService.getAllUsuarios(),
                                                clienteService.getAllClientes()
                                            ]);
                                            setUsuarios(
                                                usuariosData
                                                    .filter((u) => ROLES_EMPLEADO.includes(u.rol))
                                                    .map((u) => ({
                                                        ...u,
                                                        esCliente: clientesData.some((c) => c.emailUsuario === u.email),
                                                        cliente: clientesData.find((c) => c.emailUsuario === u.email)
                                                    }))
                                            );
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
