import { createContext, useContext, useEffect, useState } from "react";

// Tipos válidos de rol
export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" | "DELIVERY" | null;

// Interface del contexto
interface AuthContextType {
    id: number | null;
    isAuthenticated: boolean;
    role: UserRole;
    username: string | null;
    email: string | null;
    telefono: string | null;
    login: (id: number, role: UserRole, username: string, email: string, telefono: string) => void;
    logout: () => void;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [id, setId] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [telefono, setTelefono] = useState<string | null>(null);

    console.log("ENTRA")
    console.log(email)

    // Al montar: recuperar sesión desde localStorage
    useEffect(() => {
        console.log("Local str id:", localStorage.getItem("role"))
        const storedId = localStorage.getItem("id");
        const storedRole = localStorage.getItem("role");
        const storedUsername = localStorage.getItem("username");
        const storedEmail = localStorage.getItem("email");
        const storedTelefono = localStorage.getItem("telefono");

        if (
            storedId &&
            storedRole &&
            ["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO", "DELIVERY"].includes(storedRole) &&
            storedUsername
        ) {
            setId(storedId ? Number(storedId) : null)
            setRole(storedRole as UserRole);
            setUsername(storedUsername);
            setEmail(storedEmail);
            setTelefono(storedTelefono);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setId(null)
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
    const login = (userId: number, userRole: UserRole, userName: string, userEmail: string, userTelefono: string) => {
        if (!userRole || !userName) return;
        setId(userId)
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
        setId(null);
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
            value={{ id, isAuthenticated, role, username, email, telefono, login, logout }}
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
    console.log("USE AUTH CONTEXT DATOS", context)
    return context;
}

export { AuthProvider, useAuth };