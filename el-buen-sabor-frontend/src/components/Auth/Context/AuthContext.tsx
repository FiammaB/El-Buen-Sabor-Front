import { createContext, useContext, useEffect, useState } from "react";

// Tipos válidos de rol
export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" | "DELIVERY" | null;

// Interface del contexto
interface AuthContextType {
    isAuthenticated: boolean;
    role: UserRole;
    username: string | null;
    email: string | null;
    telefono: string | null;
    login: (role: UserRole, username: string, email: string, telefono: string) => void;
    logout: () => void;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [telefono, setTelefono] = useState<string | null>(null);

    console.log("ENTRA")
    console.log(email)

    // Al montar: recuperar sesión desde localStorage
    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const storedUsername = localStorage.getItem("username");
        const storedEmail = localStorage.getItem("email");
        const storedTelefono = localStorage.getItem("telefono");

        if (
            storedRole &&
            ["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO", "DELIVERY"].includes(storedRole) &&
            storedUsername
        ) {
            setRole(storedRole as UserRole);
            setUsername(storedUsername);
            setEmail(storedEmail);
            setTelefono(storedTelefono);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setRole(null);
            setUsername(null);
            setEmail(null);
            setTelefono(null);
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            localStorage.removeItem("telefono");
        }
    }, []);

    // Función para login
    const login = (userRole: UserRole, userName: string, userEmail: string, userTelefono: string) => {
        if (!userRole || !userName) return;
        setIsAuthenticated(true);
        setRole(userRole);
        setUsername(userName);
        setEmail(userEmail);
        setTelefono(userTelefono);
        localStorage.setItem("role", userRole);
        localStorage.setItem("username", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("telefono", userTelefono);
        console.log("LOGIN()", { userRole, userName, userEmail, userTelefono });
    };


    // Función para logout
    const logout = () => {
        setIsAuthenticated(false);
        setRole(null);
        setUsername(null);
        setEmail(null);
        setTelefono(null);
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("telefono");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, role, username, email, telefono, login, logout }}
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