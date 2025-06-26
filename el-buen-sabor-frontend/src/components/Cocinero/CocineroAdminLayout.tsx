// src/pages/cocinero/CocineroAdminLayout.tsx
import { Outlet } from "react-router-dom";
import CocineroSidebar from "./CocineroSidebar.tsx";
import CocineroPanelHeader from "./CocineroPanelHeader.tsx";

export default function CocineroAdminLayout() {
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