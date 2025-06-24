import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email-recuperacion") || "";
  const codigo = localStorage.getItem("codigo-recuperacion") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmar) {
      setMensaje("❌ Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/cambiar-password?email=${email}&codigo=${codigo}&nuevaPassword=${password}`,
        { method: "POST" }
      );

      if (res.ok) {
        setMensaje("✅ Contraseña actualizada. Redirigiendo al login...");
        setTimeout(() => {
          localStorage.removeItem("email-recuperacion");
          localStorage.removeItem("codigo-recuperacion");
          navigate("/login");
        }, 1500);
      } else {
        setMensaje("❌ Error al actualizar la contraseña");
      }
    } catch {
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Cambiar contraseña
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmar" className="block text-sm font-medium text-gray-700">
                Escribí de nuevo tu contraseña
              </label>
              <input
                id="confirmar"
                name="confirmar"
                type="password"
                required
                className="w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cambiar
            </button>

            {mensaje && <p className="text-center text-sm text-gray-700">{mensaje}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
