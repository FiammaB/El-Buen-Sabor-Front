import { Outlet } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";
import DeliveryPanelHeader from "./DeliveryPanelHeader";

export default function DeliveryAdminLayout() {
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
