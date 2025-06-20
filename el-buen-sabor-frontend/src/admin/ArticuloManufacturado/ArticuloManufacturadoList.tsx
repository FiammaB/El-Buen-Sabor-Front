// src/components/ArticuloManufacturado/ArticuloManufacturadoList.tsx
import React, { useEffect, useState } from 'react';
import { ArticuloManufacturado } from '../../models/Articulos/ArticuloManufacturado';
import { ArticuloService } from '../../services/ArticuloService';
import ArticuloManufacturadoForm from './ArticuloManufacturadoForm'; // Importar el formulario
import SideBar from '../compontents/Sidebar';
import Header from '../compontents/AdminHeader';
import axios from "axios";

const ArticuloManufacturadoList: React.FC = () => {
  const [articulosManufacturados, setArticulosManufacturados] = useState<ArticuloManufacturado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false); // Estado para mostrar/ocultar formulario
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloManufacturado | null>(null); // Artículo a editar

  const articuloService = new ArticuloService();

  // Función para cargar los artículos (ahora puede ser reutilizada)
  const fetchArticulos = async () => {
    try {
      setLoading(true);
      const data = await articuloService.getAllArticulosManufacturados();//me falta esa función en el servicio
      setArticulosManufacturados(data);
    } catch (err) {
      setError('Error al cargar los artículos manufacturados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  const handleCreateClick = () => {
    setSelectedArticulo(null); // Limpiar cualquier artículo seleccionado para crear uno nuevo
    setShowForm(true); // Mostrar el formulario
  };

  const handleEditClick = async (articulo: ArticuloManufacturado) => {
    const articuloActualizado = await articuloService.getArticuloManufacturadoById(articulo.id!);
    setSelectedArticulo(articuloActualizado!);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: number, denominacion: string) => {
    if (window.confirm(`¿Estás seguro de eliminar (lógicamente) el artículo "${denominacion}"? Este no se mostrará en la lista.`)) {
      try {
        // Ahora llama al método de borrado lógico
        await articuloService.deleteArticuloManufacturado(id); // Este método ahora hará el borrado lógico
        fetchArticulos(); // Recargar la lista
        alert('Artículo eliminado lógicamente exitosamente.');
      } catch (err) {
        alert('Error al eliminar lógicamente el artículo.');
        console.error(err);
      }
    }
  };

  const handleToggleBaja = async (id:number, baja: boolean) => {
    try {
      setArticulosManufacturados(prev =>
          prev.map(a =>
              a.id === id ? { ...a, baja: baja } : a
          )
      );
      await axios.patch(`/api/articuloManufacturado/${id}/baja?baja=${baja}`);
    } catch (err) {
      alert("Error al actualizar el estado de disponibilidad.");
    }
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setSelectedArticulo(null);
    await fetchArticulos();
  };

  const handleFormCancel = () => {
    setShowForm(false); // Ocultar el formulario
    setSelectedArticulo(null); // Limpiar selección
  };

  if (loading) {
    return <p>Cargando artículos manufacturados...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <Header/>
      <div className='flex gap-8 px-4 py-[80px] max-w-7xl mx-auto'>
        <SideBar />
        <div className="articulo-manufacturado-list">
          <h2 className="text-2xl font-semibold mb-4">Gestión de Artículos Manufacturados</h2>

          {/* Botón de Crear Nuevo Artículo */}
          <button
            onClick={handleCreateClick}
            className="mb-6 px-6 py-2 text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Crear Nuevo Artículo
          </button>

          {/* Mostrar el formulario si showForm es true */}
          {showForm && (
            <div className="border border-gray-300 p-6 rounded mb-6 bg-white shadow">
              <ArticuloManufacturadoForm
                  articulo={selectedArticulo}
                  articulosManufacturados={articulosManufacturados}
                  onSave={handleFormSave}
                  onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* Listado de Artículos */}
          {articulosManufacturados.length === 0 ? (
            <p className="text-gray-500">No hay artículos manufacturados para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Denominación</th>
                    <th className="px-4 py-2 border">Precio Venta</th>
                    <th className="px-4 py-2 border">Descripción</th>
                    <th className="px-4 py-2 border">Tiempo Estimado (min)</th>
                    <th className="px-4 py-2 border">Categoría</th>
                    <th className="px-4 py-2 border">Imagen</th>
                    <th className="px-4 py-2 border">Disponible</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosManufacturados.map((articulo) => (
                    <tr key={articulo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{articulo.id}</td>
                      <td className="px-4 py-2 border">{articulo.denominacion}</td>
                      <td className="px-4 py-2 border">${articulo.precioVenta?.toFixed(2)}</td>
                      <td className="px-4 py-2 border">{articulo.descripcion}</td>
                      <td className="px-4 py-2 border">{articulo.tiempoEstimadoMinutos}</td>
                      <td className="px-4 py-2 border">{articulo.categoria?.denominacion || 'N/A'}</td>
                      <td className="px-4 py-2 border">
                        {articulo.imagen?.denominacion ? (
                          <img
                            src={articulo.imagen.denominacion}
                            alt={articulo.denominacion}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">Sin imagen</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <input
                            type="checkbox"
                            checked={!articulo.baja}
                            onChange={e => handleToggleBaja(articulo.id!, !e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-2 border space-x-2">
                        <button
                          onClick={() => handleEditClick(articulo)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(articulo.id!, articulo.denominacion)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticuloManufacturadoList;