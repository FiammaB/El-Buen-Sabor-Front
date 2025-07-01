"use client"

import { useEffect, useState } from "react";
import type { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo";
import { ArticuloService } from "../../services/ArticuloService";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { CategoriaService } from "../../services/CategoriaService.";
import { Categoria } from "../../models/Categoria/Categoria";
import { UnidadMedidaService } from "../../services/UnidadMedidaService";
import { UnidadMedida } from "../../models/Categoria/UnidadMedida";
import { uploadImage } from "../../services/imagenService.ts";
import { Imagen } from "../../models/Categoria/Imagen";

/** Componente principal */
export default function Ingredientes() {
  /* ------------------------------------------------------------------ */
  /* ----------------------------- STATE ------------------------------ */
  /* ------------------------------------------------------------------ */
  const [ingredientes, setIngredientes] = useState<ArticuloInsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Popup & edición
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<ArticuloInsumo | null>(null);

  // Form data (se reutiliza para crear y editar)
  const [formData, setFormData] = useState<Partial<ArticuloInsumo>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Listas auxiliares
  const [categoriasList, setCategoriasList] = useState<Categoria[]>([]);
  const [unidadMedidaList, setUnidadMedidaList] = useState<UnidadMedida[]>([]);

  /* ------------------------------------------------------------------ */
  /* ------------------------- SERVICES ------------------------------- */
  /* ------------------------------------------------------------------ */
  const articuloService = new ArticuloService();
  const categoriaService = new CategoriaService();
  const unidadMedidaService = new UnidadMedidaService();

  /* ------------------------------------------------------------------ */
  /* ---------------------- FETCH INITIAL DATA ------------------------ */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      await Promise.all([fetchIngredientes(), fetchCategorias(), fetchUnidadesMedida()]);
    })();
  }, []);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const data = await articuloService.getAllArticulosInsumo();
      setIngredientes(data);
    } catch (err) {
      setError("Error al cargar los ingredientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    const cats = await categoriaService.getAll();
    setCategoriasList(cats);
  };

  const fetchUnidadesMedida = async () => {
    const unidades = await unidadMedidaService.getAll();
    setUnidadMedidaList(unidades);
  };

  /* ------------------------------------------------------------------ */
  /* ---------------------- HANDLERS UTILITARIOS ---------------------- */
  /* ------------------------------------------------------------------ */
  const resetForm = () => {
    setFormData({});
    setPreviewImage(null);
  };

  const abrirPopupCrear = () => {
    resetForm();
    setEsEdicion(false);
    setIngredienteEditando(null);
    setMostrarFormulario(true);
    // Inicializa campos para un nuevo ingrediente
    setFormData((prev) => ({
      ...prev,
      esParaElaborar: false,
      precioVenta: 0, // Inicializa precioVenta a 0 para crear
    }));
  };

  function normalizarTexto(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
  }

  const abrirPopupEditar = (ing: ArticuloInsumo) => {
    setFormData({ ...ing }); // Carga todos los datos del ingrediente
    setIngredienteEditando(ing);
    setEsEdicion(true);
    setMostrarFormulario(true);
    // Establece la imagen de previsualización si existe
    if (ing.imagen?.denominacion) {
      setPreviewImage(ing.imagen.denominacion);
    } else {
      setPreviewImage(null);
    }
    // Asegura que esParaElaborar y precioVenta se carguen correctamente
    setFormData((prev) => ({
      ...prev,
      esParaElaborar: ing.esParaElaborar,
      precioVenta: ing.precioVenta, // Carga precioVenta existente
    }));
  };

  const cerrarPopup = () => {
    setMostrarFormulario(false);
    setIngredienteEditando(null);
    resetForm();
  };

  function normalizarTexto(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreviewImage(URL.createObjectURL(file));
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imagen: new Imagen(res.data.denominacion, res.data.id) }));
    } catch (err) {
      alert("Error al subir la imagen");
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* -------------------- CREAR / EDITAR INGREDIENTE ------------------ */
  /* ------------------------------------------------------------------ */
  const guardarIngrediente = async () => {
    // Validaciones detalladas
    const errores: string[] = [];

    if (!formData.denominacion?.trim()) errores.push("La denominación es obligatoria.");
    if (formData.precioCompra === undefined || formData.precioCompra <= 0)
      errores.push("El precio de compra debe ser mayor a 0.");
    if (formData.stockActual === undefined || formData.stockActual < 0)
      errores.push("El stock actual no puede ser negativo.");
    if (formData.stockMinimo === undefined || formData.stockMinimo < 0)
      errores.push("El stock mínimo no puede ser negativo.");
    if (formData.precioVenta === undefined || formData.precioVenta < 0) // <-- Validación para precioVenta
      errores.push("El precio de venta no puede ser negativo.");
    if (!formData.categoria?.id) errores.push("Debe seleccionar una categoría.");
    if (!formData.unidadMedida?.id) errores.push("Debe seleccionar una unidad de medida.");

    if (errores.length > 0) {
      alert("Errores en el formulario:\n" + errores.join("\n"));
      return;
    }

    const payload: ArticuloInsumo = {
      denominacion: formData.denominacion?.trim() || "",
      precioCompra: Number(formData.precioCompra) || 0,
      stockActual: Number(formData.stockActual) || 0,
      stockMinimo: Number(formData.stockMinimo) || 0,
      categoriaId: formData.categoria?.id || 0,
      unidadMedidaId: formData.unidadMedida?.id || 0,
      imagenId: formData.imagen?.id || 0,
      esParaElaborar: formData.esParaElaborar ?? false,
      precioVenta: Number(formData.precioVenta) || 0, // <--- USA EL VALOR DE formData.precioVenta
      id: esEdicion ? ingredienteEditando?.id : undefined,
      baja: esEdicion ? ingredienteEditando?.baja : false
    };

    const nombreNuevo = normalizarTexto(formData.denominacion || "");
    const esNombreRepetido = ingredientes.some((ing) => {
      if (esEdicion && ing.id === ingredienteEditando?.id) return false; // Ignorar si es el mismo en edición
      return normalizarTexto(ing.denominacion) === nombreNuevo;
    });
    if (esNombreRepetido) {
      alert("Ya existe un ingrediente con ese nombre");
      return;
    }

    try {
      if (esEdicion && ingredienteEditando?.id) {
        const actualizado = await articuloService.updateArticuloInsumo(ingredienteEditando.id, payload);
        setIngredientes((prev) => prev.map((i) => (i.id === actualizado.id ? actualizado : i)));
      } else {
        const creado = await articuloService.createArticuloInsumo(payload);
        setIngredientes((prev) => [...prev, creado]);
      }
      cerrarPopup();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al guardar el ingrediente (revisa la consola para más detalles)");
      console.error(err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* --------------------------- RENDER -------------------------------- */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl mb-6 font-bold">Administración de Ingredientes</h1>

        {/* BOTÓN NUEVO ING */}
        <button
          onClick={abrirPopupCrear}
          className="inline-flex items-center space-x-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 mb-6"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo ingrediente</span>
        </button>

        {/* TABLA */}
        {loading ? (
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" /> <span>Cargando...</span>
          </div>
        ) : error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "Denominación",
                    "Precio Compra",
                    "Precio Venta", // <-- NUEVA COLUMNA EN LA TABLA
                    "Stock Actual",
                    "Stock Mínimo",
                    "Es para Elaborar",
                    "Unidad",
                    "Categoría",
                    "Acciones",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredientes.map((ing) => (
                  <tr key={ing.id} className={`hover:bg-gray-50 ${ing.baja ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 whitespace-nowrap">{ing.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{ing.denominacion}</td>
                    <td className="px-4 py-3 whitespace-nowrap">${ing.precioCompra?.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">${ing.precioVenta?.toFixed(2)}</td> {/* <-- MOSTRAR PRECIO VENTA */}
                    <td className="px-4 py-3 whitespace-nowrap">{ing.stockActual ?? "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{ing.stockMinimo ?? "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ing.esParaElaborar ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{ing.unidadMedida?.denominacion ?? "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{ing.categoria?.denominacion ?? "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ing.baja ? (
                          <button
                            onClick={() => articuloService.toggleBaja(ing.id!, false).then(fetchIngredientes)}
                            className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => articuloService.deleteArticulo(ing.id!).then(fetchIngredientes)}
                              className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirPopupEditar(ing)}
                              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* POPUP FORM */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg relative">
              <button onClick={cerrarPopup} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold mb-4">
                {esEdicion ? `Editar ingrediente #${ingredienteEditando?.id}` : "Crear nuevo ingrediente"}
              </h2>

              {/* FORM FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Denominacion */}
                <input
                  type="text"
                  placeholder="Denominación"
                  value={formData.denominacion || ""}
                  onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
                  className="border border-gray-300 rounded p-2"
                />

                {/* Precio Compra */}
                <input
                  type="number"
                  placeholder="Precio de compra"
                  value={formData.precioCompra ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, precioCompra: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                  }
                  className="border border-gray-300 rounded p-2"
                />

                {/* Precio Venta */}
                <input // <-- NUEVO CAMPO PARA PRECIO DE VENTA
                  type="number"
                  placeholder="Precio de venta"
                  value={formData.precioVenta ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, precioVenta: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                  }
                  className="border border-gray-300 rounded p-2"
                  min={0}
                  step="0.01"
                />

                {/* Stock actual */}
                <input
                  type="number"
                  placeholder="Stock actual"
                  value={formData.stockActual ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stockActual: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                  }
                  className="border border-gray-300 rounded p-2"
                />

                {/* Stock mínimo */}
                <input
                  type="number"
                  placeholder="Stock mínimo"
                  value={formData.stockMinimo ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stockMinimo: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                  }
                  className="border border-gray-300 rounded p-2"
                />

                {/* Categoría */}
                <select
                    value={formData.categoria?.id ?? ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const cat = categoriasList.find((c) => c.id === id);
                      setFormData({ ...formData, categoria: cat });
                    }}
                    className="border border-gray-300 rounded p-2"
                >
                  <option value="" disabled>
                    Seleccione categoría
                  </option>
                  {categoriasList.map((c) => (
                      <option
                          key={c.id}
                          value={c.id}
                          disabled={c.baja === true}
                          style={c.baja ? { color: "#aaa" } : {}}
                      >
                        {c.denominacion}
                        {c.baja ? " (Dada de baja)" : ""}
                      </option>
                  ))}
                </select>


                {/* Unidad */}
                <select
                  value={formData.unidadMedida?.id ?? ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    const un = unidadMedidaList.find((u) => u.id === id);
                    setFormData({ ...formData, unidadMedida: un });
                  }}
                  className="border border-gray-300 rounded p-2"
                >
                  <option value="" disabled>
                    Seleccione unidad de medida
                  </option>
                  {unidadMedidaList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.denominacion}
                    </option>
                  ))}
                </select>

                {/* Checkbox para "Es para elaborar" */}
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="esParaElaborar"
                    checked={formData.esParaElaborar ?? false}
                    onChange={e => setFormData({ ...formData, esParaElaborar: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <label htmlFor="esParaElaborar" className="text-gray-700">¿Es para elaborar?</label>
                </div>

                {/* Campo de Imagen y Previsualización */}
                <div className="sm:col-span-2">
                  {previewImage && (
                    <div className="mb-2 w-32 h-32 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                      <img src={previewImage} alt="Previsualización" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="border border-gray-300 rounded p-2 w-full"
                  />
                  {isUploading && (
                    <div className="flex items-center text-gray-500 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Subiendo imagen...
                    </div>
                  )}
                </div>
              </div>

              {/* BOTONES */}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={guardarIngrediente} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                  {esEdicion ? "Guardar cambios" : "Crear ingrediente"}
                </button>
                <button onClick={cerrarPopup} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}