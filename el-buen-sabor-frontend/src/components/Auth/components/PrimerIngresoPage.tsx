import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PrimerIngresoPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email-primer-ingreso") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  const validarPassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarPassword(password)) {
      setMensaje("❌ La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo.");
      return;
    }

    if (password !== confirmar) {
      setMensaje("❌ Las contraseñas no coinciden.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/cambiar-password-primer-ingreso", {
        email,
        nuevaPassword: password,
      });

      setMensaje("✅ Contraseña actualizada. Redirigiendo...");
      setTimeout(() => {
        localStorage.removeItem("email-primer-ingreso");
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al cambiar la contraseña.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Crear nueva contraseña</h2>

        {mensaje && <p className="text-center text-sm text-red-600">{mensaje}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
          <input
            type="password"
            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-orange-600"
        >
          Guardar nueva contraseña
        </button>
      </form>
    </div>
  );
}
