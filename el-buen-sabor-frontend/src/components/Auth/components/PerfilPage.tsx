import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Importar iconos para mostrar/ocultar contraseña

export default function PerfilPage() {
  // Renombrar 'email' a 'userEmail' para evitar conflicto con 'form.email'
  const { id, email: userEmail, username, role, login, logout } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    passwordActual: "",
    nuevaPassword: "",
    repetirPassword: "",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    passwordActual: "",
    nuevaPassword: "",
    repetirPassword: "",
    general: "", // Para errores generales del servidor o del formulario
  });

  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false); // Para mostrar/ocultar campos de cambio de contraseña
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showRepetirPassword, setShowRepetirPassword] = useState(false);

  // Efecto para cargar los datos del perfil al inicio
  useEffect(() => {
    if (userEmail) {
      axios
        .get(`http://localhost:8080/api/usuarios/perfil/${userEmail}`)
        .then((res) => {
          const usuario = res.data.usuario;
          const cliente = res.data.cliente; // Asumiendo que el backend envía también datos del cliente

          setForm((prev) => ({
            ...prev,
            // Ajusta según tu estructura de respuesta del backend para nombre, apellido, telefono
            // Es crucial que 'res.data.usuario' o 'res.data.cliente' contengan estos campos
            nombre: usuario?.nombre || cliente?.nombre || "",
            apellido: usuario?.apellido || cliente?.apellido || "",
            telefono: usuario?.telefono || cliente?.telefono || "",
            // Formatear fechaNacimiento a YYYY-MM-DD para input[type="date"]
            fechaNacimiento: cliente?.fechaNacimiento ? new Date(cliente.fechaNacimiento).toISOString().split('T')[0] : "",
          }));
        })
        .catch((err) => {
          console.error("Error al cargar perfil:", err);
          setErrors(prev => ({ ...prev, general: "Error al cargar los datos del perfil." }));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setErrors(prev => ({ ...prev, general: "No se pudo obtener el email del usuario para cargar el perfil." }));
    }
  }, [userEmail]); // Dependencia userEmail

  // Manejador genérico de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" })); // Limpiar error específico y general al cambiar el campo
  };

  // Función de validación del formulario frontend
  const validateForm = () => {
    const newErrors = {
      nombre: "",
      apellido: "",
      telefono: "",
      fechaNacimiento: "",
      passwordActual: "",
      nuevaPassword: "",
      repetirPassword: "",
      general: "",
    };

    // Validación de Nombre
    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.nombre)) {
      newErrors.nombre = "El nombre solo puede contener letras y espacios";
    }

    // Validación de Apellido
    if (!form.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(form.apellido)) {
      newErrors.apellido = "El apellido solo puede contener letras y espacios";
    }

    // Validación de Teléfono
    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\+?[\d\s-()]+$/.test(form.telefono)) {
      newErrors.telefono = "El teléfono no es válido. Solo se permiten números, espacios, guiones y paréntesis.";
    }

    // Validación de Fecha de Nacimiento y Edad
    if (!form.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
    } else {
      const today = new Date();
      const birthDate = new Date(form.fechaNacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 13) {
        newErrors.fechaNacimiento = "Debes tener al menos 13 años";
      } else if (age > 99) {
        newErrors.fechaNacimiento = "Tu edad no puede ser mayor a 99 años";
      }
    }

    // Validaciones de Contraseña (condicionales)
    if (showPasswordFields) { // Solo si el usuario decidió cambiar la contraseña
      if (!form.passwordActual) {
        newErrors.passwordActual = "La contraseña actual es requerida para cambiarla";
      }

      if (!form.nuevaPassword) {
        newErrors.nuevaPassword = "La nueva contraseña es requerida";
      } else if (form.nuevaPassword.length < 8) {
        newErrors.nuevaPassword = "Debe tener al menos 8 caracteres";
      } else if (!/[A-Z]/.test(form.nuevaPassword)) {
        newErrors.nuevaPassword = "Debe contener al menos una letra mayúscula";
      } else if (!/[a-z]/.test(form.nuevaPassword)) {
        newErrors.nuevaPassword = "Debe contener al menos una letra minúscula";
      } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.nuevaPassword)) {
        newErrors.nuevaPassword = "Debe contener al menos un símbolo";
      }

      if (!form.repetirPassword) {
        newErrors.repetirPassword = "Confirma tu nueva contraseña";
      } else if (form.nuevaPassword !== form.repetirPassword) {
        newErrors.repetirPassword = "Las nuevas contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    // Retorna true si todos los campos de newErrors están vacíos
    return Object.values(newErrors).every((error) => !error);
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Ejecutar validación del frontend
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, general: "Por favor, corrige los errores del formulario." }));
      return;
    }

    try {
      // 2. Preparar el payload: solo envía campos que el usuario intentó cambiar o que son obligatorios
      const payload: any = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        fechaNacimiento: form.fechaNacimiento,
      };

      if (showPasswordFields) {
        payload.passwordActual = form.passwordActual;
        payload.nuevaPassword = form.nuevaPassword;
        payload.repetirPassword = form.repetirPassword;
      }

      // 3. Envío al backend (usando el ID del cliente)
      // Ajusta la URL si tu endpoint de actualización es diferente
      const res = await axios.put(`http://localhost:8080/api/clientes/${id}/perfil`, payload);

      // 4. Actualizar contexto de autenticación si es necesario (ej: nombre/apellido cambiaron)
      // Asegúrate de que los parámetros de login coincidan con los de tu AuthContext
      login(id || 0, role, `${form.nombre} ${form.apellido}`, userEmail || "", form.telefono);

      alert("Perfil actualizado correctamente.");
      // Limpiar todos los errores al éxito y resetear campos de contraseña
      setErrors({
        nombre: "", apellido: "", telefono: "", fechaNacimiento: "",
        passwordActual: "", nuevaPassword: "", repetirPassword: "", general: ""
      });
      if (showPasswordFields) {
        setShowPasswordFields(false); // Ocultar campos de contraseña después de cambio exitoso
        setForm(prev => ({ ...prev, passwordActual: "", nuevaPassword: "", repetirPassword: "" })); // Limpiar campos de contraseña
      }

    } catch (err: any) {
      console.error("Error al actualizar perfil", err);
      // 5. Manejo de errores del backend
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const backendErrors = err.response.data; // Esto será el Map<String, String> del backend

        // Si el backend devuelve errores de validación específicos por campo
        if (typeof backendErrors === 'object' && backendErrors !== null && !Array.isArray(backendErrors)) {
          setErrors((prev) => ({
            ...prev,
            ...backendErrors, // Fusionar errores de backend con el estado de errores
            general: backendErrors.general || "Error al actualizar perfil. Por favor, revisa los datos.", // Mensaje general si backend envía uno o fallback
          }));
        } else if (typeof backendErrors === 'string') {
          setErrors(prev => ({ ...prev, general: backendErrors })); // Si el backend devuelve un string de error general
        } else {
          setErrors(prev => ({ ...prev, general: "Error desconocido al actualizar perfil." }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: "Error de red o servidor no disponible." }));
      }
    }
  };

  // Manejo de estado de carga y error inicial
  if (!userEmail) {
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
            alt="Avatar de usuario"
            className="size-[60px] rounded-full mb-4 object-cover mx-auto"
          />
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Mi Perfil</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mensaje de error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Datos personales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Datos personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={userEmail || ""} // Muestra el email del contexto, ya que el campo está deshabilitado
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700"
                  />
                  {/* No hay error para email aquí ya que está deshabilitado, si fuera editable, se agregaría errors.email */}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                  <input
                    name="telefono"
                    type="text"
                    value={form.telefono}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.telefono && <p className="text-sm text-red-600 mt-1">{errors.telefono}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Apellido</label>
                  <input
                    name="apellido"
                    type="text"
                    value={form.apellido}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.apellido && <p className="text-sm text-red-600 mt-1">{errors.apellido}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Fecha de Nacimiento</label>
                  <input
                    name="fechaNacimiento"
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.fechaNacimiento && <p className="text-sm text-red-600 mt-1">{errors.fechaNacimiento}</p>}
                </div>
              </div>
            </div>

            {/* Sección de cambio de contraseña */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Cambiar Contraseña</h3>
              {!showPasswordFields ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Quiero cambiar mi contraseña
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        name="passwordActual"
                        type={showPasswordActual ? "text" : "password"}
                        value={form.passwordActual}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.passwordActual ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordActual(!showPasswordActual)}
                        className="absolute right-2 top-2"
                      >
                        {showPasswordActual ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.passwordActual && <p className="text-sm text-red-600 mt-1">{errors.passwordActual}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        name="nuevaPassword"
                        type={showNuevaPassword ? "text" : "password"}
                        value={form.nuevaPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.nuevaPassword ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                        className="absolute right-2 top-2"
                      >
                        {showNuevaPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.nuevaPassword && <p className="text-sm text-red-600 mt-1">{errors.nuevaPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Repetir Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        name="repetirPassword"
                        type={showRepetirPassword ? "text" : "password"}
                        value={form.repetirPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.repetirPassword ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRepetirPassword(!showRepetirPassword)}
                        className="absolute right-2 top-2"
                      >
                        {showRepetirPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.repetirPassword && <p className="text-sm text-red-600 mt-1">{errors.repetirPassword}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setForm(prev => ({ ...prev, passwordActual: "", nuevaPassword: "", repetirPassword: "" })); // Limpiar campos al cancelar
                      setErrors(prev => ({ ...prev, passwordActual: "", nuevaPassword: "", repetirPassword: "" })); // Limpiar errores al cancelar
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500 mt-2"
                  >
                    Cancelar cambio de contraseña
                  </button>
                </div>
              )}
            </div>

            {/* Nota sobre la contraseña olvidada: este enlace te llevará fuera del formulario de edición. */}
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