import { useLocation } from "react-router-dom";

const navItems = [
  { href: "/admin/articulos", label: "Crear Artículos" },
  { href: "/admin/ingredientes", label: "Crear Ingredientes" },
];

export default function SideBar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="bg-gray-100 rounded-2xl p-6 min-w-[250px] max-h-[calc(100vh-100px)] shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Panel</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-blue-100"
              }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
