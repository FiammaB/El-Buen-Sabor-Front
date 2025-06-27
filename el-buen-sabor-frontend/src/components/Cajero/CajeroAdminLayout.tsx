// src/pages/cajero/CajeroAdminLayout.tsx
import { Outlet } from "react-router-dom";
import CajeroSidebar from "./CajeroSidebar";
import CajeroPanelHeader from "./CajeroPanelHeader";

export default function CajeroAdminLayout() {
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
