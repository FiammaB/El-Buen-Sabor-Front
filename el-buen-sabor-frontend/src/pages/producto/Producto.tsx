"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShoppingCart } from "lucide-react"

interface Producto {
  id: number
  denominacion: string
  descripcion: string
  precioVenta: number
  imagen?: {
    url: string
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/articulos/${id}`)
        if (!res.ok) throw new Error("Producto no encontrado")
        const data = await res.json()
        setProducto(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProducto()
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!producto) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="text-blue-500 mb-4 hover:underline">
        ← Volver atrás
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 flex items-center justify-center p-4">
          {producto.imagen?.url ? (
            <img src={producto.imagen.url} alt={producto.denominacion} className="w-full object-contain h-72" />
          ) : (
            <div className="text-gray-400">Sin imagen</div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{producto.denominacion}</h1>
          <p className="text-gray-600 mb-4">{producto.descripcion}</p>
          <p className="text-2xl font-semibold text-orange-500 mb-6">${producto.precioVenta.toFixed(2)}</p>

          <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
