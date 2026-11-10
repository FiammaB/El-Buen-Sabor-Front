import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { API_ORIGIN } from "../../../config/api";

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email-recuperacion") || "";
  const codigo = localStorage.getItem("codigo-recuperacion") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  // 👁️ Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  // 🔐 Validación básica de contraseña segura
  const esPasswordSegura = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) && // al menos una mayúscula
      /[a-z]/.test(password) && // al menos una minúscula
      /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password) // al menos un símbolo
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmar) {
      setMensaje("❌ Las contraseñas no coinciden");
      return;
    }

    if (!esPasswordSegura(password)) {
      setMensaje(
        "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo"
      );
      return;
    }

    try {
      const res = await fetch(
        `${API_ORIGIN}/api/auth/cambiar-password?email=${email}&codigo=${codigo}&nuevaPassword=${encodeURIComponent(
          password
        )}`,
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
        const text = await res.text();
        setMensaje(`❌ ${text}`);
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
            {/* Nueva Contraseña */}
            <div className="space-y-2 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2 relative">
              <label
                htmlFor="confirmar"
                className="block text-sm font-medium text-gray-700"
              >
                Escribí de nuevo tu contraseña
              </label>
              <input
                id="confirmar"
                name="confirmar"
                type={showConfirmar ? "text" : "password"}
                required
                className="w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-9"
              >
                {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cambiar
            </button>

            {mensaje && (
              <p className="text-center text-sm text-gray-700">{mensaje}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
