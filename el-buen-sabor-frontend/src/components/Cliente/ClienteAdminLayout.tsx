// src/pages/cliente/ClienteAdminLayout.tsx
import { Outlet } from "react-router-dom";
import ClienteSidebar from "./ClienteSidebar";
import ClientePanelHeader from "./ClientePanelHeader";

export default function ClienteAdminLayout() {
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
