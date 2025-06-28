// src/components/promocion/PromocionPage.tsx
import React from "react";
import PromocionList from "./PromocionList";

const PromocionPage: React.FC = () => {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Promociones Disponibles</h2>
            <PromocionList />
        </div>
    );
};

export default PromocionPage;
