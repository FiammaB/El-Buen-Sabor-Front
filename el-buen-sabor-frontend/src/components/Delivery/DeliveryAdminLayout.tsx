import { Outlet } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";
import DeliveryPanelHeader from "./DeliveryPanelHeader";
import {useAuth} from "../Auth/Context/AuthContext.tsx";
import {useAutoLogout} from "../Hooks/useAutoLogout.ts";

export default function DeliveryAdminLayout() {
    const { logout } = useAuth();
    const horarioApertura = "08:00";
    const horarioCierre = "20:00";
    useAutoLogout(logout, "empleado", horarioApertura, horarioCierre);
    return (
        <div className="min-h-screen bg-gray-50">
            <DeliveryPanelHeader />
            <div className="flex">
                <DeliverySidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
