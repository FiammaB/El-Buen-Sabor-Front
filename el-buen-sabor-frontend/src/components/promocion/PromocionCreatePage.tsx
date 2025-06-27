// src/components/promocion/PromocionCreatePage.tsx (renombralo así)
import React from "react";
import PromocionForm from "./PromocionForm";

const PromocionCreatePage: React.FC = () => {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Crear Promoción</h2>
            <PromocionForm />
        </div>
    );
};

export default PromocionCreatePage;
