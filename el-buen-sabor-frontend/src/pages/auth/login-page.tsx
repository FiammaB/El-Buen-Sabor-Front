// pages/LoginPage.tsx
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Iniciar Sesión</h1>
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

            {/* ✅ Nuevo componente */}
            <LoginForm />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">¿Por qué crear una cuenta?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3" /> Realiza pedidos más rápido</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3" /> Guarda tus direcciones favoritas</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3" /> Accede al historial de pedidos</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-3" /> Recibe ofertas exclusivas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
