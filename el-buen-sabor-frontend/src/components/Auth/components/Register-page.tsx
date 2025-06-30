import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Auth/Context/AuthContext";

// Tipado opcional que puede venir como props
type RegisterProps = {
  rolDestino?: "CLIENTE" | "COCINERO" | "CAJERO";
  endpoint?: string;
};

export default function RegisterPage(props: RegisterProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams(); // ⬅️ Para leer el parámetro ?rol= desde la URL

  // 🧠 Determinamos el rol según prop o parámetro de URL (fallback: CLIENTE)
  const rolDestino = props.rolDestino ?? searchParams.get("rol")?.toUpperCase() ?? "CLIENTE";

  // 🧠 Definimos el endpoint según el rol o prop
  const endpoint =
    props.endpoint ??
    (rolDestino === "COCINERO"
      ? "/api/usuarios/registrar-cocinero"
      : rolDestino === "CAJERO"
        ? "/api/usuarios/registrar-cajero"
        : "/api/auth/register");

  // Formulario y errores
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 Manejo de campos del formulario
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Validación de datos antes de enviar
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (!formData.phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "El teléfono no es válido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Debe contener al menos una letra mayúscula";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Debe contener al menos una letra minúscula";
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(formData.password)) {
      newErrors.password = "Debe contener al menos un símbolo";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "No coinciden";
    }
    if (rolDestino === "CLIENTE" && !formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos";
    }
    if (rolDestino === "CLIENTE" && !formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  // 🚀 Registro en backend
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const payload = {
        nombre: formData.firstName,
        apellido: formData.lastName,
        email: formData.email,
        telefono: formData.phone,
        password: formData.password,
        fechaNacimiento: "2000-01-01", // 🔒 Por ahora fijo
      };

      const res = await axios.post(`http://localhost:8080${endpoint}`, payload, {
        headers: {
          Authorization: rolDestino !== "CLIENTE"
            ? `Bearer ${localStorage.getItem("token")}`
            : undefined,
        },
      });

      if (rolDestino === "CLIENTE") {
        const usuario = res.data;

        login(
          usuario.id,                          // 🆔 ID que devuelve el backend
          usuario.rol,                         // 🎭 Rol ("CLIENTE")
          `${usuario.nombre} ${usuario.apellido}`, // 🧑 Nombre completo
          usuario.email,
          usuario.telefono
        );

        alert("¡Registro exitoso!");
        navigate("/cliente");
      }
      else {
        alert(`${rolDestino === "COCINERO" ? "Cocinero" : "Cajero"} registrado correctamente`);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          acceptTerms: false,
        });
      }
    } catch (error: any) {
      console.error("Error en registro:", error);

      const mensaje = error?.response?.data?.error;

      if (typeof mensaje === "string") {
        if (mensaje.includes("email")) {
          setErrors((prev) => ({ ...prev, email: mensaje }));
        } else if (mensaje.includes("contraseña")) {
          setErrors((prev) => ({ ...prev, password: mensaje }));
        } else {
          setErrors((prev) => ({ ...prev, general: mensaje }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: `Error al registrar ${rolDestino.toLowerCase()}`,
        }));
      }
    }

  };

  // 🖼️ Textos dinámicos por rol
  const titulo = rolDestino === "CLIENTE" ? "Crear Cuenta" : `Registrar ${rolDestino.toLowerCase()}`;
  const subtitulo = rolDestino === "CLIENTE" ? "¡Únete a nosotros!" : `Nuevo ${rolDestino.toLowerCase()}`;
  const descripcion =
    rolDestino === "CLIENTE"
      ? "Crea tu cuenta y disfruta de nuestros deliciosos platos"
      : `Completa los datos del nuevo ${rolDestino.toLowerCase()}`;

  // 🎨 Render del formulario
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
              <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
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
              <h2 className="text-2xl font-bold text-gray-900">{subtitulo}</h2>
              <p className="text-gray-600 mt-2">{descripcion}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 🛑 Error general */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              {/* 👤 Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
              </div>

              {/* 👤 Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
              </div>

              {/* ✉️ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* 📞 Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* 🔒 Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* 🔁 Repetir contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Repetir contraseña</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* ✅ Checkbox solo para clientes */}
              {rolDestino === "CLIENTE" && (
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
              )}
              {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

              {/* 🧡 Botón enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                {isLoading ? "Registrando..." : "Crear Cuenta"}
              </button>

              {/* 🔐 Link a login para clientes */}
              {rolDestino === "CLIENTE" && (
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
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
