import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

export default function PerfilPage() {
  const { id, email, telefono, username, role, login } = useAuth();
  console.log(email,telefono,username,role,login)

  const [form, setForm] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",

    passwordActual: "",
    nuevaPassword: "",
    repetirPassword: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {


    axios
      .get(`http://localhost:8080/api/usuarios/perfil/${email}`)
      .then((res) => {
        const usuario = res.data.usuario;

        setForm((prev) => ({
          ...prev,
          id: usuario.id,
          email: usuario.email || "",
          nombre: usuario.nombre || "",
          telefono: usuario.telefono || "",
          fechaNacimiento: usuario.fechaNacimiento || "",
        }));

        console.log("USER ID:", usuario.id)
      })
      .catch((err) => {
        console.error("Error al cargar perfil:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:8080/api/usuarios/perfil/cliente/${email}`, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        fechaNacimiento: form.fechaNacimiento,
        passwordActual: form.passwordActual,
        nuevaPassword: form.nuevaPassword,
        repetirPassword: form.repetirPassword,
      });

      login(id ? id : 0, role, `${form.nombre} ${form.apellido}`, form.email, form.telefono);
      alert("Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error al actualizar perfil", err);
      alert("Error al guardar cambios.");
    }
  };

  if (!email) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error: no se pudo obtener el email del usuario.
      </p>
    );
  }

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold text-center mb-4">Mi Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              name="email"
              value={form.email}
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Apellido</label>
            <input
              name="apellido"
              value={username || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Contraseña actual</label>
            <input
              type="password"
              name="passwordActual"
              value={form.passwordActual}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Nueva contraseña</label>
            <input
              type="password"
              name="nuevaPassword"
              value={form.nuevaPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Repetir nueva contraseña</label>
            <input
              type="password"
              name="repetirPassword"
              value={form.repetirPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
