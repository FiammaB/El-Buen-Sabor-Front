// src/admin/Empleados/RegistrarEmpleadoPage.tsx
import { useState } from "react";
import { UsuarioService } from "../../services/UsuarioService";
import { ClienteService } from "../../services/ClienteService";
import type { PersonaEmpleadoCreateDTO } from "../../models/DTO/PersonaEmpleadoCreateDTO";

const ROLES_EMPLEADO = ["ADMINISTRADOR", "COCINERO", "CAJERO", "DELIVERY"];

export default function RegistrarEmpleadoPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        rol: "",
        nombre: "",
        apellido: "",
        telefono: "",
        fechaNacimiento: "",
    });
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const usuarioService = new UsuarioService();
    const clienteService = new ClienteService();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOk(null);
        setError(null);
        try {
            // 1. Crear usuario empleado
            const usuario = await usuarioService.createUsuario({
                nombre: form.username, // O username si querés guardar el nombre de usuario
                email: form.email,
                password: form.password,
                rol: form.rol as any,
                baja: false,
            });
            // 2. Crear persona asociada (empleado)
            const empleadoData: PersonaEmpleadoCreateDTO = {
                nombre: form.nombre,
                apellido: form.apellido,
                telefono: form.telefono,
                fechaNacimiento: form.fechaNacimiento,
                usuarioId: usuario.id!,
                // imagenId y domicilioIds opcionales
            };
            await clienteService.createEmpleadoPersona(empleadoData);
            setOk("Empleado registrado correctamente.");
            setForm({
                username: "",
                email: "",
                password: "",
                rol: "",
                nombre: "",
                apellido: "",
                telefono: "",
                fechaNacimiento: "",
            });
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "No se pudo registrar el empleado."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow mt-8">
            <h1 className="text-2xl font-bold mb-4">Registrar Nuevo Empleado</h1>
            <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                    <label className="block font-medium">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Username</label>
                    <input type="text" name="username" value={form.username} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Rol</label>
                    <select name="rol" value={form.rol} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
                        <option value="">Seleccione un rol</option>
                        {ROLES_EMPLEADO.map(rol => (
                            <option key={rol} value={rol}>{rol}</option>
                        ))}
                    </select>
                </div>
                <div className="pt-2 border-t mt-2 font-semibold text-gray-700">Datos personales</div>
                <div>
                    <label className="block font-medium">Nombre</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Apellido</label>
                    <input type="text" name="apellido" value={form.apellido} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Teléfono</label>
                    <input type="text" name="telefono" value={form.telefono} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block font-medium">Fecha Nacimiento</label>
                    <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange}
                           className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button type="submit" disabled={loading} className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </div>
                {ok && <div className="text-green-600 mt-2">{ok}</div>}
                {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
        </div>
    );
}
