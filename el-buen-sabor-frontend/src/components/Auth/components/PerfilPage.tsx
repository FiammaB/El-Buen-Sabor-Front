import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext"; // ✅ correcto

export default function PerfilPage() {
  const { email, telefono, username, role, login } = useAuth(); // accedemos a todo lo necesario

  const [form, setForm] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (email) {
      axios
        .get(`/api/usuarios/perfil/${email}`)
        .then((res) => {
          const usuario = res.data.usuario;
          setForm({
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar perfil", err);
          setLoading(false);
        });
    }
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .put(`/api/usuarios/perfil/${email}`, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
      })
      .then(() => {
        // ✅ Actualizar contexto
        login(role, form.nombre + " " + form.apellido, form.email, form.telefono);
        alert("Perfil actualizado correctamente");
      })
      .catch((err) => {
        console.error("Error al actualizar perfil", err);
        alert("Error al guardar cambios");
      });
  };

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
              value={form.apellido}
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
