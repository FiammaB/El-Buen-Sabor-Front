import type {IClienteDTO} from "../../models/DTO/IClienteDTO.ts";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {UsuarioService} from "../../services/UsuarioService.ts";


export default function ClientePerfilPage() {
    const { id } = useAuth();
    const [cliente, setCliente] = useState<IClienteDTO | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const usuarioService = new UsuarioService();
    // Form fields
    const [form, setForm] = useState({
        nombreUsuario: "",
        apellido: "",
        telefono: "",
        fechaNacimiento: "",
        emailUsuario: "",
        domicilioId: 0,
        calle: "",
        numero: "",
        cp: "",
        localidadNombre: "",
        provinciaNombre: "",
        paisNombre: "",
        password: "",
        repeatPassword: "",
    });

    useEffect(() => {
        if (!id) return;
        axios.get<IClienteDTO>(`/api/clientes/${id}`)
            .then(res => {
                const cli = res.data;
                setCliente(cli);

                // Solo toma primer domicilio por simplicidad (puedes adaptarlo)
                const dom = cli.domicilios && cli.domicilios.length > 0 ? cli.domicilios[0] : null;
                setForm({
                    nombreUsuario: cli.nombreUsuario ?? "",
                    apellido: cli.apellido ?? "",
                    telefono: cli.telefono ?? "",
                    fechaNacimiento: cli.fechaNacimiento ? cli.fechaNacimiento.substring(0, 10) : "",
                    emailUsuario: cli.emailUsuario ?? "",
                    domicilioId: dom?.id ?? 0,
                    calle: dom?.calle ?? "",
                    numero: dom?.numero?.toString() ?? "",
                    cp: dom?.cp?.toString() ?? "",
                    localidadNombre: dom?.localidad?.nombre ?? "",
                    provinciaNombre: dom?.localidad?.provincia?.nombre ?? "",
                    paisNombre: dom?.localidad?.provincia?.pais?.nombre ?? "",
                    password: "",
                    repeatPassword: "",
                });
            })
            .catch(() => setMsg("No se pudieron cargar los datos del perfil."));
    }, [id]);

    // --- Validación de password ---
    const validatePassword = (pwd: string) => {
        // Al menos 8 caracteres, una mayús, una minús, un símbolo
        return (
            pwd.length >= 8 &&
            /[A-Z]/.test(pwd) &&
            /[a-z]/.test(pwd) &&
            /[^A-Za-z0-9]/.test(pwd)
        );
    };

    // --- Actualización general de campos ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // --- Guardar Cambios ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        // Validar password si se ingresó algo (es opcional cambiar)
        if (form.password || form.repeatPassword) {
            if (form.password !== form.repeatPassword) {
                setMsg("Las contraseñas no coinciden.");
                setLoading(false);
                return;
            }
            if (!validatePassword(form.password)) {
                setMsg(
                    "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo."
                );
                setLoading(false);
                return;
            }
        }

        try {
            // 1) Actualizar datos personales y domicilio
            await axios.put(`/api/clientes/${id}`, {
                ...cliente,
                apellido: form.apellido,
                telefono: form.telefono,
                fechaNacimiento: form.fechaNacimiento,
                // El email nunca se actualiza acá
                domicilios: [
                    {
                        id: form.domicilioId,
                        calle: form.calle,
                        numero: Number(form.numero),
                        cp: Number(form.cp),
                        // Solo cambia nombre de localidad, no toda la entidad
                        localidad: {
                            ...(
                                cliente?.domicilios &&
                                cliente.domicilios.length > 0
                                    ? cliente.domicilios[0].localidad
                                    : {}
                            ),
                            nombre: form.localidadNombre,
                            provincia: {
                                ...(
                                    cliente?.domicilios &&
                                    cliente.domicilios.length > 0 &&
                                    cliente.domicilios[0].localidad
                                        ? cliente.domicilios[0].localidad.provincia
                                        : {}
                                ),
                                nombre: form.provinciaNombre,
                                pais: {
                                    ...(cliente?.domicilios &&
                                    cliente.domicilios.length > 0 &&
                                    cliente.domicilios[0].localidad &&
                                    cliente.domicilios[0].localidad.provincia
                                        ? cliente.domicilios[0].localidad.provincia.pais
                                        : {}),
                                    nombre: form.paisNombre,
                                },
                            },
                        },
                    },
                ],
            });
            if (cliente?.usuario?.id && form.nombreUsuario !== cliente.nombreUsuario) {
                await usuarioService.actualizarNombre(cliente.usuario.id, form.nombreUsuario);
            }

            setMsg("Perfil actualizado exitosamente.");
            setEditMode(false);
        } catch (error: any) {
            setMsg(error.response?.data?.message || "Error al actualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    if (!cliente) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Cargando perfil...</p>
            </div>
        );
    }

    if (!editMode) {
        // Vista SOLO-LECTURA
        const dom = cliente.domicilios?.[0];
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
                <h2 className="text-2xl font-bold mb-6 text-orange-600">Mi Perfil</h2>
                <div className="space-y-3">
                    <div><b>Nombre:</b> {cliente.nombreUsuario}</div>
                    <div><b>Apellido:</b> {cliente.apellido}</div>
                    <div><b>Teléfono:</b> {cliente.telefono}</div>
                    <div><b>Fecha de nacimiento:</b> {cliente.fechaNacimiento ? cliente.fechaNacimiento.substring(0, 10) : ""}</div>
                    <div><b>Email:</b> {cliente.emailUsuario}</div>
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Dirección de entrega</h3>
                        {dom ? (
                            <div>
                                <div>
                                    <b>{dom.calle} {dom.numero}</b>
                                    <span className="ml-2 text-gray-500">({dom.cp})</span>
                                </div>
                                <div>
                                    {dom.localidad?.nombre}, {dom.localidad?.provincia?.nombre}, {dom.localidad?.provincia?.pais?.nombre}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-600">No tenés domicilios registrados.</div>
                        )}
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => setEditMode(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                    >
                        Editar Perfil
                    </button>
                </div>
                {msg && (
                    <div className={`my-4 text-sm ${msg.includes("exitosamente") ? "text-green-600" : "text-red-600"}`}>
                        {msg}
                    </div>
                )}
            </div>
        );
    }

    // VISTA EDICIÓN
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-orange-600">Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="font-medium">Nombre</label>
                    <input
                        type="text"
                        name="nombreUsuario"
                        value={form.nombreUsuario}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        required
                    />
                </div>
                <div>
                    <label className="font-medium">Apellido</label>
                    <input
                        type="text"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        required
                    />
                </div>
                <div>
                    <label className="font-medium">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        required
                    />
                </div>
                <div>
                    <label className="font-medium">Fecha de nacimiento</label>
                    <input
                        type="date"
                        name="fechaNacimiento"
                        value={form.fechaNacimiento}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                        required
                    />
                </div>
                <div>
                    <label className="font-medium">Email</label>
                    <input
                        type="email"
                        name="emailUsuario"
                        value={form.emailUsuario}
                        className="border rounded p-2 w-full bg-gray-100"
                        disabled
                        readOnly
                    />
                </div>

                {/* Dirección */}
                <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-2">Dirección de entrega</h3>
                    <div>
                        <label className="font-medium">Calle</label>
                        <input
                            type="text"
                            name="calle"
                            value={form.calle}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Número</label>
                        <input
                            type="number"
                            name="numero"
                            value={form.numero}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Código Postal</label>
                        <input
                            type="number"
                            name="cp"
                            value={form.cp}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Localidad</label>
                        <input
                            type="text"
                            name="localidadNombre"
                            value={form.localidadNombre}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">Provincia</label>
                        <input
                            type="text"
                            name="provinciaNombre"
                            value={form.provinciaNombre}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium">País</label>
                        <input
                            type="text"
                            name="paisNombre"
                            value={form.paisNombre}
                            onChange={handleChange}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Guardar Cambios
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEditMode(false);
                            setMsg(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}