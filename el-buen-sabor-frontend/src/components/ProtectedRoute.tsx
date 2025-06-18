import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import React, { type ReactNode } from "react";


type ProtectedRouteProps = {
  children: ReactNode;
  role: string;
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userRole !== role) return <Navigate to="/" />;

  return <>{children}</>;
}
