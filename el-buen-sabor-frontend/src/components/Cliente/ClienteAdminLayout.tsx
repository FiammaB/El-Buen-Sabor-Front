// src/pages/cliente/ClienteAdminLayout.tsx
import { Outlet } from "react-router-dom";
import ClienteSidebar from "./ClienteSidebar";
import ClientePanelHeader from "./ClientePanelHeader";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useAutoLogout} from "../Hooks/useAutoLogout.ts";

export default function ClienteAdminLayout() {
    const { logout } = useAuth();
    useAutoLogout(logout, "cliente");
    return (
        <div className="min-h-screen bg-gray-50">
            <ClientePanelHeader />
            <div className="flex">
                <ClienteSidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
