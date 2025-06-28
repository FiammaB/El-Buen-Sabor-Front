import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminPanelHeader from "./AdminPanelHeader";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminPanelHeader />
            <div className="flex flex-1 gap-6 px-8 py-4">
                <AdminSidebar />
                <main className="flex-1 bg-white rounded-2xl shadow-md p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
