import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role: string }> = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.rol !== role) return <Navigate to="/" />;

  return <>{children}</>; // Usamos fragmento por si hay más de un hijo
};

export default ProtectedRoute;
