import React from "react";
import Ingredientes from "../admin/pages/ingredientes";

export default function IngredienteFormModal({ onClose, onCreate }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <Ingredientes modoAltaRapida onSave={onCreate} onCancel={onClose} />
            </div>
        </div>
    );
}
