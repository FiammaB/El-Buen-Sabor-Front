import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_ORIGIN } from "../../../config/api";

export type UserRole = "ADMINISTRADOR" | "CLIENTE" | "COCINERO" | "CAJERO" | "DELIVERY" | null;

interface AuthContextType {
    id: number | null;
    isAuthenticated: boolean;
    role: UserRole;
    username: string | null;
    email: string | null;
    telefono: string | null;
    baja: boolean;
    // Sucursal donde el empleado eligió trabajar esta sesión (cajero/cocinero/delivery pueden
    // rotar de sucursal entre turnos, así que esto NO es un dato fijo del usuario — se elige
    // después de loguearse y se guarda solo para esta sesión del navegador).
    sucursalId: number | null;
    login: (id: number, role: UserRole, username: string, email: string, telefono: string | null, baja: boolean, token?: string) => void;
    logout: () => void;
    updateAuthData: (data: { telefono?: string; username?: string; email?: string }) => void;
    setSucursalId: (sucursalId: number) => void;
}

// Aplica (o quita) el token en axios y en fetch para que TODAS las llamadas al
// backend lo manden automáticamente, sin tener que tocar cada servicio uno por uno.
let fetchParcheado = false;
function aplicarToken(token: string | null) {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }

    if (!fetchParcheado) {
        fetchParcheado = true;
        const fetchOriginal = window.fetch.bind(window);
        window.fetch = (input, init) => {
            const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
            const esNuestraApi = url.startsWith(API_ORIGIN);
            const tokenActual = localStorage.getItem("token");

            if (esNuestraApi && tokenActual) {
                const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
                if (!headers.has("Authorization")) {
                    headers.set("Authorization", `Bearer ${tokenActual}`);
                }
                return fetchOriginal(input, { ...init, headers });
            }

            return fetchOriginal(input, init);
        };
    }
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
    const [sucursalId, setSucursalIdState] = useState<number | null>(null);

    useEffect(() => {
        const storedId = localStorage.getItem("id");
        const storedRole = localStorage.getItem("role");
        const storedUsername = localStorage.getItem("username");
        const storedEmail = localStorage.getItem("email");
        const storedTelefono = localStorage.getItem("telefono");
        const storedBaja = localStorage.getItem("baja");
        const storedToken = localStorage.getItem("token");
        const storedSucursalId = localStorage.getItem("sucursalId");

        if (storedRole && ["ADMINISTRADOR", "CLIENTE", "COCINERO", "CAJERO", "DELIVERY"].includes(storedRole) && storedUsername) {
            setId(storedId ? Number(storedId) : null);
            setRole(storedRole as UserRole);
            setUsername(storedUsername);
            setEmail(storedEmail);
            setTelefono(storedTelefono);
            setBaja(storedBaja === "true");
            setIsAuthenticated(true);
            if (storedSucursalId) setSucursalIdState(Number(storedSucursalId));
            aplicarToken(storedToken);
        } else {
            aplicarToken(null);
        }
    }, []);

    const setSucursalId = (nuevaSucursalId: number) => {
        setSucursalIdState(nuevaSucursalId);
        localStorage.setItem("sucursalId", nuevaSucursalId.toString());
    };

    const login = (userId: number, userRole: UserRole, userName: string, userEmail: string, userTelefono: string | null, userBaja: boolean, token?: string) => {
        setId(userId);
        setIsAuthenticated(true);
        setRole(userRole);
        setUsername(userName);
        setEmail(userEmail);
        setTelefono(userTelefono);
        setBaja(userBaja);
        localStorage.setItem("id", userId.toString());
        localStorage.setItem("role", userRole);
        localStorage.setItem("username", userName);
        if (userEmail) localStorage.setItem("email", userEmail);
        if (userTelefono) localStorage.setItem("telefono", userTelefono);
        localStorage.setItem("baja", userBaja.toString());
        if (token) {
            localStorage.setItem("token", token);
        }
        // Un login nuevo empieza sin sucursal elegida, aunque la sesión anterior haya dejado una
        // guardada (puede ser otro rol, u otra persona en el mismo navegador).
        setSucursalIdState(null);
        localStorage.removeItem("sucursalId");
        aplicarToken(token ?? null);
    };

    const logout = () => {
        setId(null);
        setIsAuthenticated(false);
        setRole(null);
        setUsername(null);
        setEmail(null);
        setTelefono(null);
        setBaja(false);
        setSucursalIdState(null);
        localStorage.clear();
        aplicarToken(null);
    };

    const updateAuthData = (data: { telefono?: string; username?: string; email?: string }) => {
        if (data.telefono !== undefined) {
            setTelefono(data.telefono);
            localStorage.setItem("telefono", data.telefono);
        }
        if (data.username !== undefined) {
            setUsername(data.username);
            localStorage.setItem("username", data.username);
        }
        if (data.email !== undefined) {
            setEmail(data.email);
            localStorage.setItem("email", data.email);
        }
    };

    return (
        <AuthContext.Provider value={{ id, isAuthenticated, role, username, email, telefono, baja, sucursalId, login, logout, updateAuthData, setSucursalId }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return context;
}

export { AuthProvider, useAuth };