"use client";

import { useEffect, useMemo, useState } from "react";
import { ArticuloService } from "../../services/ArticuloService";
import type { ArticuloManufacturado } from "../../models/Articulos/ArticuloManufacturado";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  Clock,
} from "lucide-react";
import { useCart } from "../Cart/context/cart-context";
// import Link from "next/link";

/**
 * Página de "Explorar".
 * Lista todos los artículos manufacturados con búsqueda, filtros simples y paginación.
 * Colócala en `app/explorar/page.tsx` (o `/pages/explorar.tsx` si usas el router tradicional).
 */
export default function ExplorarPage() {
  const [articulos, setArticulos] = useState<ArticuloManufacturado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- filtros / búsqueda ----
  const [search, setSearch] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(
    null
  );

  // ---- paginación ----
  const pageSize = 12;
  const [page, setPage] = useState(1);

  const { addToCart, isInCart, getItemQuantity, removeFromCart } = useCart();

  // Servicio de artículos
  const service = new ArticuloService();

  const fetchArticulos = async () => {
    try {
      setLoading(true);
      const data = await service.findAllArticulosManufacturadosActivos();
      setArticulos(data);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  // ---------------------------
  // Derivados (memos)
  // ---------------------------
  const categorias = useMemo(() => {
    const set = new Set<string>();
    articulos.forEach((a) => {
      if (a.categoria?.denominacion) set.add(a.categoria!.denominacion);
    });
    return Array.from(set);
  }, [articulos]);

  const filtrados = useMemo(() => {
    let list = articulos;
    if (search.trim()) {
      list = list.filter((a) =>
        a.denominacion.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoriaSeleccionada) {
      list = list.filter(
        (a) => a.categoria?.denominacion === categoriaSeleccionada
      );
    }
    return list;
  }, [articulos, search, categoriaSeleccionada]);

  const totalPages = Math.ceil(filtrados.length / pageSize) || 1;
  const paginados = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtrados.slice(start, start + pageSize);
  }, [filtrados, page]);

  // ---------------------------
  // UI helpers
  // ---------------------------
  const BotonCategoria = ({ c }: { c: string }) => (
    <button
      onClick={() =>
        setCategoriaSeleccionada((prev) => (prev === c ? null : c))
      }
      className={`px-4 py-2 rounded-full border transition text-sm whitespace-nowrap ${categoriaSeleccionada === c
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-gray-700 hover:bg-orange-50 border-gray-300"
        }`}
    >
      {c}
    </button>
  );

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* header simple */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-4">
          <a href="/" className="p-2 -ml-2 hover:bg-orange-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Explorar productos</h1>
        </div>
      </header>

      {/* búsqueda */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            placeholder="Buscar por nombre…"
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button onClick={() => setSearch("")}> <X className="w-4 h-4 text-gray-500" /></button>
          )}
        </div>
      </section>

      {/* filtros de categoría */}
      {categorias.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-4 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {categorias.map((c) => (
              <BotonCategoria key={c} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* listado */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-b-transparent border-orange-500 rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No se encontraron productos.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginados.map((a) => (
                <div
                  key={a.id}
                  className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition group"
                >
                  <div className="relative">
                    <img
                      src={
                        a.imagen ? a.imagen.denominacion : "/placeholder.svg?height=200&width=300"
                      }
                      alt={a.denominacion}
                      className="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition"
                    />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow hover:bg-gray-50 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-400" />
                    </button>
                    {a.tiempoEstimadoMinutos && (
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {a.tiempoEstimadoMinutos} min
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {a.denominacion}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                      {a.descripcion || "Delicioso producto artesanal"}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-orange-500">
                        ${a.precioVenta}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(a)}
                          className={`p-2 rounded-full transition ${isInCart(a.id || 0)
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                        >
                          {isInCart(a.id || 0) ? (
                            <span className="text-xs font-bold">{getItemQuantity(a.id || 0)}</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                        {isInCart(a.id || 0) && (
                          <button
                            onClick={() => removeFromCart(a.id || 0)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Quitar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* paginación */}
            <div className="flex justify-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-full border flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="px-3 py-2 text-sm font-medium">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-full border flex items-center gap-1 disabled:opacity-40"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
