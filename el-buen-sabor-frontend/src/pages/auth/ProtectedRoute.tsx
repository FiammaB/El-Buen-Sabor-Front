// src/components/ProtectedRoute.tsx

import { useAuth } from "./Context/AuthContext";
import { Navigate } from "react-router-dom";
import React, { type ReactNode } from "react";

// Tipos válidos de roles
type UserRole = "ADMINISTRADOR" | "CLIENTE";

// Props del componente
interface ProtectedRouteProps {
    children: ReactNode;
    role: UserRole;
}

// Componente protegido
export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { isAuthenticated, role: userRole } = useAuth();

    // Esperar a que se recupere el rol (evita redirección prematura)
    if (!isAuthenticated || userRole === null) {
        return null; // Podés mostrar un loader si querés
    }

    // Redirigir si el usuario no tiene el rol requerido
    if (userRole !== role) {
        return <Navigate to="/" replace />;
    }

    // Mostrar contenido protegido
    return <>{children}</>;
}