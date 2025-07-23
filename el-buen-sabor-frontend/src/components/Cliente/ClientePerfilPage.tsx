//src/pages/cliente/ClientePerfilPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/Context/AuthContext";
import axios from "axios";
import { Pencil } from "lucide-react";

type PerfilDTO = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string;
  usuario: {
    email: string;
    username: string;
    rol: string;
  };
  domicilio?: {
    calle: string;
    numero: number;
    cp: string;
    localidad?: {
      nombre: string;
      provincia?: {
        nombre: string;
        pais?: {
          nombre: string;
        };
      };
    };
  };
};

export default function ClientePerfilPage() {
  const { email, login, id, role } = useAuth();
  const [perfil, setPerfil] = useState<PerfilDTO | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    passwordActual: "",
    nuevaPassword: "",
    repetirPassword: "",
  });

  useEffect(() => {
    if (!email) return;
    axios
      .get<PerfilDTO>(`http://localhost:8080/api/usuarios/perfil/${email}`)
      .then((res) => {
        const p = res.data;
        setPerfil(p);
        setForm({
          nombre: p.nombre ?? "",
          apellido: p.apellido ?? "",
          telefono: p.telefono ?? "",
          fechaNacimiento: p.fechaNacimiento
            ? p.fechaNacimiento.substring(0, 10)
            : "",
          passwordActual: "",
          nuevaPassword: "",
          repetirPassword: "",
        });
      })
      .catch(() => setMsg("No se pudieron cargar los datos del perfil."));
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg(null);

    if (form.nuevaPassword || form.repetirPassword) {
      if (form.nuevaPassword !== form.repetirPassword) {
        setMsg("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
      if (!validatePassword(form.nuevaPassword)) {
        setMsg(
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo."
        );
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.put<PerfilDTO>(
        `http://localhost:8080/api/usuarios/perfil/${email}`,
        {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          fechaNacimiento: form.fechaNacimiento,
          email: email,
          passwordActual: form.passwordActual || null,
          nuevaPassword: form.nuevaPassword || null,
          repetirPassword: form.repetirPassword || null,
        }
      );

      // ✅ Actualizamos el perfil en tiempo real con la respuesta del backend
      setPerfil(res.data);

      // ✅ También refrescamos AuthContext y localStorage
      const nombreCompleto = `${res.data.nombre} ${res.data.apellido}`.trim();
      login(id!, role!, nombreCompleto, res.data.usuario.email, res.data.telefono);

      setMsg("Perfil actualizado exitosamente.");
      setEditMode(false);
    } catch (error: any) {
      setMsg(
        error.response?.data?.error || "Error al actualizar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!perfil) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!editMode) {
    const dom = perfil.domicilio;
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8 relative">
        {/* Botón de lápiz */}
        <button
          onClick={() => setEditMode(true)}
          className="absolute top-4 right-4 text-gray-500 hover:text-orange-500"
          title="Editar perfil"
        >
          <Pencil size={20} />
        </button>

        {/* Avatar y título */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-orange-600 font-bold">
            {perfil.nombre?.charAt(0)}
            {perfil.apellido?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-orange-600">Mi Perfil</h2>
        </div>

        {/* Datos */}
        <div className="space-y-3">
          <div><b>Nombre:</b> {perfil.nombre}</div>
          <div><b>Apellido:</b> {perfil.apellido}</div>
          <div><b>Teléfono:</b> {perfil.telefono}</div>
          <div><b>Fecha de nacimiento:</b> {perfil.fechaNacimiento}</div>
          <div><b>Email:</b> {perfil.usuario.email}</div>
          <div><b>Usuario:</b> {perfil.usuario.username}</div>
          {dom && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Dirección registrada</h3>
              <div>
                {dom.calle} {dom.numero} ({dom.cp})
              </div>
              <div>
                {dom.localidad?.nombre}, {dom.localidad?.provincia?.nombre},{" "}
                {dom.localidad?.provincia?.pais?.nombre}
              </div>
            </div>
          )}
        </div>

        {msg && (
          <div
            className={`my-4 text-sm ${
              msg.includes("exitosamente") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
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

        {/* Contraseña opcional */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Cambiar Contraseña (opcional)</h3>
          <div>
            <label className="font-medium">Contraseña actual</label>
            <input
              type="password"
              name="passwordActual"
              value={form.passwordActual}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="font-medium">Nueva contraseña</label>
            <input
              type="password"
              name="nuevaPassword"
              value={form.nuevaPassword}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="font-medium">Repetir nueva contraseña</label>
            <input
              type="password"
              name="repetirPassword"
              value={form.repetirPassword}
              onChange={handleChange}
              className="border rounded p-2 w-full"
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
      {msg && (
        <div
          className={`my-4 text-sm ${
            msg.includes("exitosamente") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
