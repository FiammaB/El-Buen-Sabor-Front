import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Auth/Context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

type RegisterProps = {
  rolDestino?: "CLIENTE" | "COCINERO" | "CAJERO" | "DELIVERY";
  endpoint?: string;
};

export default function RegisterPage(props: RegisterProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // 🧠 Determinamos el rol (por prop o URL ?rol=)
  const rolDestino =
    props.rolDestino ?? searchParams.get("rol")?.toUpperCase() ?? "CLIENTE";

  // 🧠 Endpoint dinámico según rol
  const endpoint =
    props.endpoint ??
    (rolDestino === "COCINERO"
      ? "/api/usuarios/registrar-cocinero"
      : rolDestino === "CAJERO"
        ? "/api/usuarios/registrar-cajero"
        : rolDestino === "DELIVERY"
          ? "/api/usuarios/registrar-delivery"
          : "/api/auth/register");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
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
    dateOfBirth: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      dateOfBirth: "",
      general: "",
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.firstName)) {
      newErrors.firstName =
        "El nombre solo puede contener letras y espacios";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.lastName)) {
      newErrors.lastName =
        "El apellido solo puede contener letras y espacios";
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
    } else if (!/[!@#$%^&*(),.?\":{}|<>_\-+=]/.test(formData.password)) {
      newErrors.password = "Debe contener al menos un símbolo";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "No coinciden";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "La fecha de nacimiento es requerida";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 13) {
        newErrors.dateOfBirth =
          "Debes tener al menos 13 años para registrarte";
      } else if (age > 99) {
        newErrors.dateOfBirth =
          "Tu edad no puede ser mayor a 99 años";
      }
    }

    if (rolDestino === "CLIENTE" && !formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos";
    }

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
        email: formData.email,
        telefono: formData.phone,
        password: formData.password,
        fechaNacimiento: formData.dateOfBirth,
      };

      const res = await axios.post(`http://localhost:8080${endpoint}`, payload, {
        headers: {
          Authorization:
            rolDestino !== "CLIENTE"
              ? `Bearer ${localStorage.getItem("token")}`
              : undefined,
        },
      });

      if (rolDestino === "CLIENTE") {
        const usuario = res.data;
        login(
          usuario.id,
          usuario.rol,
          `${usuario.nombre} ${usuario.apellido}`,
          usuario.email,
          usuario.telefono,
          usuario.baja ?? false // por si no viene
        );

        alert("¡Registro exitoso!");
        navigate("/");
      } else {
        alert(
          rolDestino === "COCINERO"
            ? "Cocinero registrado correctamente"
            : rolDestino === "CAJERO"
              ? "Cajero registrado correctamente"
              : "Delivery registrado correctamente"
        );
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
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
    } finally {
      setIsLoading(false);
    }
  };

  const titulo =
    rolDestino === "CLIENTE"
      ? "Crear Cuenta"
      : `Registrar ${rolDestino.toLowerCase()}`;
  const subtitulo =
    rolDestino === "CLIENTE"
      ? "¡Únete a nosotros!"
      : `Nuevo ${rolDestino.toLowerCase()}`;
  const descripcion =
    rolDestino === "CLIENTE"
      ? "Crea tu cuenta y disfruta de nuestros deliciosos platos"
      : `Completa los datos del nuevo ${rolDestino.toLowerCase()}`;

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
            <div className="text-2xl font-bold text-orange-500">
              El Buen Sabor
            </div>
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
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Fecha nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
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
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Repetir contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Repetir contraseña
                </label>
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
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-2 top-2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

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
                    <span className="text-orange-600 font-medium">términos</span> y la{" "}
                    <span className="text-orange-600 font-medium">privacidad</span>
                  </label>
                </div>
              )}
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}


              {/* Botón enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                {isLoading ? "Registrando..." : "Crear Cuenta"}
              </button>

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

            {rolDestino === "CLIENTE" && (
              <div className="pt-6 border-t border-gray-200 text-center space-y-4">
                <p className="text-sm text-gray-500">O registrate con</p>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const token = credentialResponse.credential;
                      axios
                        .post(
                          "http://localhost:8080/api/auth/google",
                          { token }
                        )
                        .then((res) => {
                          const usuario = res.data;
                          login(
                            usuario.id,
                            usuario.rol,
                            `${usuario.nombre} ${usuario.apellido}`,
                            usuario.email,
                            usuario.telefono,
                            usuario.baja ?? false // por si no viene
                          );

                          alert("¡Login con Google exitoso!");
                          navigate("/cliente");
                        })
                        .catch((err) => {
                          console.error(
                            "❌ Error al loguear con Google",
                            err
                          );
                          alert("Falló el login con Google.");
                        });
                    }}
                    onError={() => {
                      console.log("❌ Falló el login con Google");
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
