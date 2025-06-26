"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  })

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors((prev) => ({ ...prev, general: "" }))

    try {
      // Aquí iría la lógica de autenticación real
      // Por ahora simularemos una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simular login exitoso
      console.log("Login exitoso:", formData)

      // Guardar token o datos de usuario en localStorage/context
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", formData.email)

      // Redirigir al usuario
      navigate("/")
    } catch (error) {
      console.error("Error en login:", error)
      setErrors((prev) => ({
        ...prev,
        general: "Error al iniciar sesión. Verifica tus credenciales.",
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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
                  <h1 className="text-xl font-bold text-gray-900">Iniciar Sesión</h1>
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
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido de vuelta!</h2>
                <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{errors.general}</p>
                    </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                            errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                            errors.password ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Tu contraseña"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                        type="button"
                        className="font-medium text-orange-600 hover:text-orange-500"
                        onClick={() => navigate("/forgot-password")}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes una cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="font-medium text-orange-600 hover:text-orange-500"
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">¿Por qué crear una cuenta?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Realiza pedidos más rápido
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Guarda tus direcciones favoritas
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Accede al historial de pedidos
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Recibe ofertas exclusivas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  )
}