// src/pages/cocinero/CocineroAdminLayout.tsx
import { Outlet } from "react-router-dom";
import CocineroSidebar from "./CocineroSidebar.tsx";

export default function CocineroAdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="pt-8 pl-8">
                <CocineroSidebar />
            </div>
            {/* Contenido principal */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
