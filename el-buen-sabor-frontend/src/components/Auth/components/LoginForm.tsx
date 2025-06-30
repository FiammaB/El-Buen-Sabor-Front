import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.tsx";

type LoginFormProps = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };

    if (!formData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "El email no es válido";

    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6) newErrors.password = "Debe tener al menos 6 caracteres";

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const {
        id,
        rol,
        nombre = "",
        apellido = "",
        email: userEmail,
        telefono = "",
      } = res.data;

      if (!rol || !userEmail) {
        console.error("❌ Datos de respuesta inválidos:", res.data);
        setErrors((prev) => ({
          ...prev,
          general: "Error inesperado al iniciar sesión.",
        }));
        return;
      }

      const fullName = `${apellido}`.trim();
      login(id, rol, fullName || "Sin Nombre", userEmail, telefono);

      if (onSuccess) {
        onSuccess();
      } else {
        switch (rol) {
          case "ADMINISTRADOR":
            navigate("/admin");
            break;
          case "CLIENTE":
            navigate("/cliente");
            break;
          case "COCINERO":
            navigate("/cocinero");
            break;
          case "CAJERO":
            navigate("/cajero");
            break;
          case "DELIVERY":
            navigate("/delivery");
            break;
          default:
            navigate("/");
        }
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al iniciar sesión. Verifica tus credenciales.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            className={`w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
              errors.password ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="absolute right-3 top-3.5"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-900">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded"
          />
          Recordarme
        </label>
        <button
          type="button"
          onClick={() => navigate("/recuperar")}
          className="text-sm font-medium text-orange-600 hover:text-orange-500"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      <p className="text-sm text-center text-gray-600">
        ¿No tienes una cuenta?{" "}
        <button
          onClick={() => navigate("/register")}
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Regístrate aquí
        </button>
      </p>
    </form>
  );
}
