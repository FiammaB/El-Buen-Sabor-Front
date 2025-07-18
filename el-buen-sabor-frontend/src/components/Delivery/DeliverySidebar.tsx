import { NavLink } from "react-router-dom";

const navItems = [
    { href: "/delivery/pedidos", label: "Pedidos para Entregar" },
    { href: "/delivery/perfil", label: "Mi Perfil" }, // ✅ Nuevo botón
];

export default function DeliverySidebar() {
    return (
        <aside className="bg-gray-100 rounded-2xl p-6 min-w-[220px] max-h-[calc(100vh-100px)] shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Panel Delivery</h2>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-blue-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
