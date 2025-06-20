import { createContext, useContext, useEffect, useState } from "react";

// Roles válidos
export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" |null;

// Interface del contexto
interface AuthContextType {
    isAuthenticated: boolean;
    role: UserRole;
    username: string | null;
    login: (role: UserRole, username: string) => void;
    logout: () => void;
}

// Contexto (sin valor inicial)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role") as UserRole;
        const storedUsername = localStorage.getItem("username");

        if (storedRole && storedUsername) {
            setRole(storedRole);
            setUsername(storedUsername);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (userRole: UserRole, username: string) => {
        setIsAuthenticated(true);
        setRole(userRole);
        setUsername(username);
        localStorage.setItem("role", userRole || "");
        localStorage.setItem("username", username);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setRole(null);
        setUsername(null);
        localStorage.removeItem("role");
        localStorage.removeItem("username");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    return context;
}

// ✅ Exports nombrados (Vite-friendly)
export { AuthProvider, useAuth };