// src/components/Admin/AdminSidebar.tsx
import { useLocation, Link } from "react-router-dom";
import {
  User,
  Users,
  ClipboardList,
  ListOrdered,
  Box,
  BarChart2,
  ShoppingBag,
  Layers,
  FileText,
  Tag
} from "lucide-react";

const navItems = [
  // Implementadas
  { href: "/admin/dashboard", label: "Inicio", icon: <User className="w-5 h-5" /> },
  { href: "/admin/articulos", label: "Artículos Manufacturados ABM", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/admin/ingredientes", label: "Ingredientes ABM", icon: <Box className="w-5 h-5" /> },
  { href: "/admin/categorias-insumo", label: "Categorías Insumo", icon: <Layers className="w-5 h-5" /> },
  { href: "/admin/categorias-manufacturado", label: "Categorías Manufacturado", icon: <Layers className="w-5 h-5" /> },
  { href: "/admin/compra-ingredientes", label: "Compra Ingrediente", icon: <ShoppingBag className="w-5 h-5" /> },
  { href: "/admin/control-stock", label: "Control Stock", icon: <ListOrdered className="w-5 h-5" /> },
  { href: "/admin/ranking-productos", label: "Ranking Productos", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/admin/ranking-clientes", label: "Ranking Clientes", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/admin/clientes", label: "Panel de Clientes", icon: <User className="w-5 h-5" /> },
  { href: "/admin/promociones", label: "Promociones ABM", icon: <Tag className="w-5 h-5" /> },
  { href: "/admin/movimientos-monetarios", label: "Movimientos Monetarios", icon: <FileText className="w-5 h-5" /> },
  { href: "/admin/empleados", label: "Panel de Empleados", icon: <Users className="w-5 h-5" /> },

  // ✅ NUEVO ÍTEM: PEDIDOS ENTREGADOS
  { href: "/admin/pedidos-entregados", label: "Pedidos Entregados", icon: <ClipboardList className="w-5 h-5" /> },

  // No implementadas
  { href: "/admin/registrar-empleado", label: "Registrar Empleado", icon: <Users className="w-5 h-5" /> },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="bg-gray-100 rounded-2xl p-6 min-w-[250px] max-h-[calc(100vh-100px)] shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Panel Admin</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-orange-600 text-white"
                : "text-gray-700 hover:bg-orange-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
