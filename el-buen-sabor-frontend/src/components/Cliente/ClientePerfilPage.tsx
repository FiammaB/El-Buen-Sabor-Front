//src/pages/cliente/ClientePerfilPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/Context/AuthContext";
import axios from "axios";
import {Pencil, PlusCircle, Trash2} from "lucide-react";
import type {IDomicilioDTO} from "../../models/DTO/IDomicilioDTO.ts";
import {DomicilioService} from "../../services/DomicilioService.ts";
import DomicilioFormModal from "./DomicilioFormModal.tsx";

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
  domicilios?: IDomicilioDTO[]; // Usamos el tipo IDomicilioDTO importado
};

export default function ClientePerfilPage() {
  const { email, id: userId, role } = useAuth();
  const [perfil, setPerfil] = useState<PerfilDTO | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Estados para la gestión de domicilios
  const [showDomicilioModal, setShowDomicilioModal] = useState(false);
  const [currentDomicilio, setCurrentDomicilio] = useState<IDomicilioDTO | null>(null);

  const domicilioService = new DomicilioService(); // Instancia del servicio de domicilios

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    passwordActual: "",
    nuevaPassword: "",
    repetirPassword: "",
  });

  // Función para cargar los datos del perfil y los domicilios asociados
  const fetchPerfilData = async () => {
    if (!email) return;
    try {
      setLoading(true);
      const res = await axios.get<PerfilDTO>(`http://localhost:8080/api/usuarios/perfil/${email}`);
      const p = res.data;
      setPerfil(p);
      setForm({
        nombre: p.nombre ?? "",
        apellido: p.apellido ?? "",
        telefono: p.telefono ?? "",
        fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.substring(0, 10) : "",
        passwordActual: "",
        nuevaPassword: "",
        repetirPassword: "",
      });
    } catch (error) {
      setMsg("No se pudieron cargar los datos del perfil.");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfilData(); // Llama a la función de carga al montar el componente o cambiar el email
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "nombre" || name === "apellido") {
      // Permitir solo letras y espacios en nombre y apellido
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        setMsg(`El campo ${name === "nombre" ? "Nombre" : "Apellido"} solo puede contener letras y espacios.`);
        return; // No actualizar el estado si la validación falla
      } else {
        setMsg(null); // Limpiar mensaje si la validación pasa
      }
    }

    if (name === "telefono") {
      // Permitir solo números en el teléfono
      if (!/^\d*$/.test(value)) {
        setMsg("El campo Teléfono solo puede contener números.");
        return; // No actualizar el estado si la validación falla
      } else {
        setMsg(null); // Limpiar mensaje si la validación pasa
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (pwd: string) => {
    return (
        pwd.length >= 8 &&
        /[A-Z]/.test(pwd) &&
        /[a-z]/.test(pwd) &&
        /[^A-Za-z0-9]/.test(pwd)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg(null);

    if (form.nuevaPassword || form.repetirPassword) {
      if (form.nuevaPassword !== form.repetirPassword) {
        setMsg("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
      if (!validatePassword(form.nuevaPassword)) {
        setMsg(
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo."
        );
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.put<PerfilDTO>(
          `http://localhost:8080/api/usuarios/perfil/${email}`,
          {
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            fechaNacimiento: form.fechaNacimiento,
            email: email,
            passwordActual: form.passwordActual || null,
            nuevaPassword: form.nuevaPassword || null,
            repetirPassword: form.repetirPassword || null,
          }
      );

      setPerfil(res.data);
      // Asumiendo que `login` está en tu AuthContext
      // Reemplaza `id` con `userId` si ya lo renombraste para evitar conflictos
      // Asegúrate de que los parámetros de `login` coincidan con lo que tu AuthContext espera
      // Por ejemplo: login(userId!, role!, `${res.data.nombre} ${res.data.apellido}`.trim(), res.data.usuario.email, res.data.telefono);

      setMsg("Perfil actualizado exitosamente.");
      setEditMode(false);
    } catch (error: any) {
      setMsg(
          error.response?.data?.error || "Error al actualizar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica para la gestión de domicilios ---

  const handleAddDomicilio = () => {
    setCurrentDomicilio({
      id: 0, // Un ID de 0 indica un nuevo domicilio
      calle: "",
      numero: 0,
      cp: 0,
      localidad: { id: 0, nombre: "", provincia: { id: 0, nombre: "", pais: { id: 0, nombre: "" } } }, // Inicializa con valores predeterminados
    });
    setShowDomicilioModal(true);
  };

  const handleEditDomicilio = (dom: IDomicilioDTO) => {
    setCurrentDomicilio({ ...dom }); // Crea una copia para editar
    setShowDomicilioModal(true);
  };

  const handleDeleteDomicilio = async (domicilioId: number | undefined) => {
    if (!domicilioId || !perfil || !window.confirm("¿Estás seguro de que quieres eliminar este domicilio?")) return;

    try {
      setLoading(true);
      await domicilioService.delete(domicilioId);
      setMsg("Domicilio eliminado exitosamente.");
      // Actualiza el perfil para reflejar la eliminación
      setPerfil(prev => ({
        ...(prev as PerfilDTO),
        domicilios: prev?.domicilios?.filter(d => d.id !== domicilioId)
      }));
    } catch (error: any) {
      setMsg(error.response?.data?.error || "Error al eliminar el domicilio.");
      console.error("Error deleting domicilio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomicilio = async (domicilio: IDomicilioDTO) => {
    if (!perfil || !perfil.id) {
      setMsg("Error: ID de persona no disponible para guardar domicilio.");
      return;
    }

    try {
      setLoading(true);
      let savedDomicilio: IDomicilioDTO;

      if (domicilio.id && domicilio.id !== 0) {
        // Es una edición
        savedDomicilio = await domicilioService.update(domicilio.id, domicilio);
        setMsg("Domicilio actualizado exitosamente.");
      } else {
        // Es una creación para la persona
        savedDomicilio = await domicilioService.createForPersona(perfil.id, domicilio);
        setMsg("Domicilio agregado exitosamente.");
      }

      // Actualiza el estado del perfil con el nuevo o actualizado domicilio
      setPerfil(prev => {
        const currentDomicilios = prev?.domicilios || [];
        if (domicilio.id && domicilio.id !== 0) {
          // Si es una edición, reemplaza el domicilio existente
          return {
            ...(prev as PerfilDTO),
            domicilios: currentDomicilios.map(d =>
                d.id === savedDomicilio.id ? savedDomicilio : d
            ),
          };
        } else {
          // Si es un nuevo domicilio, agrégalo a la lista
          return {
            ...(prev as PerfilDTO),
            domicilios: [...currentDomicilios, savedDomicilio],
          };
        }
      });
      setShowDomicilioModal(false);
      setCurrentDomicilio(null);
    } catch (error: any) {
      setMsg(error.response?.data?.error || "Error al guardar el domicilio.");
      console.error("Error saving domicilio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDomicilioEdit = () => {
    setShowDomicilioModal(false);
    setCurrentDomicilio(null);
  };

  if (loading || !perfil) {
    return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-600">Cargando perfil...</p>
        </div>
    );
  }

  // Vista de perfil (no edición)
  if (!editMode) {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8 relative">
          {/* Botón de lápiz */}
          <button
              onClick={() => setEditMode(true)}
              className="absolute top-4 right-4 text-gray-500 hover:text-orange-500"
              title="Editar perfil"
          >
            <Pencil size={20} />
          </button>

          {/* Avatar y título */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-orange-600 font-bold">
              {perfil.nombre?.charAt(0)}
              {perfil.apellido?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-orange-600">Mi Perfil</h2>
          </div>

          {/* Datos del perfil */}
          <div className="space-y-3">
            <div><b>Nombre:</b> {perfil.nombre}</div>
            <div><b>Apellido:</b> {perfil.apellido}</div>
            <div><b>Teléfono:</b> {perfil.telefono}</div>
            <div><b>Fecha de nacimiento:</b> {perfil.fechaNacimiento}</div>
            <div><b>Email:</b> {perfil.usuario.email}</div>
            <div><b>Usuario:</b> {perfil.usuario.username}</div>

            {/* Sección de Domicilios */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex justify-between items-center">
                Domicilios registrados
                <button
                    onClick={handleAddDomicilio}
                    className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-orange-600"
                    title="Agregar nuevo domicilio"
                >
                  <PlusCircle size={16} /> Agregar
                </button>
              </h3>
              {perfil.domicilios && perfil.domicilios.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {perfil.domicilios.map((dom) => (
                        <div key={dom.id} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
                          <div>
                            <div>
                              <b>{dom.calle}</b> {dom.numero} ({dom.cp})
                            </div>
                            <div className="text-sm text-gray-600">
                              {dom.localidad?.nombre}, {dom.localidad?.provincia?.nombre}, {dom.localidad?.provincia?.pais?.nombre}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                                onClick={() => handleEditDomicilio(dom)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Editar domicilio"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => handleDeleteDomicilio(dom.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Eliminar domicilio"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm mt-2">No hay domicilios registrados.</p>
              )}
            </div>
          </div>

          {msg && (
              <div
                  className={`my-4 text-sm ${
                      msg.includes("exitosamente") ? "text-green-600" : "text-red-600"
                  }`}
              >
                {msg}
              </div>
          )}

          {/* Modal de Domicilio */}
          {showDomicilioModal && currentDomicilio && (
              <DomicilioFormModal
                  domicilio={currentDomicilio}
                  onSave={handleSaveDomicilio}
                  onCancel={handleCancelDomicilioEdit}
              />
          )}
        </div>
    );
  }

  // Vista de edición de perfil (sin cambios en esta parte, solo se mantiene)
  return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Nombre</label>
            <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
            />
          </div>
          <div>
            <label className="font-medium">Apellido</label>
            <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
            />
          </div>
          <div>
            <label className="font-medium">Teléfono</label>
            <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
            />
          </div>
          <div>
            <label className="font-medium">Fecha de nacimiento</label>
            <input
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
            />
          </div>

          {/* Contraseña opcional */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Cambiar Contraseña (opcional)</h3>
            <div>
              <label className="font-medium">Contraseña actual</label>
              <input
                  type="password"
                  name="passwordActual"
                  value={form.passwordActual}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="font-medium">Nueva contraseña</label>
              <input
                  type="password"
                  name="nuevaPassword"
                  value={form.nuevaPassword}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="font-medium">Repetir nueva contraseña</label>
              <input
                  type="password"
                  name="repetirPassword"
                  value={form.repetirPassword}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Guardar Cambios
            </button>
            <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setMsg(null);
                  fetchPerfilData(); // Recarga el perfil para descartar cambios no guardados
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
        {msg && (
            <div
                className={`my-4 text-sm ${
                    msg.includes("exitosamente") ? "text-green-600" : "text-red-600"
                }`}
            >
              {msg}
            </div>
        )}
      </div>
  );
}