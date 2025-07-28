import { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" | "DELIVERY" | null;

interface AuthContextType {
    id: number | null;
    isAuthenticated: boolean;
    role: UserRole;
    username: string | null;
    email: string | null;
    telefono: string | null;
    baja: boolean;
    login: (id: number, role: UserRole, username: string, email: string, telefono: string, baja: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [id, setId] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<UserRole>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [telefono, setTelefono] = useState<string | null>(null);
    const [baja, setBaja] = useState<boolean>(false);
    // 🔹 Carga inicial desde localStorage
    useEffect(() => {
        const storedId = localStorage.getItem("id");
        const storedRole = localStorage.getItem("role");
        const storedUsername = localStorage.getItem("username");
        const storedEmail = localStorage.getItem("email");
        const storedTelefono = localStorage.getItem("telefono");
        const storedBaja = localStorage.getItem("baja");
        console.log("Recuperando sesión:", { storedId, storedRole, storedUsername, storedEmail, storedTelefono, storedBaja });

        if (
            storedRole &&
            ["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO", "DELIVERY"].includes(storedRole) &&
            storedUsername
        ) {
            setId(storedId ? Number(storedId) : null);
            setRole(storedRole as UserRole);
            setUsername(storedUsername);
            setEmail(storedEmail);
            setTelefono(storedTelefono);
            setBaja(storedBaja === "true");
            setIsAuthenticated(true);
        } else {
            console.log("No hay sesión válida, limpiando datos");
            logout();
        }
    }, []);

    const login = (userId: number, userRole: UserRole, userName: string, userEmail: string, userTelefono: string, userBaja: boolean) => {
        if (!userRole || !userName) return;
        console.log("LOGIN()", { userId, userRole, userName, userEmail, userTelefono, userBaja });

        setId(userId);
        setIsAuthenticated(true);
        setRole(userRole);
        setUsername(userName);
        setEmail(userEmail);
        setTelefono(userTelefono);
        setBaja(userBaja)
        localStorage.setItem("id", userId.toString());
        localStorage.setItem("role", userRole);
        localStorage.setItem("username", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("telefono", userTelefono);
        localStorage.setItem("baja", userBaja.toString());
    };

    const logout = () => {
        console.log("Cerrando sesión");
        setId(null);
        setIsAuthenticated(false);
        setRole(null);
        setUsername(null);
        setEmail(null);
        setTelefono(null);
        setBaja(false);
        localStorage.removeItem("id");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("telefono");
        localStorage.removeItem("baja");
    };

    return (
        <AuthContext.Provider value={{ id, isAuthenticated, role, username, email, telefono, baja, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    console.log("USE AUTH CONTEXT DATOS", context);
    return context;
}

export { AuthProvider, useAuth };