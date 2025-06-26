// src/components/Sidebar/CocineroSidebar.tsx
import { useLocation } from "react-router-dom";

const navItems = [
    { href: "/cocinero/pedidos", label: "Pedidos" },
    { href: "/cocinero/productos", label: "Productos" },
    { href: "/cocinero/ingredientes", label: "Ingredientes" },
    { href: "/cocinero/compra-ingredientes", label: "Compra de Ingredientes" },
    { href: "/cocinero/categorias-insumo", label: "Rubros de Igredientes" },
    { href: "/cocinero/categorias-manufacturado", label: "Rubros de Productos" },
    { href: "/cocinero/control-stock", label: "Control de Stock" },
];

export default function CocineroSidebar() {
    const { pathname } = useLocation();

    return (
        <aside className="bg-gray-100 rounded-2xl p-6 min-w-[220px] max-h-[calc(100vh-100px)] shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Panel Cocinero</h2>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pathname === item.href
                                ? "bg-green-600 text-white"
                                : "text-gray-700 hover:bg-green-100"
                        }`}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
