import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyCodeForm() {
    const navigate = useNavigate();
    const email = localStorage.getItem("email-recuperacion") || "";
    const [codigo, setCodigo] = useState("");
    const [mensaje, setMensaje] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(
                ` http://localhost:8080/api/auth/verificar-codigo?email=${email}&codigo=${codigo}`,
                { method: "POST" }
            );

            if (res.ok) {
                setMensaje("✅ Código válido. Redirigiendo...");
                localStorage.setItem("codigo-recuperacion", codigo);

                setTimeout(() => {
                    navigate("/cambiar-password");
                }, 1000);
            } else {
                setMensaje("❌ Código inválido");
            }
        } catch {
            setMensaje("❌ Error de conexión");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
                        Verificar código
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                                Ingresá el código que recibiste por correo
                            </label>
                            <input
                                id="codigo"
                                name="codigo"
                                type="text"
                                required
                                placeholder="Código de 6 dígitos"
                                className="w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Verificar
                        </button>

                        {mensaje && <p className="text-center text-sm text-gray-700">{mensaje}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}