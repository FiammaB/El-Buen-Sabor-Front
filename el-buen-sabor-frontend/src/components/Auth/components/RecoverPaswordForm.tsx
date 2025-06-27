import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail } from "lucide-react";

export default function RecoverPasswordForm() {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:8080/api/auth/recuperar?email=${email}`);
            setMensaje("📩 Código enviado al correo");

            // Guardar el email para usarlo en la próxima pantalla
            localStorage.setItem("email-recuperacion", email);

            // Redirigir luego de 1 segundo
            setTimeout(() => {
                navigate("/verificar-codigo");
            }, 1000);
        } catch (error) {
            setMensaje("❌ Error: no se pudo enviar el código");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
                        Recuperar contraseña
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Ingresá tu correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Enviar código
                        </button>

                        {mensaje && <p className="text-center text-sm text-gray-700">{mensaje}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}