import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.tsx";
import axios from "axios";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { IDomicilioDTO } from "../../../models/DTO/IDomicilioDTO";
import { DomicilioService } from "../../../services/DomicilioService";
import DomicilioFormModal from "../../Cliente/DomicilioFormModal";

type PerfilGeneralDTO = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string;
  usuario: {
    email: string;
    username: string;
    rol: string;
    baja: boolean;
  };
  domicilios?: IDomicilioDTO[];
};

export default function PerfilCajeroPage() {
  const { email, id: userId, role, login } = useAuth();
  const [perfil, setPerfil] = useState<PerfilGeneralDTO | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [showDomicilioModal, setShowDomicilioModal] = useState(false);
  const [currentDomicilio, setCurrentDomicilio] = useState<IDomicilioDTO | null>(null);

  const domicilioService = new DomicilioService();

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
    if (!email) {
      setMsg("Error: Email de usuario no disponible para cargar el perfil.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Endpoint general para obtener el perfil por email
      const res = await axios.get<PerfilGeneralDTO>(`http://localhost:8080/api/usuarios/perfil/${email}`);

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
    } catch (error: any) {
      setMsg(error.response?.data?.error || "No se pudieron cargar los datos del perfil.");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchPerfilData();
    }
  }, [email]); // Dependencia: email

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
      // Endpoint de actualización: asumiendo que también es general por email
      const res = await axios.put<PerfilGeneralDTO>(
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
      login(userId!, role!, `${res.data.nombre} ${res.data.apellido}`.trim(), res.data.usuario.email, res.data.telefono, res.data.usuario.baja);

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

  // --- Lógica para la gestión de domicilios (adaptada para un solo domicilio para cajero) ---
  const handleAddOrEditDomicilio = () => {
    // Si el cajero ya tiene un domicilio, lo editamos. Si no, creamos uno nuevo.
    setCurrentDomicilio(perfil?.domicilios && perfil.domicilios.length > 0
        ? { ...perfil.domicilios[0] } // Copia el domicilio existente para editar
        : { // Nuevo domicilio
          id: 0,
          calle: "",
          numero: 0,
          cp: 0,
          localidad: { id: 0, nombre: "", provincia: { id: 0, nombre: "", pais: { id: 0, nombre: "" } } },
        }
    );
    setShowDomicilioModal(true);
  };

  const handleDeleteDomicilio = async (domicilioId: number | undefined) => {
    // Verificar si el domicilio tiene un ID y el userId está disponible
    if (!domicilioId || !userId || !window.confirm("¿Estás seguro de que quieres eliminar tu domicilio?")) return;

    try {
      setLoading(true);
      await domicilioService.delete(domicilioId); // Eliminar el domicilio
      setMsg("Domicilio eliminado exitosamente.");
      // Actualizar el estado del perfil para eliminar el domicilio
      setPerfil(prev => ({
        ...(prev as PerfilGeneralDTO),
        domicilios: []
      }));
    } catch (error: any) {
      setMsg(error.response?.data?.error || "Error al eliminar el domicilio.");
      console.error("Error deleting domicilio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomicilio = async (domicilio: IDomicilioDTO) => {
    if (!userId) { // userId es el ID de la Persona (cajero)
      setMsg("Error: ID de usuario no disponible para guardar domicilio.");
      return;
    }

    try {
      setLoading(true);
      let savedDomicilio: IDomicilioDTO;

      if (domicilio.id && domicilio.id !== 0) {
        // Es una edición: actualiza el domicilio existente por su ID
        savedDomicilio = await domicilioService.update(domicilio.id, domicilio);
        setMsg("Domicilio actualizado exitosamente.");
      } else {
        // Es una creación: asocia un nuevo domicilio a esta persona (cajero)
        savedDomicilio = await domicilioService.createForPersona(userId, domicilio);
        setMsg("Domicilio agregado exitosamente.");
      }

      // Actualizar el perfil: reemplaza la lista de domicilios con el domicilio guardado/creado
      setPerfil(prev => ({
        ...(prev as PerfilGeneralDTO),
        domicilios: [savedDomicilio], // Ahora el cajero tiene este único domicilio
      }));
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

  // Renderizado Condicional
  if (loading || !perfil) {
    return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-600">Cargando perfil...</p>
        </div>
    );
  }

  // Determinar si el cajero tiene al menos un domicilio
  const hasDomicilio = perfil.domicilios && perfil.domicilios.length > 0;
  // Obtener el primer (y único) domicilio si existe
  const currentDisplayedDomicilio = hasDomicilio ? perfil.domicilios[0] : null;

  // Vista de perfil (no edición)
  if (!editMode) {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8 relative">
          <button
              onClick={() => setEditMode(true)}
              className="absolute top-4 right-4 text-gray-500 hover:text-purple-500"
              title="Editar perfil"
          >
            <Pencil size={20} />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-purple-600 font-bold">
              {perfil.nombre?.charAt(0)}
              {perfil.apellido?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-purple-600">Mi Perfil (Cajero) 💵</h2>
          </div>

          <div className="space-y-3">
            <div><b>Nombre:</b> {perfil.nombre}</div>
            <div><b>Apellido:</b> {perfil.apellido}</div>
            <div><b>Teléfono:</b> {perfil.telefono}</div>
            <div><b>Fecha de nacimiento:</b> {perfil.fechaNacimiento}</div>
            {/* Usar optional chaining para evitar errores si usuario o email son undefined */}
            <div><b>Email:</b> {perfil.usuario?.email}</div>
            <div><b>Usuario:</b> {perfil.usuario?.username}</div>

            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex justify-between items-center">
                Domicilio registrado
                {/* Condición para mostrar el botón "Agregar" solo si NO hay domicilio */}
                {!hasDomicilio && (
                    <button
                        onClick={handleAddOrEditDomicilio}
                        className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-purple-700"
                        title="Agregar nuevo domicilio"
                    >
                      <PlusCircle size={16} /> Agregar Domicilio
                    </button>
                )}
              </h3>
              {currentDisplayedDomicilio ? (
                  <div className="p-3 border rounded-md bg-gray-50 flex justify-between items-center mt-3">
                    <div>
                      <div>
                        <b>{currentDisplayedDomicilio.calle}</b> {currentDisplayedDomicilio.numero} ({currentDisplayedDomicilio.cp})
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentDisplayedDomicilio.localidad?.nombre}, {currentDisplayedDomicilio.localidad?.provincia?.nombre}, {currentDisplayedDomicilio.localidad?.provincia?.pais?.nombre}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                          onClick={handleAddOrEditDomicilio} // Ahora este botón edita el único domicilio
                          className="text-blue-500 hover:text-blue-700"
                          title="Editar domicilio"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                          onClick={() => handleDeleteDomicilio(currentDisplayedDomicilio.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar domicilio"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
              ) : (
                  // Mensaje si no hay domicilio y el botón "Agregar" SÍ está visible
                  <p className="text-gray-500 text-sm mt-2">No hay domicilio registrado. Haz clic en "Agregar Domicilio" para añadir uno.</p>
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
        <h2 className="text-2xl font-bold mb-6 text-purple-600">Editar Perfil</h2>
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
                  fetchPerfilData();
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