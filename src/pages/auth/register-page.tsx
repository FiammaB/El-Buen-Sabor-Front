"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: "",
    general: "",
  })

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

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
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.phone) {
      newErrors.phone = "El teléfono es requerido"
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "El teléfono no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => !error)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors((prev) => ({ ...prev, general: "" }))

    try {
      // Aquí iría la lógica de registro real
      // Por ahora simularemos una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular registro exitoso
      console.log("Registro exitoso:", formData)

      // Guardar datos de usuario
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`)

      // Mostrar mensaje de éxito y redirigir
      alert("¡Registro exitoso! Bienvenido a El Buen Sabor")
      navigate("/")
    } catch (error) {
      console.error("Error en registro:", error)
      setErrors((prev) => ({
        ...prev,
        general: "Error al crear la cuenta. Inténtalo de nuevo.",
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
              <p className="text-gray-600 mt-2">Crea tu cuenta y disfruta de nuestros deliciosos platos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.firstName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="+54 9 123 456 7890"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
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
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.confirmPassword ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                    Acepto los{" "}
                    <button
                      type="button"
                      className="text-orange-600 hover:text-orange-500 font-medium"
                      onClick={() => navigate("/terms")}
                    >
                      términos y condiciones
                    </button>{" "}
                    y la{" "}
                    <button
                      type="button"
                      className="text-orange-600 hover:text-orange-500 font-medium"
                      onClick={() => navigate("/privacy")}
                    >
                      política de privacidad
                    </button>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
