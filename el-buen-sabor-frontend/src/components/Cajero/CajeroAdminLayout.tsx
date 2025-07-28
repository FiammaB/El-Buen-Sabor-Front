// src/pages/cajero/CajeroAdminLayout.tsx
import { Outlet } from "react-router-dom";
import CajeroSidebar from "./CajeroSidebar";
import CajeroPanelHeader from "./CajeroPanelHeader";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useAutoLogout} from "../Hooks/useAutoLogout.ts";

export default function CajeroAdminLayout() {
    const { logout } = useAuth();
    const horarioApertura = "08:00";
    const horarioCierre = "20:00";
    useAutoLogout(logout, "empleado", horarioApertura, horarioCierre);
    return (
        <div className="min-h-screen bg-gray-50">
            <CajeroPanelHeader />
            <div className="flex">
                <CajeroSidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
