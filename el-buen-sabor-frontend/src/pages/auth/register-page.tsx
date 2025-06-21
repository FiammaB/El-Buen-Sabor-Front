import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./Context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: "",
    general: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: "",
      general: "",
    };

    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";
    if (!formData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "El email no es válido";
    if (!formData.phone) newErrors.phone = "El teléfono es requerido";
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = "El teléfono no es válido";
    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6) newErrors.password = "Debe tener al menos 6 caracteres";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "No coinciden";
    if (!formData.acceptTerms) newErrors.acceptTerms = "Debes aceptar los términos";

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const payload = {
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email, // ✅ CORREGIDO
        password: formData.password,
        telefono: formData.phone,
        fechaNacimiento: "2000-01-01", // si tenés este campo opcional
      };

      await axios.post("http://localhost:8080/api/auth/register", payload);

      login("CLIENTE", `${formData.firstName} ${formData.lastName}`);
      alert("¡Registro exitoso!");
      navigate("/cliente");
    } catch (error) {
      console.error("Error en registro:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al crear la cuenta. Inténtalo de nuevo.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Crear Cuenta</h1>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-500">El Buen Sabor</div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Únete a nosotros!</h2>
              <p className="text-gray-600 mt-2">
                Crea tu cuenta y disfruta de nuestros deliciosos platos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">Nombre</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded ${errors.firstName ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Ej: Gastón"
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-700">Apellido</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded ${errors.lastName ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Ej: Sisterna"
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-700">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 py-2 border rounded ${errors.email ? "border-red-400" : "border-gray-300"}`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-sm text-gray-700">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 py-2 border rounded ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                    placeholder="+54 9 261..."
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label className="text-sm text-gray-700">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 py-2 border rounded ${errors.password ? "border-red-400" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="text-sm text-gray-700">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 py-2 border rounded ${errors.confirmPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Aceptar términos */}
              <div className="flex items-center">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Acepto los{" "}
                  <button onClick={() => navigate("/terms")} className="text-orange-600 font-medium">términos</button>{" "}
                  y la{" "}
                  <button onClick={() => navigate("/privacy")} className="text-orange-600 font-medium">privacidad</button>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>

              <p className="text-sm text-center text-gray-600">
                ¿Ya tenés una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-orange-600 hover:underline"
                >
                  Iniciá sesión
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
