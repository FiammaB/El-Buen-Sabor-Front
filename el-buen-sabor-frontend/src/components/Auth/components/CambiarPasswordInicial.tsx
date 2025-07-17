import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function CambiarPasswordInicial() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email-cambio-inicial") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  useEffect(() => {
    // ✅ Solo alerta si no hay email y no se ha actualizado correctamente
    if (!email && !mensaje.startsWith("✅")) {
      alert("No hay un email válido para cambiar contraseña.");
      navigate("/login");
      return;
    }
  }, [email, navigate, mensaje]);

  const validarPassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmar) {
      setMensaje("❌ Las contraseñas no coinciden");
      return;
    }

    if (!validarPassword(password)) {
      setMensaje(
        "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo."
      );
      return;
    }

    setCargando(true);
    try {
      await axios.post(
        `http://localhost:8080/api/auth/cambiar-password-inicial`,
        null,
        {
          params: {
            email: email,
            nuevaPassword: password,
          },
        }
      );

      setMensaje("✅ Contraseña actualizada. Redirigiendo...");
      localStorage.removeItem("email-cambio-inicial");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);
      setMensaje("❌ Error al cambiar la contraseña. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">
        Cambiar contraseña inicial
      </h2>

      {mensaje && (
        <div className="mb-4 text-center text-sm">
          <p
            className={
              mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
            }
          >
            {mensaje}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nueva contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowConfirmar(!showConfirmar)}
              className="absolute right-3 top-2.5"
            >
              {showConfirmar ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
