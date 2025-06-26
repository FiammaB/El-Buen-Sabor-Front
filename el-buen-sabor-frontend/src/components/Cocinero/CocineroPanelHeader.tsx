// src/components/Header/CocineroPanelHeader.tsx
import { useAuth } from "../../pages/auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function CocineroPanelHeader() {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y Botón Inicio */}
                    <div className="flex items-center space-x-4">
                        <div
                            className="text-2xl font-bold text-orange-500 cursor-pointer"
                            onClick={() => navigate("/landing")}
                        >
                            El Buen Sabor
                        </div>
                        <button
                            className="text-gray-700 hover:text-orange-500 transition font-medium"
                            onClick={() => navigate("/landing")}
                        >
                            Inicio
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <span className="text-green-700 font-bold">Cocinero: {username}</span>
                        <button
                            onClick={() => {
                                logout();
                                navigate("/landing");
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Cerrar Sesión
                        </button>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-4">
                            <button
                                className="text-gray-700 hover:text-orange-500 transition font-medium text-left"
                                onClick={() => {
                                    navigate("/landing");
                                    setIsMenuOpen(false);
                                }}
                            >
                                Inicio
                            </button>
                            <span className="text-green-700 font-bold">{username}</span>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsMenuOpen(false);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}