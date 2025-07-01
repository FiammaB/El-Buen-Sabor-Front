import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PerfilPage() {
  const { id, email, telefono, username, role, login, logout } = useAuth();

  const navigate = useNavigate();

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
          apellido: usuario.apellido || "",
          telefono: usuario.telefono || "",
          fechaNacimiento: usuario.fechaNacimiento || "",
        }));
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

      login(id || 0, role, `${form.nombre} ${form.apellido}`, form.email, form.telefono);
      alert("Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error al actualizar perfil", err);
      alert("Error al guardar cambios.");
    }
  };

  if (!email) {
    return <p className="text-center mt-10 text-red-500">Error: no se pudo obtener el email del usuario.</p>;
  }

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <>
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-orange-500 text-white shadow z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/"><h1 className="text-lg font-bold">El Buen Sabor</h1></a>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm">{username}</span>
            <button
              onClick={logout}
              className="bg-white text-orange-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="pt-[88px] flex justify-center px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md mt-6">
          <img
            src="https://tse1.mm.bing.net/th/id/OIP.sD17RVKg5AcsA_hhKAKhiQHaJ7?pid=Api&P=0&h=180"
            alt="Nombre"
            className="size-[60px] rounded-full mb-4 object-cover mx-auto"
          />
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Mi Perfil</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Datos personales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Datos personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                  <input
                    name="telefono"
                    value="2616841853"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Cambiar contraseña */}
            <button
              type="button"
              onClick={() => navigate("/recuperar")}
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              ¿Olvidaste tu contraseña?
            </button>

            {/* Botón */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md transition"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
