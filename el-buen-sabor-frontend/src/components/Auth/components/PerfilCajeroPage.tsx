import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

type PerfilDTO = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string;
  usuario: {
    email: string;
    username: string;
    rol: string;
  };
  domicilio?: {
    calle: string;
    numero: number;
    cp: string;
    localidad?: {
      nombre: string;
    };
  };
};

export default function PerfilCajeroPage() {
  const { email } = useAuth();
  const [perfil, setPerfil] = useState<PerfilDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    const fetchPerfil = async () => {
      try {
        const res = await axios.get<PerfilDTO>(
          `http://localhost:8080/api/usuarios/perfil/${email}`
        );
        setPerfil(res.data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [email]);

  if (loading) return <p className="p-4 text-gray-600">Cargando perfil...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!perfil) return <p className="p-4 text-gray-600">Perfil no encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Perfil del Cajero 💵</h1>

      <div className="space-y-4">
        <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}</p>
        <p><strong>Teléfono:</strong> {perfil.telefono || "No especificado"}</p>
        <p><strong>Fecha de Nacimiento:</strong> {perfil.fechaNacimiento || "No especificada"}</p>
        <p><strong>Email:</strong> {perfil.usuario?.email}</p>
        <p><strong>Usuario:</strong> {perfil.usuario?.username}</p>
        <p><strong>Rol:</strong> {perfil.usuario?.rol}</p>

        {perfil.domicilio && (
          <div className="mt-4">
            <h3 className="font-semibold">Domicilio Principal</h3>
            <p>{perfil.domicilio.calle} {perfil.domicilio.numero}</p>
            <p>
              {perfil.domicilio.localidad?.nombre || ""} ({perfil.domicilio.cp})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
