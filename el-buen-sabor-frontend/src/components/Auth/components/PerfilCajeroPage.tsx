import { useEffect, useState } from "react";
import {useAuth} from "../Context/AuthContext.tsx";
import type {UsuarioDTO} from "../../../models/DTO/UsuarioDTO.ts";
import type {IClienteDTO} from "../../../models/DTO/IClienteDTO.ts";
import {UsuarioService} from "../../../services/UsuarioService.ts";
import {ClienteService} from "../../../services/ClienteService.ts";


export default function PerfilCajeroPage() {
  const { id, email, username } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [persona, setPersona] = useState<IClienteDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      try {
        const usuarioService = new UsuarioService();
        const clienteService = new ClienteService();

        let user: UsuarioDTO | null = null;
        let person: IClienteDTO | null = null;

        // Buscar usuario por ID, sino por email
        const usuarios = await usuarioService.getAllUsuarios();
        if (id) {
          user = usuarios.find(u => u.id === id && u.rol === "CAJERO") || null;
        } else if (email) {
          user = usuarios.find(u => u.email === email && u.rol === "CAJERO") || null;
        }

        // Buscar persona/cliente por emailUsuario
        if (user?.email) {
          const clientes = await clienteService.getAllClientes();
          person = clientes.find(c => c.emailUsuario === user.email) || null;
        }

        setUsuario(user);
        setPersona(person);
      } catch (err) {
        setUsuario(null);
        setPersona(null);
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar si hay id o email
    if (id || email) {
      fetchPerfil();
    } else {
      setLoading(false);
    }
  }, [id, email]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-72">
          <span className="text-gray-600 text-lg">Cargando tu perfil...</span>
        </div>
    );
  }

  if (!usuario) {
    return (
        <div className="flex items-center justify-center h-72">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded shadow">
            No se pudieron cargar tus datos de usuario.
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-lg mx-auto mt-10 bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Perfil de Cajero</h2>
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">Datos de Usuario</h3>
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-gray-500">ID:</div>
            <div>{usuario.id}</div>
            <div className="text-gray-500">Username:</div>
            <div>{usuario.username}</div>
            <div className="text-gray-500">Email:</div>
            <div>{usuario.email}</div>
            <div className="text-gray-500">Rol:</div>
            <div>{usuario.rol}</div>
            <div className="text-gray-500">Estado:</div>
            <div>{usuario.baja ? "Inactivo" : "Activo"}</div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-800">Datos Personales</h3>
          {persona ? (
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-gray-500">Nombre:</div>
                <div>{persona.nombre}</div>
                <div className="text-gray-500">Apellido:</div>
                <div>{persona.apellido}</div>
                <div className="text-gray-500">Teléfono:</div>
                <div>{persona.telefono}</div>
                <div className="text-gray-500">Fecha Nacimiento:</div>
                <div>{persona.fechaNacimiento?.substring(0, 10) || "-"}</div>
              </div>
          ) : (
              <div className="text-gray-500">No se encontraron datos personales.</div>
          )}
        </div>
      </div>
  );
}