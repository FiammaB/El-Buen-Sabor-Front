import { createContext, useContext, useEffect, useState } from "react";

// Tipos válidos de rol
export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" | null;

// Interface del contexto
interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  username: string | null;
  login: (role: UserRole, username: string) => void;
  logout: () => void;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Al montar: recuperar sesión desde localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (
      storedRole &&
      ["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO"].includes(storedRole) &&
      storedUsername
    ) {
      setRole(storedRole as UserRole);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  // Función para login
  const login = (userRole: UserRole, userName: string) => {
    if (!userRole || !userName) return;
    setIsAuthenticated(true);
    setRole(userRole);
    setUsername(userName);
    localStorage.setItem("role", userRole);
    localStorage.setItem("username", userName);
  };

  // Función para logout
  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}

export { AuthProvider, useAuth };
