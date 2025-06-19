"use client"

import { useEffect, useState } from "react"
import type { ArticuloInsumo } from "../../models/Articulos/ArticuloInsumo"
import { ArticuloService } from "../../services/ArticuloService"
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react"
import { CategoriaService } from '../../services/CategoriaService.';
import { Categoria } from "../../models/Categoria/Categoria"
import { all } from "axios"
import SideBar from '../compontents/Sidebar';
import {uploadImage} from "../../services/imagenService.ts";

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState<ArticuloInsumo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [ingredienteEditando, setIngredienteEditando] = useState<ArticuloInsumo | null>(null)
  const [formData, setFormData] = useState<Partial<ArticuloInsumo>>({})
  const [nuevoIngrediente, setNuevoIngrediente] = useState<Partial<ArticuloInsumo>>({
    categoria: { id: 1, denominacion: "Default" },
    unidadMedida: { id: 1, denominacion: "Default" },
    imagen: { id: 1, denominacion: "Default" },
    stockActual: 0,
    stockMinimo: 0,
    precioCompra: 0,
  })
  const [categoriasList, setCategoriasList] = useState<Categoria[]>([])

  const articuloService = new ArticuloService()

  const fetchIngredientes = async () => {
    try {
      setLoading(true)
      const data = await articuloService.getAllArticulosInsumo()
      console.log("Ingredientes fetcheados: ", data)
      setIngredientes(data)
    } catch (err) {
      setError("Error al cargar los ingredientes.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await articuloService.deleteArticulo(id)
      // setIngredientes((prev) => prev.filter((ing) => ing.id !== id))
    } catch (error) {
      console.error(error)
      alert("Error al eliminar el ingrediente.")
    }
  }

  const editarIngrediente = (ingrediente: ArticuloInsumo) => {
    setIngredienteEditando(ingrediente)
    setFormData(ingrediente)
  }

  const guardarCambios = async () => {
    console.log("ENTRA", ingredienteEditando)
    if (!ingredienteEditando?.id) return
    try {
      const payload = {
        ...formData,
        categoriaId: formData.categoria?.id,
        unidadMedidaId: formData.unidadMedida?.id,
        imagenId: formData.imagen?.id,
      }
      console.log("Payload ", payload);
      const actualizado = await articuloService.updateArticuloInsumo(
        ingredienteEditando.id,
        payload as ArticuloInsumo
      )
      console.log("Articulo actualizado: ", actualizado)
      setIngredientes((prev) =>
        prev.map((i) => (i.id === actualizado.id ? actualizado : i))
      )
      setIngredienteEditando(null)
    } catch (err) {
      console.error("Error al actualizar:", err)
      alert("Hubo un error al actualizar el ingrediente.")
    }
  }


  const crearIngrediente = async () => {
    try {
      const payload = {
        ...nuevoIngrediente,
        categoriaId: nuevoIngrediente.categoria?.id || 1,
        unidadMedidaId: nuevoIngrediente.unidadMedida?.id || 1,
        imagenId: nuevoIngrediente.imagen?.id || 1,
      }
      const creado = await articuloService.createArticuloInsumo(payload as ArticuloInsumo)
      setIngredientes((prev) => [...prev, creado])
      setNuevoIngrediente(ingredienteVacio)
    } catch (err) {
      console.error("Error al crear:", err)
      alert("Hubo un error al crear el ingrediente.")
    }
  }

  useEffect(() => {
    fetchIngredientes()
    fetchCategorias();
  }, [])

  // LISTAR CATEGORIAS
  const categoriaService = new CategoriaService();
  const fetchCategorias = async () => {
    const allCategorias = await categoriaService.getAll()
    console.log("CATEGORIAS: ", allCategorias)
    setCategoriasList(allCategorias)
  }

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUploadNuevo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Llama al servicio, igual que en ArticuloManufacturadoForm
      const response = await uploadImage(file); // asegúrate de importar uploadImage
      const imagenSubida = response.data;
      setNuevoIngrediente(prev => ({
        ...prev,
        imagen: { id: imagenSubida.id, denominacion: imagenSubida.denominacion },
      }));
    } catch (error) {
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const ingredienteVacio: Partial<ArticuloInsumo> = {
    denominacion: "",
    precioCompra: 0,
    stockActual: 0,
    stockMinimo: 0,
    categoria: undefined,
    unidadMedida: undefined,
    imagen: undefined,
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex gap-8">
          <SideBar />
          <div>
            <h1 className="text-2xl mb-8 font-bold text-gray-900">
              Administración de Ingredientes
            </h1>
            {loading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando ingredientes...</span>
              </div>
            )}
            {error && <p className="text-red-600 font-medium">{error}</p>}

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Crear nuevo ingrediente</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={nuevoIngrediente.denominacion || ""}
                  onChange={(e) =>
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      denominacion: e.target.value,
                    })
                  }
                  placeholder="Denominación"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <input
                  type="number"
                  value={nuevoIngrediente.precioCompra || ""}
                  onChange={(e) =>
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      precioCompra: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Precio de compra"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <input
                  type="number"
                  value={nuevoIngrediente.stockActual || ""}
                  onChange={(e) =>
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      stockActual: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Stock actual"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <input
                  type="number"
                  value={nuevoIngrediente.stockMinimo || ""}
                  onChange={(e) =>
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      stockMinimo: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Stock mínimo"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                {/* <input
                type="number"
                value={nuevoIngrediente.categoria?.id || ""}
                onChange={(e) =>
                  setNuevoIngrediente({
                    ...nuevoIngrediente,
                    categoria: { id: parseInt(e.target.value), denominacion: nuevoIngrediente.categoria?.denominacion || "" }
                  })
                }
                placeholder="ID Categoría"
                className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              /> */}
                <select
                  value={nuevoIngrediente.categoria?.id ?? ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    const categoriaSeleccionada = categoriasList.find((c) => c.id === id);
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      categoria: {
                        id,
                        denominacion: categoriaSeleccionada?.denominacion || "",
                      },
                    });
                  }}
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="" disabled>
                    Seleccione categoría
                  </option>
                  {categoriasList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.denominacion}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={nuevoIngrediente.unidadMedida?.id || ""}
                  onChange={(e) =>
                    setNuevoIngrediente({
                      ...nuevoIngrediente,
                      unidadMedida: {
                        id: parseInt(e.target.value),
                        denominacion: nuevoIngrediente.unidadMedida?.denominacion || "",
                      },
                    })
                  }
                  placeholder="ID Unidad de medida"
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadNuevo}
                    disabled={isUploading}
                    className="w-full border border-gray-200 rounded-lg p-3"
                />
                {isUploading && <p>Subiendo imagen...</p>}
                {nuevoIngrediente.imagen?.denominacion && (
                    <div className="mt-2">
                      <img src={nuevoIngrediente.imagen.denominacion} alt="Imagen subida" className="w-32 h-32 object-cover border rounded"/>
                      <p className="text-xs text-gray-500">URL: {nuevoIngrediente.imagen.denominacion}</p>
                    </div>
                )}

              </div>

              <button
                onClick={crearIngrediente}
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-600 transition duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Crear ingrediente</span>
              </button>
            </section>

            {/* --- Tabla de Ingredientes --- */}
            <section className="bg-white rounded-2xl my-8 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Denominación
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Precio Compra
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Stock Actual
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Stock Mínimo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Unidad
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredientes.map((ingrediente) => (
                    <tr key={ingrediente.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{ingrediente.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ingrediente.denominacion}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">$
                        {ingrediente.precioCompra?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ingrediente.stockActual ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ingrediente.stockMinimo ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ingrediente.unidadMedida?.denominacion ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ingrediente.categoria?.denominacion ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() =>
                              ingrediente.id !== undefined &&
                              handleEliminar(ingrediente.id)
                            }
                            className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => editarIngrediente(ingrediente)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition duration-200"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* --- Editar Ingrediente --- */}
            {ingredienteEditando && (
              <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Editar ingrediente #{ingredienteEditando.id}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={formData.denominacion || ""}
                    onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
                    placeholder="Denominación"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <input
                    type="number"
                    value={formData.precioCompra || ""}
                    onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) })}
                    placeholder="Precio de compra"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <input
                    type="number"
                    value={formData.stockActual || ""}
                    onChange={(e) => setFormData({ ...formData, stockActual: parseFloat(e.target.value) })}
                    placeholder="Stock actual"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <input
                    type="number"
                    value={formData.stockMinimo || ""}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) })}
                    placeholder="Stock mínimo"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <select
                    value={formData.categoria?.id ?? ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const categoriaSeleccionada = categoriasList.find((c) => c.id === id);
                      setFormData({
                        ...formData,
                        categoria: {
                          id,
                          denominacion: categoriaSeleccionada?.denominacion || "",
                        },
                      });
                    }}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="" disabled>
                      Seleccione categoría
                    </option>
                    {categoriasList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.denominacion}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={formData.unidadMedida?.id || ""}
                    onChange={(e) => setFormData({ ...formData, unidadMedida: { id: parseInt(e.target.value), denominacion: formData.unidadMedida?.denominacion || "" } })}
                    placeholder="ID Unidad de medida"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <input
                    type="number"
                    value={formData.imagen?.id || ""}
                    onChange={(e) => setFormData({ ...formData, imagen: { id: parseInt(e.target.value), denominacion: formData.imagen?.denominacion || "" } })}
                    placeholder="ID Imagen"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={guardarCambios}
                    className="inline-flex items-center space-x-2 bg-green-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-600 transition duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => setIngredienteEditando(null)}
                    className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
