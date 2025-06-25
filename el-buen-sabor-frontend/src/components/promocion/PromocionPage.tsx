// src/pages/PromocionPage.tsx
import React from "react";
import PromocionForm from "../../components/promocion/PromocionForm";

const PromocionPage: React.FC = () => {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Crear Promoción</h2>
            <PromocionForm />
        </div>
    );
};

export default PromocionPage;
