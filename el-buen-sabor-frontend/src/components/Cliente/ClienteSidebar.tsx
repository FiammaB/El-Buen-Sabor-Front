// src/pages/cliente/ClienteSidebar.tsx
import { useLocation } from "react-router-dom";

const navItems = [
    { href: "/cliente/pedidos", label: "Mis Pedidos" },


];

export default function ClienteSidebar() {
    const { pathname } = useLocation();

    return (
        <aside className="bg-gray-100 rounded-2xl p-6 min-w-[220px] max-h-[calc(100vh-100px)] shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Panel Cliente</h2>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pathname === item.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-blue-100"
                        }`}
                    >
                        {item.label}
                    </a>
                ))}

                {/* ✅ Botón de perfil */}
                <a
                    href="/cliente/perfil"
                    className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === "/cliente/perfil"
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-green-100"
                    }`}
                >
                    👤 Mi Perfil
                </a>
            </nav>
        </aside>
    );
}
