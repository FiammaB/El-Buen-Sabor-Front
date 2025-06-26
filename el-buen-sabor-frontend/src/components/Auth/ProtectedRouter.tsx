// src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import React, { type ReactNode } from "react";

// Tipos válidos de roles
type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO";

// Props del componente
interface ProtectedRouteProps {
    children: ReactNode;
    role: UserRole | UserRole[]; // ✅ Soporta uno o varios roles
}

// Componente protegido
export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { isAuthenticated, role: userRole } = useAuth();

    // Mostrar un mensaje mientras se recupera el rol
    if (userRole === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-600 text-lg">Cargando...</p>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar si el usuario tiene un rol permitido
    const isAllowed = Array.isArray(role)
        ? role.includes(userRole)
        : userRole === role;

    // Si el usuario no tiene permiso, redirigir al inicio
    if (!isAllowed) {
        return <Navigate to="/" replace />;
    }

    // ✅ Si todo está OK, renderizar el contenido protegido
    return <>{children}</>;
}