// src/pages/cocinero/CocineroAdminLayout.tsx
import { Outlet } from "react-router-dom";
import CocineroSidebar from "./CocineroSidebar.tsx";
import CocineroPanelHeader from "./CocineroPanelHeader.tsx";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useAutoLogout} from "../Hooks/useAutoLogout.ts";

export default function CocineroAdminLayout() {
    const { logout } = useAuth();
    const horarioApertura = "08:00";
    const horarioCierre = "20:00";
    useAutoLogout(logout, "empleado", horarioApertura, horarioCierre);
    return (
        <div className="min-h-screen bg-gray-50">
            <CocineroPanelHeader />
            <div className="flex">
                <CocineroSidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}