import { useAuth } from "../../components/Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";

// 🛠 Panel principal del administrador
export default function AdminDashboard() {
  const { role, logout } = useAuth();     // Obtenemos el rol actual y función para cerrar sesión
  const navigate = useNavigate();         // Hook para navegación programática

  // 🚫 Verificación de rol: solo ADMINISTRADOR puede entrar
  if (role !== "ADMINISTRADOR") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Acceso denegado 🚫</h2>
        <p className="text-gray-600 mt-4">No tenés permisos para ver esta sección.</p>
      </div>
    );
  }

  // ✅ Render del dashboard
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-orange-600 mb-6">Panel del Administrador 🛠</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 📝 Gestión de productos */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">📝 Gestionar Productos</h3>
          <p className="text-sm text-gray-600 mb-4">Agregar, editar o eliminar artículos.</p>
          <button
            onClick={() => navigate("/admin/articulos")}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Ir a Artículos
          </button>
        </div>

        {/* 📊 Estadísticas */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">📊 Ver Estadísticas</h3>
          <p className="text-sm text-gray-600 mb-4">Revisar pedidos, ventas y más.</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/ranking-productos")}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600  w-full"
            >
              Ranking de Productos
            </button>
            <button
              onClick={() => navigate("/admin/ranking-clientes")}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600  w-full"
            >
              Ranking de Clientes
            </button>
          </div>
        </div>

        {/* 🎉 Promociones */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">🎉 Crear Promociones</h3>
          <p className="text-sm text-gray-600 mb-4">Agregá nuevas promociones para mostrar a los clientes.</p>
          <button
            onClick={() => navigate("/admin/promociones")}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Promociónes ABM
          </button>
        </div>

        {/* 💰 Movimiento Monetario */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">Movimientos Monetarios </h3>
          <p className="text-sm text-gray-600 mb-4">Administrar movimientos monetarios.</p>
          <button
            onClick={() => navigate("/admin/movimientos-monetarios")}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Movimientos Monetarios
          </button>
        </div>



        {/*
        {/* 👥 Registro de empleados */}

        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">👥 Registrar Empleado</h3>
          <p className="text-sm text-gray-600 mb-4">Crear cuentas para cocineros o cajeros.</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/registrar-empleado")}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
            >
              Registrar Empleado 👨‍🍳
            </button>

          </div>
        </div>


        {/* 🚪 Cerrar sesión */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:border-orange-300">
          <h3 className="text-lg font-bold mb-2">🚪 Cerrar Sesión</h3>
          <p className="text-sm text-gray-600 mb-4">Cerrar sesión de administrador.</p>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div >
  );
}
