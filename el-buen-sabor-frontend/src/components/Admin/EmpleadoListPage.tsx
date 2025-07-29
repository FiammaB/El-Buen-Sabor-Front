// src/pages/EmpleadoListPage.tsx
import { useEffect, useState } from "react";
import type { UsuarioDTO } from "../../models/DTO/UsuarioDTO";
import { UsuarioService } from "../../services/UsuarioService";
import { ClienteService } from "../../services/ClienteService";
import type { IClienteDTO } from "../../models/DTO/IClienteDTO";
import { Pencil, Trash2, Check, Loader2 } from "lucide-react";

const ROLES_EMPLEADO = ["ADMINISTRADOR", "COCINERO", "CAJERO", "DELIVERY"];
function soloLetras(texto: string) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/.test(texto.trim());
}
function soloNumeros(texto: string) {
    return /^[0-9]*$/.test(texto);
}
function validarEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function edad(fechaNacimiento: string) {
    const hoy = new Date();
    const fnac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fnac.getFullYear();
    const m = hoy.getMonth() - fnac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fnac.getDate())) edad--;
    return edad;
}
export default function EmpleadoListPage() {
    const [loading, setLoading] = useState(false);
    const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
    const [clientes, setClientes] = useState<IClienteDTO[]>([]);
    const [editUser, setEditUser] = useState<UsuarioDTO | null>(null);
    const [editCliente, setEditCliente] = useState<IClienteDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"usuario" | "persona">("usuario");
    const usuarioService = new UsuarioService();
    const clienteService = new ClienteService();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usuariosData, clientesData] = await Promise.all([
                usuarioService.getAllUsuarios(),
                clienteService.getAllClientes()
            ]);
            setUsuarios(usuariosData.filter(u => ROLES_EMPLEADO.includes(u.rol)));
            setClientes(clientesData);
        } catch {
            alert("Error al cargar empleados");
        } finally {
            setLoading(false);
        }
    };

    // Relaciona cada usuario empleado con su persona/cliente (por email)
    const empleadosFull = usuarios.map(u => ({
        ...u,
        persona: clientes.find(c => c.emailUsuario === u.email)
    }));

    const handleEditClick = (usuario: UsuarioDTO) => {
        setEditUser(usuario);
        setEditCliente(clientes.find(c => c.emailUsuario === usuario.email) || null);
        setShowForm(true);
    };

    const handleToggleBaja = async (usuarioId: number, personaId: number, baja: boolean) => {
        try {
            // Optimistic UI Update: Update state immediately
            setUsuarios(prevUsuarios =>
                prevUsuarios.map(u => (u.id === usuarioId ? { ...u, baja: baja } : u))
            );
            setClientes(prevClientes =>
                prevClientes.map(c => (c.id === personaId ? { ...c, baja: baja } : c))
            );

            // 1. Primero baja usuario
            await usuarioService.toggleBaja(usuarioId, baja);
            // 2. Luego baja persona
            await clienteService.toggleBaja(personaId, baja);

        } catch (error) {
            // Revert optimistic update if there's an error
            alert("Error al cambiar el estado del empleado");
            console.error("Error toggling baja:", error);
            // Revert to previous state by refetching data in case of error
            await fetchData();
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
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Apellido</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Username</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3">Teléfono</th>
                            <th className="px-4 py-3">Fecha Nac.</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {empleadosFull.map(emp => {
                            // Estado combinado: inactivo solo si usuario Y persona están dados de baja
                            const inactivo = !!emp.baja && !!emp.persona?.baja;

                            return (
                                <tr key={emp.id} className={`hover:bg-gray-50 ${inactivo ? "opacity-60" : ""}`}>
                                    <td className="px-4 py-3">{emp.id}</td>
                                    <td className="px-4 py-3">{emp.persona?.nombre || "-"}</td>
                                    <td className="px-4 py-3">{emp.persona?.apellido || "-"}</td>
                                    <td className="px-4 py-3">{emp.email}</td>
                                    <td className="px-4 py-3">{emp.username}</td>
                                    <td className="px-4 py-3">{emp.rol}</td>
                                    <td className="px-4 py-3">{emp.persona?.telefono || "-"}</td>
                                    <td className="px-4 py-3">{emp.persona?.fechaNacimiento?.substring(0, 10) || "-"}</td>
                                    <td className="px-4 py-3">
                                        {inactivo ? (
                                            <span className="text-red-600 font-semibold">Inactivo</span>
                                        ) : (
                                            <span className="text-green-700 font-semibold">Activo</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditClick(emp)}
                                                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {!inactivo ? ( // Show "Delete" button if not inactive
                                                <button
                                                    onClick={() => handleToggleBaja(emp.id!, emp.persona?.id!, true)}
                                                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : ( // Show "Reactivate" button if inactive
                                                <button
                                                    onClick={() => handleToggleBaja(emp.id!, emp.persona?.id!, false)}
                                                    className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600"
                                                    title="Reactivar"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Modal edición */}
            {showForm && editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Editar Empleado</h2>
                        {/* Tabs */}
                        <div className="flex mb-4 border-b">
                            <button
                                className={`px-4 py-2 font-medium focus:outline-none border-b-2 transition ${
                                    activeTab === "usuario"
                                        ? "border-orange-500 text-orange-600"
                                        : "border-transparent text-gray-500 hover:text-orange-600"
                                }`}
                                onClick={() => setActiveTab("usuario")}
                            >
                                Usuario
                            </button>
                            <button
                                className={`px-4 py-2 font-medium focus:outline-none border-b-2 transition ${
                                    activeTab === "persona"
                                        ? "border-orange-500 text-orange-600"
                                        : "border-transparent text-gray-500 hover:text-orange-600"
                                }`}
                                onClick={() => setActiveTab("persona")}
                            >
                                Persona
                            </button>
                        </div>

                        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
                            {activeTab === "usuario" ? (
                                <>
                                    <label className="block font-medium">Username</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUser?.username || ""}
                                        onChange={e =>
                                            setEditUser(editUser ? { ...editUser, username: e.target.value } : null)
                                        }
                                        placeholder="Username"
                                    />
                                    <label className="block font-medium">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUser?.email || ""}
                                        disabled
                                    />
                                    <label className="block font-medium">Rol</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={editUser?.rol}
                                        onChange={e =>
                                            setEditUser(editUser ? { ...editUser, rol: e.target.value as any } : null)
                                        }
                                    >
                                        {ROLES_EMPLEADO.map(rol => (
                                            <option key={rol} value={rol}>{rol}</option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label className="block font-medium">Nombre</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editCliente?.nombre || ""}
                                        onChange={e =>
                                            setEditCliente(editCliente ? { ...editCliente, nombre: e.target.value } : null)
                                        }
                                        placeholder="Nombre"
                                    />
                                    <label className="block font-medium">Apellido</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editCliente?.apellido || ""}
                                        onChange={e =>
                                            setEditCliente(editCliente ? { ...editCliente, apellido: e.target.value } : null)
                                        }
                                        placeholder="Apellido"
                                    />
                                    <label className="block font-medium">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editCliente?.telefono || ""}
                                        onChange={e =>
                                            setEditCliente(editCliente ? { ...editCliente, telefono: e.target.value } : null)
                                        }
                                        placeholder="Teléfono"
                                    />
                                    <label className="block font-medium">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-3 py-2"
                                        value={editCliente?.fechaNacimiento?.substring(0, 10) || ""}
                                        onChange={e =>
                                            setEditCliente(editCliente ? { ...editCliente, fechaNacimiento: e.target.value } : null)
                                        }
                                        placeholder="Fecha de nacimiento"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            {activeTab === "usuario" ? (
                                <button
                                    onClick={async () => {
                                        if (!soloLetras(editUser?.username || "")) {
                                            alert("El username solo debe contener letras y espacios.");
                                            return;
                                        }
                                        try {
                                            // Solo actualiza datos de usuario
                                            await usuarioService.updateUsuario(editUser!.id!, {
                                                username: editUser!.username,
                                                email: editUser!.email, // Keep email as is if not editable
                                                rol: editUser!.rol,
                                            });
                                            await fetchData();
                                            setShowForm(false);
                                        } catch (e) {
                                            alert("Error al actualizar usuario");
                                            console.error("Error updating user:", e); // Log the actual error
                                        }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Guardar Usuario
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        // Validaciones antes de actualizar
                                        if (!soloLetras(editCliente?.nombre || "")) {
                                            alert("El nombre solo debe contener letras y espacios.");
                                            return;
                                        }
                                        if (!soloLetras(editCliente?.apellido || "")) {
                                            alert("El apellido solo debe contener letras y espacios.");
                                            return;
                                        }
                                        if (!soloNumeros(editCliente?.telefono || "") || (editCliente?.telefono || "").length > 14) {
                                            alert("El teléfono debe tener solo números y hasta 14 dígitos.");
                                            return;
                                        }
                                        if (!editCliente?.fechaNacimiento) {
                                            alert("Debe ingresar una fecha de nacimiento.");
                                            return;
                                        }
                                        if (edad(editCliente?.fechaNacimiento || "") > 100) {
                                            alert("La fecha de nacimiento no puede ser mayor a 100 años.");
                                            return;
                                        }
                                        // Si pasa validaciones, actualizá
                                        try {
                                            await clienteService.updateCliente(editCliente.id!, { // Ensure editCliente.id is not null
                                                nombre: editCliente.nombre,
                                                apellido: editCliente.apellido,
                                                telefono: editCliente.telefono,
                                                fechaNacimiento: editCliente.fechaNacimiento,
                                            });
                                            await fetchData();
                                            setShowForm(false);
                                        } catch (e) {
                                            alert("Error al actualizar persona");
                                            console.error("Error updating person:", e); // Log the actual error
                                        }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Guardar Persona
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}